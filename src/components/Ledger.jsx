import React, { useState } from 'react';
import { Search, Printer, MessageCircle, FileText, CheckCircle2, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';

const Ledger = ({ customers }) => {
  const [search, setSearch] = useState('');
  
  // Flatten all payments from all customers
  const allPayments = customers.flatMap(c => 
    c.paymentHistory.map(p => ({
      ...p,
      customer: c // Attach full customer info for the receipt
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = allPayments.filter(p => 
    p.customerName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.vehicleNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleWhatsApp = (p) => {
    const text = `*KRS Auto Finance Receipt*%0A--------------------------%0AReceipt No: ${p.id}%0ACustomer: ${p.customerName}%0AVehicle: ${p.vehicleNumber}%0AAmount Paid: ₹${p.amount}%0ADate: ${format(new Date(p.date), 'dd MMM yyyy')}%0A--------------------------%0APayment adjusted in your records.%0AThank you!`;
    window.open(`https://wa.me/91${p.customer.phone}?text=${text}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="h2">Payment Receipts</h2>
          <p className="label">Historical transaction log and receipt repository</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
           <div style={{ position: 'relative' }}>
              <Search className="text-muted" size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                className="input-modern" 
                style={{ paddingLeft: '36px', height: '44px', width: '260px' }} 
                placeholder="Search Receipt ID or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          <button className="btn-primary" style={{ width: 'auto', padding: '0 20px', height: '44px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Receipt ID</th>
              <th>Customer / Vehicle</th>
              <th>Amount Paid</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <p className="font-black" style={{ fontSize: '14px' }}>{format(new Date(p.date), 'dd MMM yyyy')}</p>
                  <p className="label" style={{ fontSize: '9px', margin: 0 }}>{format(new Date(p.date), 'hh:mm a')}</p>
                </td>
                <td>
                  <span className="badge" style={{ background: 'rgba(255,61,94,0.1)', color: 'var(--accent-main)', fontWeight: 800 }}>{p.id}</span>
                </td>
                <td>
                  <p className="font-black" style={{ fontSize: '14px' }}>{p.customerName}</p>
                  <p className="label" style={{ fontSize: '9px', margin: 0 }}>{p.vehicleNumber}</p>
                </td>
                <td>
                  <p className="font-black" style={{ fontSize: '16px' }}>₹{p.amount}</p>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                    <CheckCircle2 size={14} />
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Adjusted</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => handleWhatsApp(p)}
                      title="Send to WhatsApp"
                      style={{ background: '#25D366', border: 'none', padding: '10px', borderRadius: '10px', color: 'white', cursor: 'pointer' }}
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button 
                      onClick={() => window.print()}
                      title="Print Receipt"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '10px', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                  No transaction history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ledger;
