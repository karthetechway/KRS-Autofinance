import React, { useState } from 'react';
import { Camera, ShieldCheck, FileText, IndianRupee, Calendar, User, Phone, MapPin, Bike, Calculator, Zap, CheckCircle2 } from 'lucide-react';
import { calculateEMI } from '../utils/finance';
import { format } from 'date-fns';

const LoanRegistration = ({ onAdd, onUpdate, editingCustomer, onCancel }) => {
  const [tab, setTab] = useState('new');
  const initialForm = {
    name: '', phone: '', address: '', aadhar: '',
    vehicleModel: '', vehicleNumber: '', modelYear: format(new Date(), 'yyyy'),
    loanAmount: '', interestRate: '', emiMonths: '',
    docCharge: '10', paidEMI: 0, nextDueDate: format(new Date(), 'yyyy-MM-dd'),
    photo: null, photoName: '', aadharFile: null, aadharName: '', rcFile: null, rcName: ''
  };
  const [formData, setFormData] = useState(initialForm);

  React.useEffect(() => {
    if (editingCustomer) {
      setFormData({ ...initialForm, ...editingCustomer });
      setTab(editingCustomer.paidEMI > 0 ? 'migrate' : 'new');
    }
  }, [editingCustomer]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (!editingCustomer) {
      setFormData(initialForm);
    }
  };

  const handleFile = (field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setFormData(prev => ({ 
      ...prev, 
      [field]: e.target.result,
      [`${field.replace('File', '')}Name`]: file.name 
    }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emiDetails = calculateEMI(formData.loanAmount, formData.interestRate, formData.emiMonths);
    const finalData = { ...formData, ...emiDetails, emiAmount: emiDetails.emi };
    
    if (editingCustomer) {
      onUpdate(finalData);
    } else {
      onAdd(finalData);
    }
  };

  const emiDetails = calculateEMI(formData.loanAmount, formData.interestRate, formData.emiMonths);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="tab-container">
        <button onClick={() => handleTabChange('new')} className={`tab-btn ${tab === 'new' ? 'active' : ''}`}>Fresh New Loan</button>
        <button onClick={() => handleTabChange('migrate')} className={`tab-btn ${tab === 'migrate' ? 'active' : ''}`}>Migrate Existing Customer</button>
      </div>



      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
             <p className="label">Step 1: Basic Details</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input required className="input-modern" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input required className="input-modern" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <textarea required className="input-modern" placeholder="Permanent Address" style={{ height: '80px' }} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
             </div>
          </div>

          <div>
             <p className="label">Step 2: Identity & Assets</p>
             <div className="upload-grid">
                 <div className={`file-upload-card ${formData.photo ? 'has-file' : ''}`}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFile('photo', e.target.files[0])} />
                    <div className="icon-container">{formData.photo ? <CheckCircle2 size={32} /> : <Camera size={32} />}</div>
                    <span>{formData.photoName || 'Customer Photo'}</span>
                 </div>
                 <div className={`file-upload-card ${formData.aadharFile ? 'has-file' : ''}`}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFile('aadharFile', e.target.files[0])} />
                    <div className="icon-container">{formData.aadharFile ? <CheckCircle2 size={32} /> : <ShieldCheck size={32} />}</div>
                    <span>{formData.aadharName || 'Aadhar ID'}</span>
                 </div>
                 <div className={`file-upload-card ${formData.rcFile ? 'has-file' : ''}`}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFile('rcFile', e.target.files[0])} />
                    <div className="icon-container">{formData.rcFile ? <CheckCircle2 size={32} /> : <FileText size={32} />}</div>
                    <span>{formData.rcName || 'RC Book'}</span>
                 </div>
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <p className="label">Step 3: Vehicle & Loan Math</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '20px', marginBottom: '24px' }}>
               <input required className="input-modern" placeholder="Vehicle Model" value={formData.vehicleModel} onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})} />
               <input required className="input-modern" placeholder="Vehicle Number" value={formData.vehicleNumber} onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})} />
               <select 
                 required
                 className="input-modern" 
                 value={formData.modelYear} 
                 onChange={(e) => setFormData({...formData, modelYear: e.target.value})}
               >
                 <option value="">Year</option>
                 {Array.from({ length: 22 }, (_, i) => 2026 - i).map(year => (
                   <option key={year} value={year}>{year}</option>
                 ))}
               </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '20px', marginBottom: '32px' }}>
               <div className="input-group">
                 <label className="label" style={{ whiteSpace: 'nowrap' }}>Principal (₹)</label>
                 <input required className="input-modern" type="number" value={formData.loanAmount} onChange={(e) => setFormData({...formData, loanAmount: e.target.value})} />
               </div>
               <div className="input-group">
                 <label className="label" style={{ whiteSpace: 'nowrap' }}>Interest % (PM)</label>
                 <input required className="input-modern" type="number" value={formData.interestRate} onChange={(e) => setFormData({...formData, interestRate: e.target.value})} />
               </div>
               <div className="input-group">
                 <label className="label">Months</label>
                 <input required className="input-modern" type="number" value={formData.emiMonths} onChange={(e) => setFormData({...formData, emiMonths: e.target.value})} />
               </div>
            </div>

            {tab === 'new' && (
              <div className="input-group" style={{ marginBottom: '32px' }}>
                <label className="label">Contract Start Date</label>
                <input 
                  required
                  className="input-modern" 
                  type="date" 
                  value={formData.nextDueDate} 
                  onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})} 
                />
              </div>
            )}

            {tab === 'migrate' && (
              <div className="animate-fade" style={{ padding: '24px', background: 'rgba(255,61,94,0.05)', borderRadius: '16px', marginBottom: '32px', border: '1px solid var(--border-accent)' }}>
                 <p className="label" style={{ color: 'var(--accent-main)' }}>MIGRATION DETAILS</p>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="input-group">
                      <label className="label">Already Paid EMIs</label>
                      <input 
                        required
                        className="input-modern" 
                        type="number" 
                        value={formData.paidEMI === 0 ? '' : formData.paidEMI} 
                        onChange={(e) => setFormData({...formData, paidEMI: e.target.value === '' ? 0 : parseInt(e.target.value)})} 
                        placeholder="0"
                      />
                    </div>
                    <div className="input-group">
                      <label className="label">Last Payment Date</label>
                      <input required className="input-modern" type="date" value={formData.nextDueDate} onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})} />
                    </div>
                 </div>
              </div>
            )}

            <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                 <span className="label">EMI Amount (Monthly)</span>
                 <span className="font-black" style={{ fontSize: '24px', color: 'var(--accent-main)' }}>₹{emiDetails.emi || '0.00'}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                 <span className="label">Document Charge (10% Deducted)</span>
                 <span className="font-black">₹{emiDetails.documentCharges || '0.00'}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                 <span className="font-black" style={{ fontSize: '16px' }}>HANDOVER CASH</span>
                 <span className="font-black text-success" style={{ fontSize: '32px' }}>₹{emiDetails.amountInHand || '0.00'}</span>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
               {editingCustomer && (
                 <button type="button" onClick={onCancel} className="btn-primary" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
                   Cancel
                 </button>
               )}
               <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {editingCustomer ? 'Update Contract' : 'Confirm & Save Contract'} <Zap size={18} />
               </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoanRegistration;
