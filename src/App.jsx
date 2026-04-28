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
  X
} from 'lucide-react';
import { format, isToday, addMonths } from 'date-fns';
import { calculateEMI } from './utils/finance';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LoanRegistration from './components/LoanRegistration';
import CustomerDatabase from './components/CustomerDatabase';
import CollectionSheet from './components/CollectionSheet';
import Ledger from './components/Ledger';
import PaymentReports from './components/PaymentReports';
import Analytics from './components/Analytics';
import Login from './components/Login';
import ImportPortal from './components/ImportPortal';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('krs_auth') === 'true';
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('krs_customers');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('krs_customers', JSON.stringify(customers));
  }, [customers]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('krs_auth', 'true');
    setShowBriefing(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('krs_auth', 'false');
  };

  const addLoan = (loanData) => {
    const newCustomer = {
      id: `KRS-${Math.floor(1000 + Math.random() * 9000)}`,
      ...loanData,
      status: 'active',
      onboardingDate: new Date().toISOString(),
      paymentHistory: []
    };
    setCustomers([...customers, newCustomer]);
    setActiveTab('customers');
  };

  const recordPayment = (customerId, paymentData) => {
    // paymentData: { emiPaid, lateFeesPaid, date }
    const updated = customers.map(c => {
      if (c.id === customerId) {
        let { paidEMI, partialEMIPaid = 0, nextDueDate, totalLateFeesPaid = 0 } = c;
        const emiPaidNow = parseFloat(paymentData.emiPaid || 0);
        const lateFeesPaidNow = parseFloat(paymentData.lateFeesPaid || 0);
        
        // Handle EMI Payment (Partial support)
        let totalEMIContributed = (parseFloat(partialEMIPaid) || 0) + emiPaidNow;
        const emiCost = parseFloat(c.emiAmount);
        
        let installmentsAdded = 0;
        while (totalEMIContributed >= emiCost && paidEMI < c.emiMonths) {
          paidEMI += 1;
          totalEMIContributed -= emiCost;
          installmentsAdded += 1;
          // Update due date
          nextDueDate = format(addMonths(new Date(nextDueDate), 1), 'yyyy-MM-dd');
        }
        
        return {
          ...c,
          paidEMI,
          partialEMIPaid: totalEMIContributed,
          nextDueDate,
          totalLateFeesPaid: (parseFloat(totalLateFeesPaid) || 0) + lateFeesPaidNow,
          paymentHistory: [
            {
              id: `KRS-${Date.now().toString().slice(-6)}`,
              date: paymentData.date,
              amount: emiPaidNow + lateFeesPaidNow,
              emiPaid: emiPaidNow,
              lateFeesPaid: lateFeesPaidNow,
              type: installmentsAdded > 0 ? 'EMI Payment' : 'Partial Payment',
              customerName: c.name,
              vehicleNumber: c.vehicleNumber
            },
            ...c.paymentHistory
          ]
        };
      }
      return c;
    });
    setCustomers(updated);
  };

  const closeAccount = (customerId) => {
    const updated = customers.map(c => 
      c.id === customerId ? { ...c, status: 'closed', closureDate: new Date().toISOString() } : c
    );
    setCustomers(updated);
  };

  const updateCustomer = (updatedData) => {
    const updated = customers.map(c => c.id === updatedData.id ? { ...c, ...updatedData } : c);
    setCustomers(updated);
    setEditingCustomer(null);
    setActiveTab('customers');
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setActiveTab('new-loan');
  };

  const handleRefinance = (customerId, refinanceData) => {
    // 1. Find the old customer
    const oldCustomer = customers.find(c => c.id === customerId);
    if (!oldCustomer) return;

    // 2. Mark old customer as closed
    const updatedCustomers = customers.map(c => 
      c.id === customerId ? { ...c, status: 'closed' } : c
    );

    // 3. Create new customer entry
    const newId = `KRS-${Math.floor(1000 + Math.random() * 9000)}`;
    const emiDetails = calculateEMI(refinanceData.newTotalLoan, oldCustomer.interestRate, oldCustomer.emiMonths);
    
    const newCustomer = {
      ...oldCustomer,
      id: newId,
      loanAmount: refinanceData.newTotalLoan,
      paidEMI: 0,
      nextDueDate: format(new Date(), 'yyyy-MM-dd'),
      paymentHistory: [],
      status: 'active',
      refinancedFrom: oldCustomer.id,
      ...emiDetails,
      emiAmount: emiDetails.emi
    };

    setCustomers([...updatedCustomers, newCustomer]);
    setActiveTab('customers');
  };

  const handleImport = (importedData) => {
    setCustomers([...customers, ...importedData]);
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

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
      
      <main className="main-container">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsSidebarOpen(true)}
              style={{ display: 'none' }}
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
                             String(c.id || "").toLowerCase().includes(q);
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
                        <span className="badge" style={{ fontSize: '9px' }}>{c.id}</span>
                      </button>
                    ))}
                    {customers.filter(c => {
                      const q = searchQuery.toLowerCase().trim();
                      return String(c.name || "").toLowerCase().includes(q) || 
                             String(c.phone || "").includes(q) || 
                             String(c.vehicleNumber || "").toLowerCase().includes(q) ||
                             String(c.id || "").toLowerCase().includes(q);
                    }).length === 0 && (
                      <p className="label" style={{ textAlign: 'center', padding: '16px' }}>No matches found</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab !== 'new-loan' && (
              <button onClick={() => setActiveTab('new-loan')} className="btn-primary" style={{ padding: '0 24px', height: '48px', width: 'auto', fontSize: '12px' }}>
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
              {activeTab === 'customers' && <CustomerDatabase customers={customers.filter(c => c.status !== 'closed')} searchQuery={searchQuery} onSearchChange={setSearchQuery} onImport={handleImport} onRefinance={handleRefinance} onAdd={addLoan} onEdit={handleEdit} onCloseAccount={closeAccount} />}
              {activeTab === 'collections' && <CollectionSheet customers={customers} onPay={recordPayment} searchQuery={searchQuery} />}
              {activeTab === 'pending' && <CustomerDatabase customers={customers.filter(c => c.partialEMIPaid > 0)} searchQuery={searchQuery} onSearchChange={setSearchQuery} onImport={handleImport} onRefinance={handleRefinance} onAdd={addLoan} onEdit={handleEdit} onCloseAccount={closeAccount} isPartialView={true} onPay={recordPayment} />}
              {activeTab === 'ledger' && <Ledger customers={customers} searchQuery={searchQuery} />}
              {activeTab === 'reports' && <PaymentReports customers={customers} />}
              {activeTab === 'closed' && <CustomerDatabase customers={customers.filter(c => c.status === 'closed')} searchQuery={searchQuery} onSearchChange={setSearchQuery} onImport={handleImport} onRefinance={handleRefinance} onAdd={addLoan} onEdit={handleEdit} isClosedView={true} />}
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
