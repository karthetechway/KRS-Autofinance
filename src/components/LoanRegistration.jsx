import React, { useState } from 'react';
import { Camera, ShieldCheck, FileText, IndianRupee, Calendar, User, Phone, MapPin, Bike, Calculator, Zap, CheckCircle2 } from 'lucide-react';
import { calculateEMI } from '../utils/finance';
import { format } from 'date-fns';

const LoanRegistration = ({ onAdd }) => {
  const [tab, setTab] = useState('new');
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', aadhar: '',
    vehicleModel: '', vehicleNumber: '', modelYear: '',
    loanAmount: '', interestRate: '12', emiMonths: '12',
    docCharge: '10', paidEMI: 0, nextDueDate: format(new Date(), 'yyyy-MM-dd'),
    photo: null, aadharFile: null, rcFile: null
  });

  const handleFile = (field, file) => {
    const reader = new FileReader();
    reader.onload = (e) => setFormData({ ...formData, [field]: e.target.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emiDetails = calculateEMI(formData.loanAmount, formData.interestRate, formData.emiMonths);
    onAdd({ ...formData, ...emiDetails });
  };

  const emiDetails = calculateEMI(formData.loanAmount, formData.interestRate, formData.emiMonths);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="tab-container">
        <button onClick={() => setTab('new')} className={`tab-btn ${tab === 'new' ? 'active' : ''}`}>Fresh New Loan</button>
        <button onClick={() => setTab('migrate')} className={`tab-btn ${tab === 'migrate' ? 'active' : ''}`}>Migrate Existing Customer</button>
      </div>



      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
             <p className="label">Step 1: Identity & Assets</p>
             <div className="upload-grid">
                <div className={`file-upload-card ${formData.photo ? 'has-file' : ''}`}>
                   <input type="file" accept="image/*" onChange={(e) => handleFile('photo', e.target.files[0])} />
                   <div className="icon-container">{formData.photo ? <CheckCircle2 size={32} /> : <Camera size={32} />}</div>
                   <span>{formData.photo ? 'Photo Loaded' : 'Customer Photo'}</span>
                </div>
                <div className={`file-upload-card ${formData.aadharFile ? 'has-file' : ''}`}>
                   <input type="file" accept="image/*" onChange={(e) => handleFile('aadharFile', e.target.files[0])} />
                   <div className="icon-container">{formData.aadharFile ? <CheckCircle2 size={32} /> : <ShieldCheck size={32} />}</div>
                   <span>{formData.aadharFile ? 'Aadhar Verified' : 'Aadhar ID'}</span>
                </div>
                <div className={`file-upload-card ${formData.rcFile ? 'has-file' : ''}`}>
                   <input type="file" accept="image/*" onChange={(e) => handleFile('rcFile', e.target.files[0])} />
                   <div className="icon-container">{formData.rcFile ? <CheckCircle2 size={32} /> : <FileText size={32} />}</div>
                   <span>{formData.rcFile ? 'RC Book Loaded' : 'RC Book'}</span>
                </div>
             </div>
          </div>

          <div>
             <p className="label">Step 2: Basic Details</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input className="input-modern" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input className="input-modern" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <textarea className="input-modern" placeholder="Permanent Address" style={{ height: '80px' }} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <p className="label">Step 3: Vehicle & Loan Math</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
               <input className="input-modern" placeholder="Vehicle Model" value={formData.vehicleModel} onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})} />
               <input className="input-modern" placeholder="Vehicle Number" value={formData.vehicleNumber} onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
               <div className="input-group">
                 <label className="label">Principal (₹)</label>
                 <input className="input-modern" type="number" value={formData.loanAmount} onChange={(e) => setFormData({...formData, loanAmount: e.target.value})} />
               </div>
               <div className="input-group">
                 <label className="label">Interest %</label>
                 <input className="input-modern" type="number" value={formData.interestRate} onChange={(e) => setFormData({...formData, interestRate: e.target.value})} />
               </div>
               <div className="input-group">
                 <label className="label">Months</label>
                 <input className="input-modern" type="number" value={formData.emiMonths} onChange={(e) => setFormData({...formData, emiMonths: e.target.value})} />
               </div>
            </div>

            {tab === 'new' && (
              <div className="input-group" style={{ marginBottom: '32px' }}>
                <label className="label">Contract Start Date</label>
                <input 
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
                      <input className="input-modern" type="number" value={formData.paidEMI} onChange={(e) => setFormData({...formData, paidEMI: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="input-group">
                      <label className="label">Last Payment Date</label>
                      <input className="input-modern" type="date" value={formData.nextDueDate} onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})} />
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

            <button type="submit" className="btn-primary" style={{ marginTop: '40px' }}>
               Confirm & Save Contract <Zap size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoanRegistration;
