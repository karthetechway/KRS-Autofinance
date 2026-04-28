import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { TrendingUp, PieChart, BarChart3, Download, Calendar } from 'lucide-react';

const PaymentReports = ({ customers }) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Flatten all payments and filter by selected month
  const allPayments = customers.flatMap(c => 
    c.paymentHistory.map(p => ({
      ...p,
      customer: c,
      // Calculate split for flat interest model
      interestPortion: (parseFloat(c.totalInterest) / c.emiMonths).toFixed(2),
      principalPortion: (parseFloat(c.loanAmount) / c.emiMonths).toFixed(2)
    }))
  );

  const filteredPayments = allPayments.filter(p => 
    p.date.startsWith(selectedMonth)
  );

  const totalCollected = filteredPayments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
  const totalInterest = filteredPayments.reduce((acc, p) => acc + parseFloat(p.interestPortion), 0);
  const totalPrincipal = filteredPayments.reduce((acc, p) => acc + parseFloat(p.principalPortion), 0);

  const months = Array.from({ length: 12 }, (_, i) => format(subMonths(new Date(), i), 'yyyy-MM'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="h2">Payment Reports</h2>
          <p className="label">Monthly collection analysis and interest yield</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <select 
              className="input-modern" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: '180px' }}
            >
              {months.map(m => (
                <option key={m} value={m}>{format(new Date(m), 'MMMM yyyy')}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" style={{ width: 'auto', padding: '0 20px' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card" style={{ borderBottom: '4px solid var(--accent-main)' }}>
          <div style={{ color: 'var(--accent-main)', marginBottom: '16px' }}>
            <BarChart3 size={20} />
          </div>
          <p className="label" style={{ margin: 0 }}>Total Collected</p>
          <h3 className="stat-value">₹{totalCollected.toLocaleString()}</h3>
          <p className="text-success" style={{ fontSize: '11px', fontWeight: 800, marginTop: '8px' }}>FOR {format(new Date(selectedMonth), 'MMM yyyy').toUpperCase()}</p>
        </div>
        <div className="stat-card" style={{ borderBottom: '4px solid #60a5fa' }}>
          <div style={{ color: '#60a5fa', marginBottom: '16px' }}>
            <PieChart size={20} />
          </div>
          <p className="label" style={{ margin: 0 }}>Interest Yield</p>
          <h3 className="stat-value">₹{totalInterest.toLocaleString()}</h3>
          <p className="text-accent" style={{ fontSize: '11px', fontWeight: 800, marginTop: '8px' }}>EARNED REVENUE</p>
        </div>
        <div className="stat-card" style={{ borderBottom: '4px solid var(--success)' }}>
          <div style={{ color: 'var(--success)', marginBottom: '16px' }}>
            <TrendingUp size={20} />
          </div>
          <p className="label" style={{ margin: 0 }}>Principal Recovered</p>
          <h3 className="stat-value">₹{totalPrincipal.toLocaleString()}</h3>
          <p className="text-success" style={{ fontSize: '11px', fontWeight: 800, marginTop: '8px' }}>CAPITAL REFLUX</p>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="h3">Detailed Collection Log</h3>
          <span className="badge">{filteredPayments.length} Transactions</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Collection Date</th>
                <th>Customer / ID</th>
                <th>EMI Paid</th>
                <th>Interest Portion</th>
                <th>Principal Portion</th>
                <th>Recovery Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p, i) => {
                const rate = ((parseFloat(p.interestPortion) / parseFloat(p.amount)) * 100).toFixed(0);
                return (
                  <tr key={i}>
                    <td>
                      <p className="font-black" style={{ fontSize: '14px' }}>{format(new Date(p.date), 'dd MMM yyyy')}</p>
                    </td>
                    <td>
                      <p className="font-black" style={{ fontSize: '14px' }}>{p.customerName}</p>
                      <p className="label" style={{ fontSize: '9px', margin: 0 }}>{p.customer.id}</p>
                    </td>
                    <td>
                      <p className="font-black" style={{ fontSize: '16px', color: 'var(--accent-main)' }}>₹{parseFloat(p.amount).toLocaleString()}</p>
                    </td>
                    <td>
                      <p className="font-black" style={{ color: '#60a5fa' }}>₹{parseFloat(p.interestPortion).toLocaleString()}</p>
                    </td>
                    <td>
                      <p className="font-black" style={{ color: 'var(--success)' }}>₹{parseFloat(p.principalPortion).toLocaleString()}</p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--accent-main)', width: `${rate}%` }}></div>
                         </div>
                         <span style={{ fontSize: '10px', fontWeight: 800 }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                    No collections recorded for {format(new Date(selectedMonth), 'MMMM yyyy')}.
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

export default PaymentReports;
