import React, { useState, useEffect } from 'react';
import { Phone, History, Bike, Search, Download, Upload, User, X, FileText, ShieldCheck, Zap, ArrowUpRight, Calculator, IndianRupee, UserPlus, PlusCircle, MessageSquare, Edit, FileCheck } from 'lucide-react';
import { parseCSVData, calculateRefinance } from '../utils/finance';
import { format } from 'date-fns';
import LoanRegistration from './LoanRegistration';

const CustomerDatabase = ({ customers, searchQuery, onSearchChange, onImport, onRefinance, onAdd, onEdit, onCloseAccount, isClosedView = false }) => {
  const [showImport, setShowImport] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [showRefinance, setShowRefinance] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [refinanceData, setRefinanceData] = useState(null);
  const [refinanceDateValue, setRefinanceDateValue] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (showRefinance && topUpAmount) {
      setRefinanceData(calculateRefinance(showRefinance, topUpAmount));
    } else {
      setRefinanceData(null);
    }
  }, [topUpAmount, showRefinance]);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = parseCSVData(event.target.result);
        onImport(data);
        setShowImport(false);
      };
      reader.readAsText(file);
    }
  };

  const executeRefinance = () => {
    if (!refinanceData) return;
    onRefinance(showRefinance.id, refinanceData);
    setShowRefinance(null);
    setTopUpAmount('');
  };

  const sendReminder = (c) => {
    const text = `*KRS Auto Finance Reminder*%0A--------------------------%0ADear ${c.name},%0A%0AThis is a friendly reminder that your EMI for vehicle *${c.vehicleNumber}* was due on *${format(new Date(c.nextDueDate), 'dd MMM yyyy')}*.%0A%0APlease settle the payment at the earliest to avoid further late fees.%0A%0AThank you!`;
    window.open(`https://wa.me/91${c.phone}?text=${text}`, '_blank');
  };

  const filtered = (customers || []).filter(c => 
    (c.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    (c.vehicleNumber || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    (c.phone || "").includes(searchQuery || "")
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="h2">Customer Ledger</h2>
          <p className="label">Total {customers.length} records in system</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search className="text-muted" size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              className="input-modern" 
              style={{ paddingLeft: '40px', height: '44px', width: '300px' }} 
              placeholder="Search by Name, Vehicle or Phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
          </div>
          <button className="btn-primary" style={{ width: 'auto', padding: '0 20px', height: '44px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <Download size={16} /> Export Ledger
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Financials</th>
              <th>Progress</th>
              <th>Outstanding</th>
              {isClosedView && <th>Closed On</th>}
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {c.photo ? (
                      <img src={c.photo} className="profile-img" alt={c.name} style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
                    ) : (
                      <div className="brand-icon" style={{ width: '36px', height: '36px', fontSize: '12px', borderRadius: '10px' }}>{c.name[0]}</div>
                    )}
                    <div>
                      <p className="font-black" style={{ fontSize: '18px', color: 'var(--text-main)' }}>{c.name}</p>
                      <p className="font-black" style={{ fontSize: '14px', color: 'var(--accent-main)', marginTop: '4px' }}>
                        {c.phone}
                      </p>
                      <p className="label" style={{ fontSize: '10px', marginTop: '6px', opacity: 0.7, textTransform: 'none', letterSpacing: '0' }}>
                        {c.address}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="font-black" style={{ fontSize: '16px' }}>{c.vehicleModel}</p>
                  <p className="label" style={{ fontSize: '11px', margin: 0 }}>{c.vehicleNumber}</p>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <p className="font-black" style={{ fontSize: '16px' }}>L: ₹{parseFloat(c.loanAmount).toLocaleString()}</p>
                    <p className="text-muted" style={{ fontSize: '10px', fontWeight: 800 }}>I: ₹{parseFloat(c.totalInterest || 0).toLocaleString()}</p>
                    <p className="text-accent" style={{ fontSize: '10px', fontWeight: 800 }}>EMI: ₹{c.emiAmount}</p>
                  </div>
                </td>
                <td>
                  <div style={{ width: '100px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>{c.paidEMI}/{c.emiMonths}</span>
                      <span>{Math.round((c.paidEMI / c.emiMonths) * 100)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--accent-main)', width: `${(c.paidEMI / c.emiMonths) * 100}%` }}></div>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="font-black" style={{ fontSize: '16px', color: 'var(--accent-main)' }}>
                    ₹{(parseFloat(c.totalPayable || 0) - (parseFloat(c.emiAmount || 0) * c.paidEMI)).toLocaleString()}
                  </p>
                  <p className="label" style={{ fontSize: '9px', margin: 0 }}>Total: ₹{parseFloat(c.totalPayable || 0).toLocaleString()}</p>
                </td>
                {isClosedView && (
                  <td>
                    <p className="font-black" style={{ fontSize: '14px' }}>{c.closureDate ? format(new Date(c.closureDate), 'dd MMM yyyy') : 'N/A'}</p>
                  </td>
                )}
                <td>
                  <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '11px', padding: '6px 12px' }}>{c.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    <button 
                      onClick={() => onEdit(c)}
                      title="Edit Customer"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--accent-main)', cursor: 'pointer' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => setShowDetails(c)}
                      title="Vault Documents"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <FileText size={14} />
                    </button>
                    {c.status === 'active' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => sendReminder(c)}
                          title="WhatsApp Reminder"
                          style={{ background: '#25D366', border: 'none', padding: '8px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button 
                          onClick={() => setShowRefinance(c)}
                          title="Refinance"
                          style={{ background: 'rgba(255,61,94,0.1)', border: '1px solid var(--border-accent)', padding: '8px', borderRadius: '8px', color: 'var(--accent-main)', cursor: 'pointer' }}
                        >
                          <ArrowUpRight size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('Are you sure you want to close this account permanently?')) {
                              onCloseAccount(c.id);
                            }
                          }}
                          title="Close Account"
                          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '8px', borderRadius: '8px', color: '#10b981', cursor: 'pointer' }}
                        >
                          <FileCheck size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      {/* Refinance Modal */}
      {showRefinance && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '480px' }}>
            <button className="close-btn" onClick={() => setShowRefinance(null)}>
              <X size={18} />
            </button>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
              <h3 className="h3">Top-up Refinance</h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px dashed var(--border)', marginBottom: '24px' }}>
                <p className="label">Current Balance</p>
                <p className="h3" style={{ margin: 0 }}>{showRefinance.name}</p>
                <p className="text-accent font-black" style={{ fontSize: '20px' }}>₹{parseFloat(showRefinance.loanAmount).toLocaleString()}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="label">Refinance Date</label>
                  <input 
                    className="input-modern"
                    type="date" 
                    value={refinanceDateValue} 
                    onChange={(e) => setRefinanceDateValue(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="label">Extra Amount Required</label>
                  <input 
                    className="input-modern" style={{ fontSize: '20px' }}
                    type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {refinanceData && (
                <div style={{ background: 'rgba(16,185,129,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted font-bold" style={{ fontSize: '12px' }}>Outstanding Principal</span>
                      <span className="font-black">₹{refinanceData.outstandingPrincipal.toLocaleString()}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted font-bold" style={{ fontSize: '12px' }}>Top-up Amount</span>
                      <span className="font-black">₹{refinanceData.topUpAmount.toLocaleString()}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-error font-bold" style={{ fontSize: '12px' }}>Doc Charge (10%)</span>
                      <span className="text-error font-black">- ₹{refinanceData.docCharge.toLocaleString()}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(16,185,129,0.2)', paddingTop: '12px' }}>
                      <span className="text-success font-black" style={{ fontSize: '14px' }}>In Hand Cash</span>
                      <span className="text-success font-black" style={{ fontSize: '24px' }}>₹{refinanceData.amountToHandover.toLocaleString()}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span className="text-muted font-bold" style={{ fontSize: '12px' }}>New Total Principal</span>
                      <span className="text-muted font-black">₹{refinanceData.newTotalLoan.toLocaleString()}</span>
                   </div>
                </div>
              )}

              <button 
                onClick={executeRefinance}
                className="btn-primary" 
                disabled={!refinanceData}
              >
                Start New Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Vault Modal */}
      {showDetails && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '800px' }}>
            <button className="close-btn" onClick={() => setShowDetails(null)}>
              <X size={18} />
            </button>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
              <h3 className="h3">{showDetails.name} <span className="text-muted" style={{ fontSize: '12px' }}>Vault</span></h3>
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="card" style={{ padding: '16px' }}>
                <p className="label">Aadhar</p>
                {showDetails.aadharFile ? <img src={showDetails.aadharFile} style={{ width: '100%', borderRadius: '12px' }} alt="" /> : <p className="text-muted">No document</p>}
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <p className="label">RC Book</p>
                {showDetails.rcFile ? <img src={showDetails.rcFile} style={{ width: '100%', borderRadius: '12px' }} alt="" /> : <p className="text-muted">No document</p>}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default CustomerDatabase;
