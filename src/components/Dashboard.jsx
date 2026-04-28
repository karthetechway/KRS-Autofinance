import React from 'react';
import { Wallet, Users, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { isToday, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';

const Dashboard = ({ customers = [], searchQuery = "", onNavigateToCustomer }) => {
  const query = searchQuery.toLowerCase().trim();
  
  const filteredOnboarding = customers.filter(c => {
    if (!query) return true;
    const name = String(c.name || "").toLowerCase();
    const phone = String(c.phone || "").replace(/[^0-9]/g, "");
    const vehicle = String(c.vehicleNumber || "").toLowerCase();
    const id = String(c.id || "").toLowerCase();
    const cleanQuery = query.replace(/[^0-9]/g, "");
    
    return name.includes(query) || 
           (cleanQuery && phone.includes(cleanQuery)) || 
           phone.includes(query) || 
           vehicle.includes(query) || 
           id.includes(query);
  });

  const activeLoans = customers.filter(c => c.status === 'active').length;
  const totalFinance = customers.reduce((acc, c) => acc + (parseFloat(c.loanAmount) || 0), 0);
  const todayDues = customers.filter(c => isToday(new Date(c.nextDueDate)));
  const weeklyDues = customers.filter(c => isWithinInterval(new Date(c.nextDueDate), {
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  }));

  const stats = [
    { label: 'Active Contracts', value: activeLoans, icon: Users, color: 'var(--accent-main)' },
    { label: 'Net Finance', value: `₹${(totalFinance / 100000).toFixed(2)}L`, icon: Wallet, color: '#60a5fa' },
    { label: 'Dues Today', value: todayDues.length, icon: Clock, color: '#fb923c' },
    { label: 'Week Pipeline', value: weeklyDues.length, icon: AlertTriangle, color: 'var(--error)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="stat-grid">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card">
              <div style={{ color: stat.color, marginBottom: '16px' }}>
                <Icon size={20} />
              </div>
              <p className="label" style={{ margin: 0 }}>{stat.label}</p>
              <h3 className="stat-value" style={{ fontSize: '32px' }}>{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="h3">Recent Onboarding</h3>
            <button className="text-gold" style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              DETAILS <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredOnboarding.length > 0 ? (
              (query ? filteredOnboarding : filteredOnboarding.slice(-5)).reverse().map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => onNavigateToCustomer(c.name)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="brand-icon" style={{ width: '36px', height: '36px', fontSize: '13px', borderRadius: '10px' }}>{c.name[0]}</div>
                    <div>
                      <p className="font-black" style={{ fontSize: '16px' }}>{c.name}</p>
                      <p className="label" style={{ margin: 0, fontSize: '12px' }}>{c.vehicleNumber}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="font-black" style={{ fontSize: '18px' }}>₹{parseFloat(c.loanAmount).toLocaleString()}</p>
                    <p className="text-success" style={{ fontSize: '12px', fontWeight: 800 }}>ACTIVE</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted" style={{ textAlign: 'center', padding: '32px', fontSize: '14px', color: 'var(--text-main)', opacity: 0.8 }}>
                {searchQuery ? `No records match "${searchQuery}"` : 'Awaiting initial records'}
              </p>
            )}
          </div>
        </div>

        <div className="card" style={{ background: 'var(--accent-main)', color: '#000', border: 'none' }}>
          <h4 className="h3" style={{ marginBottom: '4px' }}>Performance</h4>
          <p className="font-black" style={{ fontSize: '13px', opacity: 0.6, letterSpacing: '0.05em' }}>WEEKLY COLLECTION TARGET</p>
          
          <div style={{ marginTop: '32px', background: 'rgba(0,0,0,0.05)', padding: '24px', borderRadius: '18px' }}>
            <p className="font-black" style={{ fontSize: '13px', opacity: 0.5 }}>ESTIMATED TOTAL</p>
            <p className="font-black" style={{ fontSize: '32px' }}>₹{(weeklyDues.reduce((acc, c) => acc + parseFloat(c.emiAmount), 0)).toLocaleString()}</p>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800 }}>
              <span>COLLECTION RATE</span>
              <span>88%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#000', width: '88%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
