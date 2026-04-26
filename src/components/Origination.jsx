import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Bike, 
  Calendar, 
  IndianRupee, 
  Percent,
  Clock,
  Calculator,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  BadgeAlert
} from 'lucide-react';
import { calculateEMI } from '../utils/finance';

const Origination = ({ onInitiate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    aadhar: '',
    rcDetails: '',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleYear: '',
    loanAmount: '',
    interestRate: '',
    emiMonths: '',
  });

  const [calculation, setCalculation] = useState(null);

  useEffect(() => {
    if (formData.loanAmount && formData.interestRate && formData.emiMonths) {
      const res = calculateEMI(formData.loanAmount, formData.interestRate, formData.emiMonths);
      setCalculation(res);
    } else {
      setCalculation(null);
    }
  }, [formData.loanAmount, formData.interestRate, formData.emiMonths]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!calculation) return;
    onInitiate({ ...formData, emiAmount: calculation.emi });
  };

  const InputWrapper = ({ label, icon: Icon, children }) => (
    <div className="space-y-3 mb-8">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1 flex items-center gap-2">
        <Icon size={12} className="text-accent-main" />
        {label}
      </label>
      <div className="relative group">
        {children}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
      <div className="xl:col-span-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Contract Origination</h2>
              <p className="text-muted font-medium mt-1">Initiating asset-backed financial agreement</p>
            </div>
            <div className="bg-accent-main/10 px-4 py-2 rounded-full border border-accent-main/20 flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-main rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-accent-main uppercase tracking-widest">Compliance Mode Active</span>
            </div>
          </div>

          {/* Section 1: Entity Identification */}
          <div className="p-10 bg-[#0c0c14] border border-white/[0.05] rounded-[48px]">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-accent-main/10 flex items-center justify-center text-accent-main">
                <User size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase tracking-widest">Entity Identification</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <InputWrapper label="Legal Representative Name" icon={User}>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-4 text-lg font-bold focus:outline-none focus:border-accent-main transition-all" placeholder="Enter full legal name" />
              </InputWrapper>
              
              <InputWrapper label="Primary Authentication Contact" icon={Phone}>
                <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-4 text-lg font-bold focus:outline-none focus:border-accent-main transition-all" placeholder="+91 XXXX XXX XXX" />
              </InputWrapper>

              <div className="md:col-span-2">
                <InputWrapper label="Residential Domicile" icon={MapPin}>
                  <textarea required name="address" value={formData.address} onChange={handleChange} className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-4 text-lg font-bold focus:outline-none focus:border-accent-main transition-all h-24 resize-none" placeholder="Provide full verified address"></textarea>
                </InputWrapper>
              </div>

              <InputWrapper label="National ID (Aadhar)" icon={ShieldCheck}>
                <input required name="aadhar" value={formData.aadhar} onChange={handleChange} className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-4 text-lg font-bold focus:outline-none focus:border-accent-main transition-all" placeholder="XXXX XXXX XXXX" />
              </InputWrapper>
            </div>
          </div>

          {/* Section 2: Collateral Assessment */}
          <div className="p-10 bg-[#0c0c14] border border-white/[0.05] rounded-[48px]">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-accent-main/10 flex items-center justify-center text-accent-main">
                <Bike size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase tracking-widest">Collateral Assessment</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <InputWrapper label="Asset Class / Model" icon={Bike}>
                <input required name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-4 text-lg font-bold focus:outline-none focus:border-accent-main transition-all" placeholder="Manufacturer & Variant" />
              </InputWrapper>
              
              <InputWrapper label="Vintage Year" icon={Calendar}>
                <input required type="number" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-4 text-lg font-bold focus:outline-none focus:border-accent-main transition-all" placeholder="YYYY" />
              </InputWrapper>

              <InputWrapper label="Registration Identifier" icon={ShieldCheck}>
                <input required name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-4 text-lg font-bold focus:outline-none focus:border-accent-main transition-all uppercase" placeholder="XX XX XX XXXX" />
              </InputWrapper>

              <InputWrapper label="RC Document Repository Ref" icon={FileText}>
                <input required name="rcDetails" value={formData.rcDetails} onChange={handleChange} className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-4 text-lg font-bold focus:outline-none focus:border-accent-main transition-all" placeholder="Storage Reference ID" />
              </InputWrapper>
            </div>
          </div>

          {/* Section 3: Financial Parameters */}
          <div className="p-10 bg-[#0c0c14] border border-white/[0.05] rounded-[48px]">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-accent-main/10 flex items-center justify-center text-accent-main">
                <IndianRupee size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase tracking-widest">Financial Parameters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
              <InputWrapper label="Requested Principal" icon={IndianRupee}>
                <input required type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-4 text-lg font-bold focus:outline-none focus:border-accent-main transition-all" placeholder="0.00" />
              </InputWrapper>
              
              <InputWrapper label="Market APR (%)" icon={Percent}>
                <input required type="number" name="interestRate" value={formData.interestRate} onChange={handleChange} className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-4 text-lg font-bold focus:outline-none focus:border-accent-main transition-all" placeholder="0.0" />
              </InputWrapper>

              <InputWrapper label="Maturity Term (Months)" icon={Clock}>
                <input required type="number" name="emiMonths" value={formData.emiMonths} onChange={handleChange} className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-4 text-lg font-bold focus:outline-none focus:border-accent-main transition-all" placeholder="Months" />
              </InputWrapper>
            </div>
          </div>

          <button type="submit" className="w-full py-8 bg-accent-main text-black rounded-[32px] font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-accent-main/20 flex items-center justify-center gap-4 group">
            Authorize & Deploy Contract
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </form>
      </div>

      <div className="xl:col-span-4 sticky top-28">
        <div className="p-10 bg-[#0c0c14] border-2 border-accent-main/20 rounded-[48px] shadow-2xl shadow-accent-main/5 space-y-10">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
              <Calculator className="text-accent-main" />
              Projected Amortization
            </h3>
            <span className="text-[9px] font-black uppercase tracking-widest bg-accent-main/10 text-accent-main px-3 py-1 rounded-full border border-accent-main/20">Institutional Quote</span>
          </div>

          {!calculation ? (
            <div className="text-center py-24 space-y-6">
              <div className="w-24 h-24 bg-white/[0.02] border border-dashed border-white/10 rounded-full flex items-center justify-center mx-auto text-muted animate-pulse">
                <Calculator size={40} />
              </div>
              <p className="text-muted font-bold text-sm uppercase tracking-widest leading-relaxed px-12">Awaiting contract parameters for yield generation.</p>
            </div>
          ) : (
            <div className="space-y-10 animate-fade-in">
              <div className="text-center p-10 bg-white/[0.02] rounded-[40px] border border-white/[0.05]">
                <p className="text-muted text-[10px] font-black uppercase tracking-[0.3em] mb-4">Monthly Amortization</p>
                <p className="text-6xl font-black text-accent-main tracking-tight">₹{calculation.emi}</p>
              </div>

              <div className="space-y-6 px-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted text-xs font-bold uppercase tracking-widest">Gross Principal</span>
                  <span className="text-lg font-black">₹{parseFloat(formData.loanAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-6 bg-error/5 rounded-3xl border border-error/10">
                  <span className="text-error text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <BadgeAlert size={14} />
                    Processing Surcharge (10%)
                  </span>
                  <span className="text-error font-black text-lg">- ₹{calculation.documentCharges}</span>
                </div>
                <div className="flex justify-between items-center p-8 bg-success/10 rounded-[32px] border border-success/20">
                  <div className="space-y-1">
                    <span className="text-success text-[10px] font-black uppercase tracking-[0.2em]">Net Disbursement</span>
                    <p className="text-[9px] text-success/60 font-bold uppercase tracking-widest">Amount in hand</p>
                  </div>
                  <span className="text-success font-black text-3xl">₹{calculation.amountInHand}</span>
                </div>
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted text-xs font-bold uppercase tracking-widest">Accrued Interest</span>
                    <span className="text-accent-main font-black">₹{calculation.totalInterest}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted text-xs font-bold uppercase tracking-widest">Aggregated Liability</span>
                    <span className="text-2xl font-black">₹{calculation.totalPayable}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-accent-main/5 rounded-3xl border border-accent-main/10 flex items-start gap-4">
                <ShieldCheck className="text-accent-main mt-1 flex-shrink-0" size={18} />
                <p className="text-[10px] text-muted leading-relaxed font-bold uppercase tracking-wider">
                  The quoted amortization schedule is binding upon contract execution. Processing surcharges are non-refundable and deducted at source.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Origination;
