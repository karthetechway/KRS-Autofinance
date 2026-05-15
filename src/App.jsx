import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Home, 
  Plus, 
  Search, 
  Settings, 
  Bell, 
  LogOut, 
  CreditCard, 
  FileText,
  BarChart3,
  ShieldCheck,
  FileCheck,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { format, isToday, addMonths } from 'date-fns';

// Firebase
import { auth, db, storage } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LoanRegistration from './components/LoanRegistration';
import CustomerDatabase from './components/CustomerDatabase';
import CollectionSheet from './components/CollectionSheet';
import Ledger from './components/Ledger';
import PaymentReports from './components/PaymentReports';
import Login from './components/Login';

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication Tracking
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
      if (user) {
        setShowBriefing(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore Sync
  useEffect(() => {
    if (!user) {
      setCustomers([]);
      return;
    }
    
    const q = query(collection(db, "customers"), orderBy("onboardingDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setCustomers(data);
    });

    return () => unsubscribe();
  }, [user]);

  const addLoan = async (loanData) => {
    try {
      const newCustomer = {
        ...loanData,
        status: 'active',
        onboardingDate: new Date().toISOString(),
        loanStartDate: loanData.loanStartDate || new Date().toISOString(),
        paymentHistory: [],
        partialEMIPaid: 0,
        paidEMI: parseInt(loanData.paidEMI || 0),
        customId: `KRS-${Math.floor(1000 + Math.random() * 9000)}`
      };
      await addDoc(collection(db, "customers"), newCustomer);
      setActiveTab('customers');
    } catch (err) {
      console.error("Error adding loan:", err);
      alert("Failed to save to cloud. Check internet connection.");
    }
  };

  const updateCustomer = async (updatedData) => {
    try {
      const { id, ...data } = updatedData;
      await updateDoc(doc(db, "customers", id), {
        ...data,
        paidEMI: parseInt(data.paidEMI || 0)
      });
      setEditingCustomer(null);
      setActiveTab('customers');
    } catch (err) {
      console.error("Error updating customer:", err);
    }
  };

  const recordPayment = async (customerId, paymentData) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      let paidEMI = parseInt(customer.paidEMI || 0);
      let partialEMIPaid = parseFloat(customer.partialEMIPaid || 0);
      let nextDueDate = customer.nextDueDate;
      let totalLateFeesPaid = parseFloat(customer.totalLateFeesPaid || 0);
      
      const emiPaidNow = parseFloat(paymentData.emiPaid || 0);
      const lateFeesPaidNow = parseFloat(paymentData.lateFeesPaid || 0);
      
      let totalEMIContributed = partialEMIPaid + emiPaidNow;
      const emiCost = parseFloat(customer.emiAmount);
      
      const payments = [];
      let currentPaidEMI = paidEMI;
      let currentNextDueDate = nextDueDate;

      if (paymentData.isBackfill) {
        // Just record history, don't change status
        const paymentRecord = {
          id: `PAY-${Date.now().toString().slice(-6)}-B`,
          date: paymentData.date,
          amount: emiPaidNow + lateFeesPaidNow,
          emiPaid: emiPaidNow,
          lateFeesPaid: lateFeesPaidNow,
          type: 'Historical Adjustment',
          installmentNumber: 'Past',
          customerName: customer.name,
          vehicleNumber: customer.vehicleNumber
        };
        payments.push(paymentRecord);
      } else {
        while (totalEMIContributed >= emiCost && currentPaidEMI < customer.emiMonths) {
          currentPaidEMI += 1;
          totalEMIContributed -= emiCost;
          
          const paymentRecord = {
            id: `PAY-${Date.now().toString().slice(-6)}-${currentPaidEMI}`,
            date: paymentData.date,
            amount: emiCost + (payments.length === 0 ? lateFeesPaidNow : 0),
            emiPaid: emiCost,
            lateFeesPaid: payments.length === 0 ? lateFeesPaidNow : 0,
            type: 'EMI Payment',
            installmentNumber: currentPaidEMI,
            customerName: customer.name,
            vehicleNumber: customer.vehicleNumber
          };
          payments.push(paymentRecord);
          currentNextDueDate = format(addMonths(new Date(currentNextDueDate), 1), 'yyyy-MM-dd');
        }

        // If no full installments were added (Partial Payment)
        if (payments.length === 0 && emiPaidNow > 0) {
          payments.push({
            id: `PAY-${Date.now().toString().slice(-6)}-P`,
            date: paymentData.date,
            amount: emiPaidNow + lateFeesPaidNow,
            emiPaid: emiPaidNow,
            lateFeesPaid: lateFeesPaidNow,
            type: 'Partial Payment',
            installmentNumber: currentPaidEMI + 1,
            customerName: customer.name,
            vehicleNumber: customer.vehicleNumber
          });
        }
      }

      await updateDoc(doc(db, "customers", customerId), {
        paidEMI: currentPaidEMI,
        partialEMIPaid: totalEMIContributed,
        nextDueDate: currentNextDueDate,
        totalLateFeesPaid: totalLateFeesPaid + lateFeesPaidNow,
        paymentHistory: [...payments, ...(customer.paymentHistory || [])]
      });
    } catch (err) {
      console.error("Error recording payment:", err);
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      if (window.confirm("Are you sure you want to PERMANENTLY DELETE this customer and ALL their associated files (Photos, RC copies, Aadhar)? This cannot be undone.")) {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;

        // List of potential file fields
        const fileFields = ['photo', 'rcFront', 'rcBack', 'aadharFront', 'aadharBack'];
        
        // Delete each file from storage if it exists
        for (const field of fileFields) {
          const fileUrl = customer[field];
          if (fileUrl && typeof fileUrl === 'string' && fileUrl.startsWith('http')) {
            try {
              const fileRef = ref(storage, fileUrl);
              await deleteObject(fileRef);
              console.log(`Deleted file: ${field}`);
            } catch (storageErr) {
              console.warn(`Could not delete storage file for ${field}:`, storageErr);
            }
          }
        }

        // Delete the firestore document
        await deleteDoc(doc(db, "customers", customerId));
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("Failed to delete record.");
    }
  };

  const closeAccount = async (customerId, closureData) => {
    try {
      await updateDoc(doc(db, "customers", customerId), {
        status: 'closed',
        ...closureData
      });
    } catch (err) {
      console.error("Error closing account:", err);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setActiveTab('new-loan');
  };

  const handleImport = async (importedData) => {
    try {
      for (const item of importedData) {
        await addDoc(collection(db, "customers"), {
          ...item,
          status: item.status || 'active',
          onboardingDate: item.onboardingDate || new Date().toISOString(),
          paymentHistory: item.paymentHistory || [],
          partialEMIPaid: item.partialEMIPaid || 0
        });
      }
    } catch (err) {
      console.error("Error importing:", err);
    }
  };

  const handleLogout = () => signOut(auth);

  if (authLoading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
      <Loader2 className="animate-spin" color="var(--accent-main)" size={48} />
    </div>
  );

  if (!user) return <Login />;

  return (
    <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
          setIsSidebarOpen(false);
        }} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <main className="main-container">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="h2" style={{ margin: 0 }}>
                {activeTab === 'dashboard' && 'Home'}
                {activeTab === 'new-loan' && 'Customer Addition'}
                {activeTab === 'customers' && 'Customer Ledger'}
                {activeTab === 'collections' && 'EMI Collection'}
                {activeTab === 'ledger' && 'Payment History'}
              </h1>
              <p className="label" style={{ margin: 0, color: 'var(--accent-main)', fontSize: '10px' }}>KRS Auto Finance Control Panel</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {activeTab !== 'new-loan' && (
              <div style={{ position: 'relative' }}>
                <Search className="text-muted" size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search name, phone, vehicle..." 
                  className="input-modern"
                  style={{ width: '300px', background: 'rgba(255,255,255,0.02)', paddingLeft: '48px' }}
                  value={searchQuery}
                  onFocus={() => setShowResults(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                />
                {searchQuery && showResults && (
                  <div className="card animate-fade" style={{ position: 'absolute', top: '120%', left: 0, right: 0, zIndex: 1000, padding: '8px', maxHeight: '400px', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                    {customers.filter(c => {
                      const q = searchQuery.toLowerCase().trim();
                      return String(c.name || "").toLowerCase().includes(q) || 
                             String(c.phone || "").includes(q) || 
                             String(c.vehicleNumber || "").toLowerCase().includes(q) ||
                             String(c.customId || "").toLowerCase().includes(q);
                    }).slice(0, 8).map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveTab('customers');
                          setSearchQuery(c.name);
                          setShowResults(false);
                        }}
                        style={{ width: '100%', textAlign: 'left', padding: '12px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div>
                          <p className="font-black" style={{ fontSize: '14px', color: 'var(--text-main)' }}>{c.name}</p>
                          <p className="label" style={{ fontSize: '10px', margin: 0 }}>{c.vehicleNumber} • {c.phone}</p>
                        </div>
                        <span className="badge" style={{ fontSize: '9px' }}>{c.customId || c.id.slice(0,6)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab !== 'new-loan' && (
              <button 
                onClick={() => {
                  setEditingCustomer(null);
                  setActiveTab('new-loan');
                }} 
                className="btn-primary" 
                style={{ padding: '0 24px', height: '48px', width: 'auto', fontSize: '12px' }}
              >
                <Plus size={18} /> NEW RECORD
              </button>
            )}
          </div>
        </header>

        <section className="content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  customers={customers} 
                  searchQuery={searchQuery} 
                  onNavigateToCustomer={(name) => {
                    setActiveTab('customers');
                    setSearchQuery(name);
                    setShowResults(false);
                  }}
                />
              )}
              {activeTab === 'new-loan' && <LoanRegistration onAdd={addLoan} onUpdate={updateCustomer} editingCustomer={editingCustomer} onCancel={() => { setEditingCustomer(null); setActiveTab('customers'); }} />}
              {activeTab === 'customers' && <CustomerDatabase customers={customers.filter(c => c.status !== 'closed')} searchQuery={searchQuery} onSearchChange={setSearchQuery} onImport={handleImport}  onAdd={addLoan} onEdit={handleEdit} onCloseAccount={closeAccount} onDelete={deleteCustomer} onNavigate={setActiveTab} />}
              {activeTab === 'collections' && <CollectionSheet customers={customers} onPay={recordPayment} searchQuery={searchQuery} />}
              {activeTab === 'pending' && <CustomerDatabase customers={customers.filter(c => c.partialEMIPaid > 0)} searchQuery={searchQuery} onSearchChange={setSearchQuery} onImport={handleImport}  onAdd={addLoan} onEdit={handleEdit} onCloseAccount={closeAccount} isPartialView={true} onPay={recordPayment} onNavigate={setActiveTab} onDelete={deleteCustomer} />}
              {activeTab === 'ledger' && <Ledger customers={customers} searchQuery={searchQuery} />}
              {activeTab === 'reports' && <PaymentReports customers={customers} />}
              {activeTab === 'closed' && <CustomerDatabase customers={customers.filter(c => c.status === 'closed')} searchQuery={searchQuery} onSearchChange={setSearchQuery} onImport={handleImport}  onAdd={addLoan} onEdit={handleEdit} isClosedView={true} onNavigate={setActiveTab} onDelete={deleteCustomer} />}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <AnimatePresence>
        {showBriefing && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="modal-content" style={{ maxWidth: '640px' }}>
              <button className="close-btn" onClick={() => setShowBriefing(false)}>
                <X size={18} />
              </button>
              <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', background: 'rgba(255,61,94,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="h3">System Briefing</h2>
                    <p className="label" style={{ margin: 0 }}>{format(new Date(), 'EEEE, do MMMM')}</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '32px' }}>
                <p className="label" style={{ marginBottom: '16px' }}>Dues Pending Today</p>
                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {customers.filter(c => isToday(new Date(c.nextDueDate))).map(c => (
                    <div key={c.id} className="card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p className="font-black" style={{ fontSize: '20px' }}>{c.name}</p>
                        <p className="label" style={{ margin: 0, fontSize: '13px' }}>{c.vehicleNumber}</p>
                      </div>
                      <p className="text-accent font-black" style={{ fontSize: '24px' }}>₹{c.emiAmount}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setShowBriefing(false); setActiveTab('collections'); }} className="btn-primary" style={{ marginTop: '32px' }}>Start Collections</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
