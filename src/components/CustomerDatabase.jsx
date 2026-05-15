import React, { useState, useEffect } from 'react';
import { isToday } from 'date-fns';
import { Phone, History, Bike, Search, Download, Upload, User, X, FileText, ShieldCheck, Zap, ArrowUpRight, Calculator, IndianRupee, UserPlus, PlusCircle, MessageSquare, Edit, Trash2, FileCheck, ChevronLeft, ChevronRight, MoreVertical, MapPin } from 'lucide-react';
import { parseCSVData, calculatePreClosure } from '../utils/finance';
import { format } from 'date-fns';
import LoanRegistration from './LoanRegistration';

const CustomerDatabase = ({ customers, searchQuery, onSearchChange, onImport, onAdd, onEdit, onCloseAccount, isClosedView = false, isPartialView = false, onPay, onNavigate, onDelete }) => {
  const [showImport, setShowImport] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreClosure, setShowPreClosure] = useState(null);
  const [preClosureData, setPreClosureData] = useState(null);
  const [editableFinalAmount, setEditableFinalAmount] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 50;

  useEffect(() => {
    if (showPreClosure) {
      const data = calculatePreClosure(showPreClosure);
      setPreClosureData(data);
      setEditableFinalAmount(data.totalAmount);
    }
  }, [showPreClosure]);

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


  const sendReminder = (c) => {
    const text = `*KRS Auto Finance Reminder*%0A--------------------------%0ADear ${c.name},%0A%0AThis is a friendly reminder that your EMI for vehicle *${c.vehicleNumber}* was due on *${format(new Date(c.nextDueDate), 'dd MMM yyyy')}*.%0A%0APlease settle the payment at the earliest to avoid further late fees.%0A%0AThank you!`;
    window.open(`https://wa.me/91${c.phone}?text=${text}`, '_blank');
  };

  const filtered = (customers || []).filter(c => {
    const query = (searchQuery || "").toLowerCase().trim();
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

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filtered.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="h2">Customer Ledger</h2>
          <p className="label">Total {customers.length} records in system</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-primary" style={{ width: 'auto', padding: '0 20px', height: '44px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <Download size={16} /> Export Ledger
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer Profile</th>
              <th>Vehicle Asset</th>
              <th>Loan Summary</th>
              <th>Progress & Due Date</th>
              {isClosedView && <th>Closed On</th>}
              {isPartialView && <th>Collection Status</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((c) => {
              const totalEMIPaid = (c.paymentHistory || [])
                .filter(p => p.type === 'EMI Payment' || p.type === 'Partial Payment' || p.type === 'Historical Adjustment')
                .reduce((sum, p) => sum + parseFloat(p.emiPaid || 0), 0);
              
              // Ensure we don't double count if user both set paidEMI in migration AND backfilled history
              const basePaid = parseFloat(c.emiAmount || 0) * parseInt(c.paidEMI || 0);
              const amountActuallyPaid = Math.max(totalEMIPaid, basePaid);
              const outstanding = parseFloat(c.totalPayable || 0) - amountActuallyPaid;
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {c.photo ? (
                        <img src={c.photo} className="profile-img" alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
                      ) : (
                        <div className="brand-icon" style={{ width: '40px', height: '40px', fontSize: '14px', borderRadius: '12px' }}>{c.name[0]}</div>
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <p className="font-black" style={{ fontSize: '16px', color: 'var(--text-main)' }}>{c.name}</p>
                           <span className="badge" style={{ fontSize: '9px', background: 'rgba(255,61,94,0.1)', color: 'var(--accent-main)', border: 'none' }}>EMI: ₹{c.emiAmount}</span>
                        </div>
                        <p className="font-black" style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {c.phone}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', cursor: 'help' }} title={c.address}>
                          <MapPin size={10} className="text-accent" />
                          <p className="label" style={{ fontSize: '10px', textTransform: 'none', opacity: 0.6, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-black" style={{ fontSize: '14px' }}>{c.vehicleModel}</p>
                    <p className="label" style={{ fontSize: '10px', margin: 0, opacity: 0.7 }}>{c.vehicleNumber}</p>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <p className="font-black" style={{ fontSize: '15px' }}>₹{outstanding.toLocaleString()}</p>
                      <p className="label" style={{ fontSize: '10px', textTransform: 'none' }}>Remaining of ₹{parseFloat(c.loanAmount).toLocaleString()}</p>
                    </div>
                  </td>
                  <td>
                    <div style={{ width: '140px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 800, marginBottom: '6px' }}>
                        <span className="text-muted">{c.paidEMI}/{c.emiMonths} Paid</span>
                        <span style={{ color: 'var(--accent-main)' }}>{Math.round((c.paidEMI / c.emiMonths) * 100)}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                        <div style={{ height: '100%', background: 'var(--accent-main)', width: `${(c.paidEMI / c.emiMonths) * 100}%` }}></div>
                      </div>
                      <p className="font-black" style={{ fontSize: '13px', color: isToday(new Date(c.nextDueDate)) ? 'var(--accent-main)' : 'var(--text-main)', marginTop: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        Next EMI: {format(new Date(c.nextDueDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </td>
                  {isClosedView && (
                    <td>
                      <p className="font-black" style={{ fontSize: '13px' }}>{c.closureDate ? format(new Date(c.closureDate), 'dd MMM yyyy') : 'N/A'}</p>
                    </td>
                  )}
                  {isPartialView && (
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <p className="font-black" style={{ color: 'var(--success)', fontSize: '13px' }}>Paid: ₹{parseFloat(c.partialEMIPaid || 0).toLocaleString()}</p>
                        <p className="font-black" style={{ color: 'var(--accent-main)', fontSize: '11px' }}>Rem: ₹{(parseFloat(c.emiAmount) - parseFloat(c.partialEMIPaid || 0)).toLocaleString()}</p>
                      </div>
                    </td>
                  )}
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => onEdit(c)}
                        className="action-icon-btn"
                        title="Edit Contract"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          onSearchChange(c.name);
                          onNavigate('ledger');
                        }}
                        className="action-icon-btn"
                        title="View Payment History"
                      >
                        <History size={14} />
                      </button>
                      <button 
                        onClick={() => setShowDetails(c)}
                        className="action-icon-btn"
                        title="Document Vault"
                      >
                        <FileText size={14} />
                      </button>
                      <button 
                        onClick={() => onDelete(c.id)}
                        className="action-icon-btn"
                        title="Delete Record"
                        style={{ color: '#ff3d5e', borderColor: 'rgba(255,61,94,0.1)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                      
                      {!isClosedView && (
                        <>
                          <button 
                            onClick={() => sendReminder(c)}
                            className="action-icon-btn"
                            style={{ color: '#25D366' }}
                            title="WhatsApp Reminder"
                          >
                            <MessageSquare size={14} />
                          </button>
                          <button 
                            onClick={() => setShowPreClosure(c)}
                            className="action-icon-btn"
                            style={{ color: 'var(--success)' }}
                            title="Close Account"
                          >
                            <FileCheck size={14} />
                          </button>
                        </>
                      )}

                      {isClosedView && (
                        <button 
                          onClick={() => {
                            const { id, status, onboardingDate, closureDate, paymentHistory, ...rest } = c;
                            onEdit({ ...rest, paidEMI: 0, nextDueDate: format(new Date(), 'yyyy-MM-dd') });
                          }}
                          className="action-icon-btn"
                          style={{ color: 'var(--accent-main)' }}
                          title="New Loan"
                        >
                          <PlusCircle size={14} />
                        </button>
                      )}

                      {isPartialView && (
                        <button 
                          onClick={() => {
                            const balance = parseFloat(c.emiAmount) - (parseFloat(c.partialEMIPaid) || 0);
                            if(window.confirm(`Pay remaining balance of ₹${balance.toLocaleString()}?`)) {
                              onPay(c.id, {
                                amount: balance,
                                lateFees: 0,
                                date: new Date().toISOString().split('T')[0]
                              });
                            }
                          }}
                          className="btn-primary"
                          style={{ height: '32px', padding: '0 12px', fontSize: '10px' }}
                        >
                          PAY
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <p className="label">Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filtered.length)} of {filtered.length} entries</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={18} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              <ChevronRight size={18} />
            </button>
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
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { label: 'Customer Photo', key: 'photo' },
                { label: 'RC Book Front', key: 'rcFront' },
                { label: 'RC Book Back', key: 'rcBack' },
                { label: 'Aadhar Front', key: 'aadharFront' },
                { label: 'Aadhar Back', key: 'aadharBack' }
              ].map(doc => (
                <div key={doc.key} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p className="label" style={{ margin: 0 }}>{doc.label}</p>
                  <div style={{ flex: 1, minHeight: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {showDetails[doc.key] ? (
                      showDetails[doc.key].includes('.pdf') || showDetails[doc.key].includes('pdf') ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                          <FileText size={48} className="text-accent" style={{ marginBottom: '12px' }} />
                          <p className="label" style={{ fontSize: '10px', textTransform: 'none', marginBottom: '16px' }}>PDF Document</p>
                          <a 
                            href={showDetails[doc.key]} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-primary" 
                            style={{ height: '36px', padding: '0 16px', fontSize: '11px', width: 'auto' }}
                          >
                            Open PDF <ArrowUpRight size={14} />
                          </a>
                        </div>
                      ) : (
                        <img 
                          src={showDetails[doc.key]} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          alt={doc.label} 
                          onClick={() => window.open(showDetails[doc.key], '_blank')}
                          className="cursor-pointer"
                        />
                      )
                    ) : (
                      <p className="label" style={{ opacity: 0.3 }}>Not Uploaded</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Pre-closure Modal */}
      {showPreClosure && preClosureData && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '540px' }}>
            <button className="close-btn" onClick={() => setShowPreClosure(null)}>
              <X size={18} />
            </button>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
              <h3 className="h3">Account Pre-closure</h3>
              <p className="label" style={{ margin: 0 }}>{showPreClosure.name} • {showPreClosure.vehicleNumber}</p>
            </div>
            <div style={{ padding: '24px' }}>
              <div className="card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted font-bold">Outstanding Principal</span>
                    <span className="font-black">₹{preClosureData.outstandingPrincipal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted font-bold">Pre-closure Charges (7.5% of ₹{preClosureData.originalPrincipal.toLocaleString()})</span>
                    <span className="font-black">₹{preClosureData.preClosureCharges.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted font-bold">Late Fees Outstanding</span>
                    <span className="font-black">₹{preClosureData.lateFees.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted font-bold">Pro-rata EMI ({preClosureData.daysUsed} days)</span>
                    <span className="font-black">₹{preClosureData.proRataEMI.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                    <span className="h3" style={{ margin: 0 }}>Calculated Total</span>
                    <span className="h3" style={{ margin: 0, color: 'var(--accent-main)' }}>₹{preClosureData.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="label">Final Settlement Amount (Editable)</label>
                <div style={{ position: 'relative' }}>
                  <IndianRupee size={18} className="text-muted" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="number" 
                    className="input-modern" 
                    style={{ paddingLeft: '48px', fontSize: '24px', fontWeight: 900, color: 'var(--accent-main)' }}
                    value={editableFinalAmount}
                    onChange={(e) => setEditableFinalAmount(e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  if(window.confirm(`Confirm pre-closure of account with ₹${parseFloat(editableFinalAmount).toLocaleString()} settlement?`)) {
                    onCloseAccount(showPreClosure.id, {
                      settlementAmount: editableFinalAmount,
                      closureDate: new Date().toISOString()
                    });
                    setShowPreClosure(null);
                  }
                }}
                className="btn-primary"
                style={{ background: 'var(--success)', color: '#000', marginTop: '32px' }}
              >
                COMPLETE PRE-CLOSURE <Zap size={18} />
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default CustomerDatabase;
