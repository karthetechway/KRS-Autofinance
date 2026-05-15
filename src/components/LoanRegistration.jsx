import React, { useState } from 'react';
import { Camera, ShieldCheck, FileText, IndianRupee, Calendar, User, Phone, MapPin, Bike, Calculator, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { calculateEMI } from '../utils/finance';
import { format, addMonths } from 'date-fns';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const LoanRegistration = ({ onAdd, onUpdate, editingCustomer, onCancel }) => {
  const [tab, setTab] = useState('new');
  const [isUploading, setIsUploading] = useState(false);
  const initialForm = {
    name: '', phone: '', address: '', aadhar: '',
    vehicleModel: '', vehicleNumber: '', modelYear: format(new Date(), 'yyyy'),
    loanAmount: '', interestRate: '', emiMonths: '',
    docCharge: '10', paidEMI: 0, loanStartDate: format(new Date(), 'yyyy-MM-dd'), nextDueDate: format(new Date(), 'yyyy-MM-dd'),
    photo: null, photoName: '', 
    rcFront: null, rcFrontName: '', rcBack: null, rcBackName: '',
    aadharFront: null, aadharFrontName: '', aadharBack: null, aadharBackName: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [fileObjects, setFileObjects] = useState({}); // To store raw File objects

  React.useEffect(() => {
    if (editingCustomer) {
      setFormData({ ...initialForm, ...editingCustomer });
      setTab('migrate'); // Always go to Migrate when editing from ledger
    }
  }, [editingCustomer]);

  const handleTabChange = (newTab) => {
    if (newTab === tab) return;

    // Check if any major field is filled to determine if "typing" has happened
    const hasData = formData.name || formData.phone || formData.vehicleNumber || (formData.loanAmount && formData.loanAmount !== '');

    if (hasData) {
      if (!window.confirm("You were typing! If you move from here, the data will reset. Continue?")) {
        return;
      }
    }

    setTab(newTab);
    setFormData(initialForm);
    setFileObjects({});
    
    // If we were editing a customer and switched to a different tab, cancel the edit mode
    if (editingCustomer) {
      onCancel();
    }
  };

  // Helper to update nextDueDate based on loanStartDate and paidEMI
  const suggestDueDate = (startDate, paidCount) => {
    if (!startDate) return;
    try {
      const date = new Date(startDate);
      const suggested = format(addMonths(date, parseInt(paidCount) + 1), 'yyyy-MM-dd');
      setFormData(prev => ({ ...prev, nextDueDate: suggested }));
    } catch (e) {
      console.error("Date suggestion failed", e);
    }
  };

  const handleFile = (field, file) => {
    if (!file) return;
    
    // Preview locally
    const reader = new FileReader();
    reader.onload = (e) => setFormData(prev => ({ 
      ...prev, 
      [field]: e.target.result,
      [`${field.replace('File', '')}Name`]: file.name 
    }));
    reader.readAsDataURL(file);

    // Save actual file object for later upload
    setFileObjects(prev => ({ ...prev, [field]: file }));
  };

  const uploadFile = async (field, file) => {
    if (!file || typeof file === 'string') return file; // Already a URL or empty
    
    // Ensure phone is present for path, fallback to a unique timestamp if missing
    const pathId = formData.phone ? formData.phone.trim().replace(/\s+/g, '_') : `anonymous_${Date.now()}`;
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const storageRef = ref(storage, `documents/${pathId}/${field}_${Date.now()}_${uniqueSuffix}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error(`Error uploading ${field}:`, error);
      throw error; // Rethrow to be caught by handleSubmit
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone) {
      alert("Please provide a phone number before uploading documents.");
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload all new files
      const uploadTasks = [
        uploadFile('photo', fileObjects.photo),
        uploadFile('rcFront', fileObjects.rcFront),
        uploadFile('rcBack', fileObjects.rcBack),
        uploadFile('aadharFront', fileObjects.aadharFront),
        uploadFile('aadharBack', fileObjects.aadharBack),
      ];

      const [photoUrl, rcFrontUrl, rcBackUrl, aadharFrontUrl, aadharBackUrl] = await Promise.all(uploadTasks);

      const emiDetails = calculateEMI(formData.loanAmount, formData.interestRate, formData.emiMonths);
      const finalData = { 
        ...formData, 
        ...emiDetails, 
        emiAmount: emiDetails.emi,
        photo: photoUrl || formData.photo,
        rcFront: rcFrontUrl || formData.rcFront,
        rcBack: rcBackUrl || formData.rcBack,
        aadharFront: aadharFrontUrl || formData.aadharFront,
        aadharBack: aadharBackUrl || formData.aadharBack
      };
      
      if (editingCustomer && editingCustomer.id) {
        onUpdate(finalData);
      } else {
        onAdd(finalData);
      }
    } catch (err) {
      console.error("Critical Upload Error:", err);
      let errorMsg = "Document upload failed. ";
      
      if (err.code === 'storage/unauthorized') {
        errorMsg += "Permission denied. Please check Firebase Storage rules.";
      } else if (err.code === 'storage/project-not-found') {
        errorMsg += "Firebase project not found. Check your configuration.";
      } else if (err.code === 'storage/retry-limit-exceeded') {
        errorMsg += "Upload timed out. Please check your internet connection.";
      } else {
        errorMsg += err.message || "Please try again.";
      }
      
      alert(errorMsg);
    } finally {
      setIsUploading(false);
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
             <div className="upload-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                 <div className={`file-upload-card ${formData.photo ? 'has-file' : ''}`}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFile('photo', e.target.files[0])} />
                    <div className="icon-container">{formData.photo ? <CheckCircle2 size={24} /> : <Camera size={24} />}</div>
                    <span>{formData.photoName || 'Customer Photo'}</span>
                 </div>
                 
                 <div className={`file-upload-card ${formData.rcFront ? 'has-file' : ''}`}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFile('rcFront', e.target.files[0])} />
                    <div className="icon-container">{formData.rcFront ? <CheckCircle2 size={24} /> : <FileText size={24} />}</div>
                    <span>{formData.rcFrontName || 'RC Front'}</span>
                 </div>
                 <div className={`file-upload-card ${formData.rcBack ? 'has-file' : ''}`}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFile('rcBack', e.target.files[0])} />
                    <div className="icon-container">{formData.rcBack ? <CheckCircle2 size={24} /> : <FileText size={24} />}</div>
                    <span>{formData.rcBackName || 'RC Back'}</span>
                 </div>

                 <div className={`file-upload-card ${formData.aadharFront ? 'has-file' : ''}`}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFile('aadharFront', e.target.files[0])} />
                    <div className="icon-container">{formData.aadharFront ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}</div>
                    <span>{formData.aadharFrontName || 'Aadhar Front'}</span>
                 </div>
                 <div className={`file-upload-card ${formData.aadharBack ? 'has-file' : ''}`}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFile('aadharBack', e.target.files[0])} />
                    <div className="icon-container">{formData.aadharBack ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}</div>
                    <span>{formData.aadharBackName || 'Aadhar Back'}</span>
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
                  value={formData.loanStartDate} 
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setFormData({...formData, loanStartDate: newStart});
                    suggestDueDate(newStart, formData.paidEMI);
                  }} 
                />
              </div>
            )}

            {tab === 'migrate' && (
              <div className="animate-fade" style={{ padding: '24px', background: 'rgba(255,61,94,0.05)', borderRadius: '16px', marginBottom: '32px', border: '1px solid var(--border-accent)' }}>
                 <p className="label" style={{ color: 'var(--accent-main)' }}>MIGRATION DETAILS</p>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="input-group">
                      <label className="label">Loan Start Date</label>
                      <input 
                        required
                        className="input-modern" 
                        type="date" 
                        value={formData.loanStartDate} 
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setFormData({...formData, loanStartDate: newStart});
                          suggestDueDate(newStart, formData.paidEMI);
                        }} 
                      />
                    </div>
                    <div className="input-group">
                      <label className="label">Already Paid EMIs</label>
                      <input 
                        required
                        className="input-modern" 
                        type="number" 
                        value={formData.paidEMI === 0 ? '' : formData.paidEMI} 
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                          setFormData({...formData, paidEMI: val});
                          suggestDueDate(formData.loanStartDate, val);
                        }} 
                        placeholder="0"
                      />
                    </div>
                 </div>
                 <div className="input-group">
                    <label className="label">Next EMI Due Date (Auto-Suggested)</label>
                    <input required className="input-modern" type="date" value={formData.nextDueDate} onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})} />
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
               <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isUploading}>
                  {isUploading ? (
                    <><Loader2 className="animate-spin" size={18} /> UPLOADING DOCUMENTS...</>
                  ) : (
                    <>{editingCustomer && editingCustomer.id ? 'Update Contract' : 'Confirm & Save Contract'} <Zap size={18} /></>
                  )}
               </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoanRegistration;
