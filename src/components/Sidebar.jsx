import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  ClipboardList, 
  ShieldCheck,
  LogOut,
  FileText,
  Home,
  CreditCard,
  Upload,
  Zap,
  X,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'new-loan', icon: UserPlus, label: 'Customer Addition' },
    { id: 'customers', icon: Users, label: 'Customer Ledger' },
    { id: 'collections', icon: CreditCard, label: 'EMI Collection' },
    { id: 'reports', icon: BarChart3, label: 'Payment Reports' },
    { id: 'pending', icon: Zap, label: 'Pending Payments' },
    { id: 'ledger', icon: FileText, label: 'Payments' },
    { id: 'closed', icon: ShieldCheck, label: 'Closed Accounts' },
  ];

  return (
    <>
      {isOpen && <div className="modal-overlay" style={{ zIndex: 95 }} onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="brand" style={{ padding: '24px 16px', justifyContent: 'center', position: 'relative' }}>
          <button 
            onClick={onClose}
            className="mobile-menu-btn" 
            style={{ position: 'absolute', right: '16px', top: '16px', display: 'none' }}
          >
            <X size={20} />
          </button>
          <div className="brand-icon" style={{ height: '70px', width: '100%' }}>
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="KRS Logo" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <nav className="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon size={24} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={onLogout}
            className="nav-item" 
            style={{ color: 'var(--error)', background: 'rgba(239,68,68,0.05)' }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
