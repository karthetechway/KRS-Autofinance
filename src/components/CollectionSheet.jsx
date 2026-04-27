import React, { useState } from 'react';
import { IndianRupee, Calendar, AlertTriangle, ArrowRight, Save, ClipboardList, Printer, CheckCircle2, X, Search, MessageSquare } from 'lucide-react';
import { format, isAfter, addMonths } from 'date-fns';
import { calculateLateFees } from '../utils/finance';

const CollectionSheet = ({ customers, onPay }) => {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [showReceipt, setShowReceipt] = useState(null);
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [search, setSearch] = useState('');
  const [emiPaid, setEmiPaid] = useState('');
  const [lateFeesPaid, setLateFeesPaid] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.status === 'active' && (
      (c.name || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (c.phone || "").includes(search || "") ||
      (c.vehicleNumber || "").toLowerCase().includes((search || "").toLowerCase())
    )
  );

  const handlePay = (e) => {
    e.preventDefault();
    if (!selected) return;
    
    onPay(selected.id, {
      emiPaid: emiPaid || 0,
      lateFeesPaid: lateFeesPaid || 0,
      date: new Date(paymentDate).toISOString()
    });
    
    // Calculate installment info for receipt
    const emiCost = parseFloat(selected.emiAmount);
    const emiPaidNow = parseFloat(emiPaid || 0);
    const totalContributed = (parseFloat(selected.partialEMIPaid) || 0) + emiPaidNow;
    const installmentsAdded = Math.floor(totalContributed / emiCost);
    
    let instInfo = `Installment ${selected.paidEMI + 1}`;
    if (installmentsAdded > 1) {
      instInfo = `Installments ${selected.paidEMI + 1} - ${selected.paidEMI + installmentsAdded}`;
    } else if (installmentsAdded === 0 && emiPaidNow > 0) {
      instInfo = `Installment ${selected.paidEMI + 1} (Partial Payment)`;
    }

    const lateFees = calculateLateFees(selected.nextDueDate);
    setShowReceipt({
      customer: selected,
      emiPaid: emiPaidNow,
      lateFeesPaid: lateFeesPaid || 0,
      instInfo: instInfo,
      date: new Date(paymentDate).toISOString(),
      receiptNo: `REC-${Date.now().toString().slice(-6)}`
    });
    
    setSelected(null);
    setEmiPaid('');
    setLateFeesPaid('');
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const sendReminder = (c) => {
    const lateFees = calculateLateFees(c.nextDueDate);
    const total = parseFloat(c.emiAmount || 0) + (lateFees.amount || 0);
    const text = `*KRS Auto Finance Reminder*%0A--------------------------%0ADear ${c.name},%0A%0AThis is a friendly reminder that your EMI for vehicle *${c.vehicleNumber}* was due on *${format(new Date(c.nextDueDate), 'dd MMM yyyy')}*.%0A%0AAmount Due: ₹${total.toFixed(2)}%0A%0APlease settle the payment at the earliest to avoid further late fees.%0A%0AThank you!`;
    window.open(`https://wa.me/91${c.phone}?text=${text}`, '_blank');
  };

  const ReceiptModal = ({ data, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-content animate-fade" style={{ maxWidth: '450px' }}>
        <button className="close-btn" style={{ background: '#f8f9fa', color: '#666', top: '16px', right: '16px' }} onClick={onClose}>
          <X size={18} />
        </button>
        <div style={{ padding: '40px', background: 'white', color: 'black' }} id="printable-receipt">
          <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid #eee', paddingBottom: '24px' }}>
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Logo" style={{ width: '180px', marginBottom: '8px' }} />
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#666', marginTop: '4px', textTransform: 'uppercase' }}>Two Wheeler Mortgage Receipt</p>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#333', marginTop: '4px' }}>Contact: +91 98765 43210</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, color: '#999', textTransform: 'uppercase' }}>Receipt No</p>
              <p style={{ fontWeight: 800 }}>{data.receiptNo}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', fontWeight: 800, color: '#999', textTransform: 'uppercase' }}>Date</p>
              <p style={{ fontWeight: 800 }}>{format(new Date(data.date), 'dd MMM yyyy')}</p>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>Customer Details</p>
            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '12px' }}>
              <p style={{ fontSize: '16px', fontWeight: 800 }}>{data.customer.name}</p>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>{data.customer.vehicleNumber} • {data.customer.phone}</p>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 0', fontSize: '12px', fontWeight: 600 }}>
                    {data.instInfo}
                  </td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 800 }}>₹{data.emiPaid}</td>
                </tr>
                {data.lateFeesPaid > 0 && (
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 0', fontSize: '12px', fontWeight: 600 }}>Late Fees Payment</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 800, color: '#ef4444' }}>₹{data.lateFeesPaid}</td>
                  </tr>
                )}
                <tr style={{ background: '#fcfcfc' }}>
                  <td style={{ padding: '16px 0', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' }}>Total Received</td>
                  <td style={{ padding: '16px 0', textAlign: 'right', fontSize: '20px', fontWeight: 900 }}>₹{(parseFloat(data.emiPaid) + parseFloat(data.lateFeesPaid)).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '24px', borderTop: '1px dashed #ddd' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10b981' }}>
              <CheckCircle2 size={16} />
              <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Payment Adjusted to Record</p>
            </div>
            <p style={{ fontSize: '10px', color: '#999', marginTop: '12px' }}>Next Due: {format(addMonths(new Date(data.customer.nextDueDate), 1), 'dd MMM yyyy')}</p>
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
          <button onClick={onClose} className="btn-primary" style={{ background: 'var(--bg-hover)', color: 'white' }}>Close</button>
          <button onClick={() => window.print()} className="btn-primary">
            <Printer size={18} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ padding: '32px', marginBottom: '20px', border: '1px solid var(--accent-main)' }}>
           <p className="label" style={{ marginBottom: '16px' }}>Search Customer for Collection</p>
           <div style={{ position: 'relative' }}>
              <Search className="text-muted" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search by Name, Phone, or Vehicle Number..." 
                className="input-modern" 
                style={{ paddingLeft: '48px', height: '56px', fontSize: '18px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {filteredCustomers.map((c) => {
          const isOverdue = isAfter(new Date(), new Date(c.nextDueDate));
          const lateFees = calculateLateFees(c.nextDueDate);
          const total = (parseFloat(c.emiAmount || 0) + (lateFees.amount || 0)).toFixed(2);

          return (
            <div key={c.id} className="card" style={{ padding: '16px', borderColor: isOverdue ? 'rgba(239,68,68,0.2)' : 'var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                  <div className="brand-icon" style={{ width: '44px', height: '44px', background: isOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(255,61,94,0.1)', color: isOverdue ? 'var(--error)' : 'var(--accent-main)', fontSize: '14px' }}>
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="font-black" style={{ fontSize: '18px', color: 'var(--text-main)' }}>{c.name}</p>
                    <p className="font-black" style={{ fontSize: '12px', color: 'var(--accent-main)', marginTop: '2px' }}>
                      {c.phone} • {c.vehicleNumber}
                    </p>
                    <p className="label" style={{ margin: '4px 0 0', fontSize: '9px' }}>
                      DUE: {format(new Date(c.nextDueDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                  <div style={{ textAlign: 'right' }}>
                    {isOverdue && <p className="text-error font-black" style={{ fontSize: '10px' }}>LATE: ₹{lateFees.amount}</p>}
                    <p className="font-black" style={{ fontSize: '24px', color: isOverdue ? 'var(--error)' : 'var(--text-main)' }}>₹{total}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isOverdue && (
                      <button 
                        onClick={() => sendReminder(c)} 
                        className="btn-primary" 
                        style={{ width: 'auto', padding: '12px', background: '#25D366', color: 'white' }}
                        title="Send WhatsApp Reminder"
                      >
                        <MessageSquare size={18} />
                      </button>
                    )}
                    <button onClick={() => { 
                      setSelected(c); 
                      const lf = calculateLateFees(c.nextDueDate);
                      setEmiPaid(c.emiAmount);
                      setLateFeesPaid(lf.amount);
                    }} className="btn-primary" style={{ width: 'auto', padding: '0 32px', height: '54px' }}>
                      Collect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredCustomers.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '120px', opacity: 0.3 }}>
            <ClipboardList size={80} style={{ marginBottom: '24px' }} />
            <p className="h3">No Records Found</p>
            <p className="label">Try a different search term</p>
          </div>
        )}
      </div>

      <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '120px' }}>
        <h3 className="font-black" style={{ fontSize: '24px', marginBottom: '40px' }}>Record Payment</h3>
        {!selected ? (
          <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.2 }}>
            <Save size={80} style={{ marginBottom: '24px' }} />
            <p className="label">Select customer to proceed</p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)' }}>
              <p className="label">Receiving From</p>
              <p className="font-black" style={{ fontSize: '24px' }}>{selected.name}</p>
              <p className="font-black" style={{ fontSize: '15px', color: 'var(--accent-main)' }}>{selected.phone}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>{selected.address}</p>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="label">Manual Payment Date</label>
              <input 
                className="input-modern"
                type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="label">EMI Amount (₹)</label>
                <input 
                  className="input-modern" style={{ fontSize: '24px', fontWeight: 900, textAlign: 'center' }}
                  type="number" value={emiPaid} onChange={(e) => setEmiPaid(e.target.value)}
                  placeholder="0"
                />
                {selected.partialEMIPaid > 0 && <p className="label" style={{ marginTop: '8px', color: 'var(--accent-main)' }}>PREV PARTIAL: ₹{selected.partialEMIPaid}</p>}
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="label">Late Fees (₹)</label>
                <input 
                  className="input-modern" style={{ fontSize: '24px', fontWeight: 900, textAlign: 'center', color: 'var(--error)' }}
                  type="number" value={lateFeesPaid} onChange={(e) => setLateFeesPaid(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={() => setSelected(null)} className="btn-primary" style={{ background: 'var(--bg-hover)', color: 'var(--text-main)' }}>Cancel</button>
              <button type="submit" className="btn-primary">Confirm</button>
            </div>
          </form>
        )}
      </div>

      {showReceipt && <ReceiptModal data={showReceipt} onClose={() => setShowReceipt(null)} />}
    </div>
  );
};

export default CollectionSheet;
