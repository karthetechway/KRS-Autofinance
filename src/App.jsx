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
  X
} from 'lucide-react';
import { format, isToday, addMonths } from 'date-fns';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LoanRegistration from './components/LoanRegistration';
import CustomerDatabase from './components/CustomerDatabase';
import CollectionSheet from './components/CollectionSheet';
import Ledger from './components/Ledger';
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
  const [showBriefing, setShowBriefing] = useState(false);

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

  const recordPayment = (customerId, amount, date) => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        const nextDate = new Date(c.nextDueDate);
        const newNextDate = format(addMonths(nextDate, 1), 'yyyy-MM-dd');
        
        return {
          ...c,
          paidEMI: c.paidEMI + 1,
          nextDueDate: newNextDate,
          paymentHistory: [
            {
              id: `REC-${Date.now().toString().slice(-6)}`,
              date: date,
              amount: amount,
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

  const handleRefinance = (customerId, refinanceData) => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          ...refinanceData,
          status: 'active',
          paymentHistory: [
            {
              id: `REF-${Date.now().toString().slice(-6)}`,
              date: new Date().toISOString(),
              amount: refinanceData.loanAmount,
              type: 'Refinance',
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

  const handleImport = (importedData) => {
    setCustomers([...customers, ...importedData]);
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="main-container">
        <header className="header">
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ position: 'relative' }}>
              <Search className="text-muted" size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                className="input-modern" 
                style={{ paddingLeft: '48px', height: '48px', width: '320px', fontSize: '14px' }} 
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
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
              {activeTab === 'dashboard' && <Dashboard customers={customers} />}
              {activeTab === 'new-loan' && <LoanRegistration onAdd={addLoan} />}
              {activeTab === 'customers' && <CustomerDatabase customers={customers} searchQuery={searchQuery} onImport={handleImport} onRefinance={handleRefinance} onAdd={addLoan} />}
              {activeTab === 'collections' && <CollectionSheet customers={customers} onPay={recordPayment} />}
              {activeTab === 'ledger' && <Ledger customers={customers} />}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <AnimatePresence>
        {showBriefing && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="modal-content" style={{ maxWidth: '640px' }}>
              <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', background: 'rgba(255,61,94,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="h3">System Briefing</h2>
                    <p className="label" style={{ margin: 0 }}>{format(new Date(), 'EEEE, do MMMM')}</p>
                  </div>
                  <X className="text-muted" size={24} style={{ cursor: 'pointer' }} onClick={() => setShowBriefing(false)} />
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
