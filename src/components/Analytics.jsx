import React from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  Target, 
  Calendar,
  Download,
  AlertTriangle,
  Clock,
  BarChart3
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { calculateLateFees } from '../utils/finance';

const Analytics = ({ contracts = [] }) => {
  const delinquentContracts = (contracts || []).filter(c => {
    if (!c.nextDueDate) return false;
    const nextDue = new Date(c.nextDueDate);
    return nextDue < new Date() && c.status === 'active';
  });

  const totalDelinquentAmount = delinquentContracts.reduce((acc, c) => {
    const lateFees = calculateLateFees(c.nextDueDate);
    return acc + parseFloat(c.emiAmount || 0) + lateFees.amount;
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="h2">Pending Payments</h2>
          <p className="label">Audit of overdue agreements and risk assessment</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '0 24px', background: 'var(--error)' }}>
          <AlertTriangle size={16} /> Generate Risk Report
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--error)' }}>
          <div style={{ color: 'var(--error)', marginBottom: '16px' }}>
            <ShieldAlert size={24} />
          </div>
          <p className="label" style={{ margin: 0 }}>Overdue Contracts</p>
          <h3 className="stat-value">{delinquentContracts.length}</h3>
          <p className="text-muted" style={{ fontSize: '11px', fontWeight: 800, marginTop: '8px' }}>REQUIRES IMMEDIATE ACTION</p>
        </div>
        
        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-main)' }}>
          <div style={{ color: 'var(--accent-main)', marginBottom: '16px' }}>
            <Target size={24} />
          </div>
          <p className="label" style={{ margin: 0 }}>Portfolio at Risk</p>
          <h3 className="stat-value">₹{totalDelinquentAmount.toLocaleString()}</h3>
          <p className="text-muted" style={{ fontSize: '11px', fontWeight: 800, marginTop: '8px' }}>INCLUDING PENALTIES</p>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ color: 'var(--success)', marginBottom: '16px' }}>
            <TrendingUp size={24} />
          </div>
          <p className="label" style={{ margin: 0 }}>Recovery Efficiency</p>
          <h3 className="stat-value">92.4%</h3>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '12px', overflow: 'hidden' }}>
             <div style={{ height: '100%', background: 'var(--success)', width: '92.4%' }}></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="h3">Aging Report (NPAs)</h3>
          <button className="btn-primary" style={{ width: 'auto', height: '36px', fontSize: '11px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <Download size={14} /> DOWNLOAD AUDIT
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer / ID</th>
                <th>Due Date</th>
                <th>Aging Profile</th>
                <th>Installment</th>
                <th>Penalty</th>
                <th>Total Liability</th>
              </tr>
            </thead>
            <tbody>
              {delinquentContracts.map((c) => {
                const daysOverdue = differenceInDays(new Date(), new Date(c.nextDueDate));
                const lateFees = calculateLateFees(c.nextDueDate);
                const total = parseFloat(c.emiAmount || 0) + lateFees.amount;

                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="brand-icon" style={{ width: '36px', height: '36px', fontSize: '13px', borderRadius: '10px', color: 'var(--error)', background: 'rgba(255,61,94,0.1)' }}>{c.name[0]}</div>
                        <div>
                          <p className="font-black" style={{ fontSize: '16px' }}>{c.name}</p>
                          <p className="label" style={{ margin: 0, fontSize: '10px' }}>{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-black" style={{ fontSize: '14px' }}>{format(new Date(c.nextDueDate), 'dd MMM yyyy')}</p>
                    </td>
                    <td>
                      <span className="badge badge-error" style={{ fontSize: '10px' }}>{daysOverdue} Days Overdue</span>
                    </td>
                    <td>
                      <p className="font-black">₹{parseFloat(c.emiAmount || 0).toLocaleString()}</p>
                    </td>
                    <td>
                      <p className="font-black" style={{ color: 'var(--accent-main)' }}>₹{lateFees.amount}</p>
                    </td>
                    <td>
                      <p className="font-black" style={{ fontSize: '18px', color: 'var(--error)' }}>₹{total.toLocaleString()}</p>
                    </td>
                  </tr>
                );
              })}
              {delinquentContracts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ padding: '24px', background: 'rgba(34,197,94,0.1)', borderRadius: '50%', color: 'var(--success)' }}>
                        <ShieldAlert size={48} />
                      </div>
                      <p className="font-black" style={{ fontSize: '18px', color: 'var(--text-main)' }}>No pending payments detected</p>
                      <p className="label">All active contracts are currently up to date.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
