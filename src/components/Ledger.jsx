import React, { useState } from 'react';
import { Search, Printer, MessageCircle, FileText, CheckCircle2, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';

const Ledger = ({ customers, searchQuery }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  // Flatten all payments from all customers
  const allPayments = customers.flatMap(c => 
    c.paymentHistory.map(p => ({
      ...p,
      customer: c // Attach full customer info for the receipt
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = allPayments.filter(p => {
    const query = (searchQuery || "").toLowerCase().trim();
    if (!query) return true;
    return (
      (p.customerName || "").toLowerCase().includes(query) ||
      (p.id || "").toLowerCase().includes(query) ||
      (p.vehicleNumber || "").toLowerCase().includes(query) ||
      (p.customer?.phone || "").toLowerCase().includes(query)
    );
  });

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
              <th>Installment #</th>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                      #{p.installmentNumber || 'N/A'}
                    </span>
                  </div>
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
                      onClick={() => setSelectedReceipt(p)}
                      title="Print Receipt"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '10px', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReceipt && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '400px', padding: 0, overflow: 'hidden' }}>
             <div id="receipt-print" style={{ padding: '40px', background: '#fff', color: '#000' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
                   <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>KRS AUTO FINANCE</h2>
                   <p style={{ fontSize: '12px', margin: '4px 0', opacity: 0.8 }}>Professional Vehicle Financing & Services</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                   <div>
                      <p style={{ fontSize: '10px', fontWeight: 800, margin: 0, opacity: 0.5 }}>RECEIPT NO</p>
                      <p style={{ fontSize: '14px', fontWeight: 900, margin: 0 }}>{selectedReceipt.id}</p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, margin: 0, opacity: 0.5 }}>DATE</p>
                      <p style={{ fontSize: '14px', fontWeight: 900, margin: 0 }}>{format(new Date(selectedReceipt.date), 'dd MMM yyyy')}</p>
                   </div>
                </div>

                <div style={{ marginBottom: '32px', padding: '20px', background: '#f8f8f8', borderRadius: '12px' }}>
                   <p style={{ fontSize: '10px', fontWeight: 800, margin: '0 0 8px 0', opacity: 0.5 }}>CUSTOMER DETAILS</p>
                   <p style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>{selectedReceipt.customerName}</p>
                   <p style={{ fontSize: '12px', margin: '4px 0' }}>Vehicle: {selectedReceipt.vehicleNumber}</p>
                   <p style={{ fontSize: '12px', margin: 0 }}>Phone: {selectedReceipt.customer.phone}</p>
                </div>

                <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '20px 0', marginBottom: '32px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>EMI Installment #{selectedReceipt.installmentNumber}</span>
                      <span style={{ fontSize: '14px', fontWeight: 900 }}>₹{selectedReceipt.emiPaid}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px' }}>Late Fees / Penalty</span>
                      <span style={{ fontSize: '14px', fontWeight: 900 }}>₹{selectedReceipt.lateFeesPaid || 0}</span>
                   </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '16px', fontWeight: 900 }}>TOTAL PAID</span>
                   <span style={{ fontSize: '28px', fontWeight: 900 }}>₹{selectedReceipt.amount}</span>
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '10px', opacity: 0.5 }}>
                   <p>This is a computer generated receipt.</p>
                   <p>Thank you for your business!</p>
                </div>
             </div>
             
             <div style={{ padding: '24px', display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)' }} className="print-action-btn">
                <button onClick={() => setSelectedReceipt(null)} className="btn-primary" style={{ background: 'none', border: '1px solid var(--border)', flex: 1 }}>Close</button>
                <button onClick={() => window.print()} className="btn-primary" style={{ flex: 1 }}>Print Receipt</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;
