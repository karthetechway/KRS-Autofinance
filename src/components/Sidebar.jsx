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
  Upload
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'new-loan', icon: UserPlus, label: 'Customer Addition' },
    { id: 'customers', icon: Users, label: 'Customer Ledger' },
    { id: 'collections', icon: CreditCard, label: 'EMI Collection' },
    { id: 'ledger', icon: FileText, label: 'Payments' },
  ];

  return (
    <aside className="sidebar">
      <div className="brand" style={{ padding: '32px', justifyContent: 'center' }}>
        <div className="brand-icon" style={{ height: '100px', width: '100%' }}>
          <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="KRS Logo" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
        </div>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
  );
};

export default Sidebar;
