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
  CheckCircle2
} from 'lucide-react';
import { calculateEMI } from '../utils/finance';

const NewLoan = ({ onAdd }) => {
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
    onAdd({ ...formData, emiAmount: calculation.emi });
  };

  const renderField = (label, name, IconComponent, placeholder, type = "text", required = true) => (
    <div className="input-group">
      <label className="label">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent-main transition-colors">
          <IconComponent size={18} />
        </div>
        <input 
          required={required}
          type={type}
          name={name} 
          value={formData[name]} 
          onChange={handleChange} 
          className="input-modern pl-12" 
          placeholder={placeholder} 
        />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
      <div className="xl:col-span-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="stats-card">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <User className="text-accent-main" size={20} />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {renderField("Customer Full Name", "name", User, "e.g. Rahul Sharma")}
              {renderField("Primary Contact", "phone", Phone, "+91 98765 43210")}
              <div className="md:col-span-2">
                {renderField("Residential Address", "address", MapPin, "Complete house address with landmark")}
              </div>
              {renderField("Aadhar Document ID", "aadhar", CreditCard, "12-digit UID")}
            </div>
          </div>

          <div className="stats-card">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <Bike className="text-accent-main" size={20} />
              Collateral Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {renderField("Vehicle Model", "vehicleModel", Bike, "e.g. Royal Enfield Classic")}
              {renderField("Manufacturing Year", "vehicleYear", Calendar, "YYYY", "number")}
              {renderField("Registration Number", "vehicleNumber", ShieldCheck, "TN 01 AB 1234")}
              {renderField("RC Status / Details", "rcDetails", CreditCard, "Current RC Status")}
            </div>
          </div>

          <div className="stats-card">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <IndianRupee className="text-accent-main" size={20} />
              Contract Terms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
              {renderField("Loan Principal", "loanAmount", IndianRupee, "0.00", "number")}
              {renderField("Flat Interest (%)", "interestRate", Percent, "0.0", "number")}
              {renderField("Tenure (Months)", "emiMonths", Clock, "Months", "number")}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-6 text-lg group">
            Activate Finance Contract
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>

      <div className="xl:col-span-4">
        <div className="sticky top-10 space-y-6">
          <div className="stats-card border-accent-main/30 ring-4 ring-accent-main/5">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <Calculator className="text-accent-main" size={22} />
                Quote Engine
              </h3>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-main/10 text-accent-main rounded-md text-[9px] font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-accent-main rounded-full animate-pulse"></div>
                Real-Time
              </div>
            </div>

            {!calculation ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6 text-muted border border-dashed border-white/10">
                  <Calculator size={28} />
                </div>
                <p className="text-muted font-bold text-sm px-10">Enter contract terms to generate a breakdown</p>
              </div>
            ) : (
              <div className="space-y-8 animate-slide-up">
                <div className="text-center p-8 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                  <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2">Monthly Installment</p>
                  <p className="text-5xl font-black gold-text">₹{calculation.emi}</p>
                </div>

                <div className="space-y-5 px-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted font-bold">Principal</span>
                    <span className="font-extrabold">₹{parseFloat(formData.loanAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted font-bold">Processing (10%)</span>
                    <span className="text-error font-extrabold">- ₹{calculation.documentCharges}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-success/10 rounded-2xl border border-success/20">
                    <span className="text-success text-xs font-black uppercase tracking-widest">Net Disbursal</span>
                    <span className="text-success font-black">₹{calculation.amountInHand}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5">
                    <span className="text-muted font-bold">Aggregate Interest</span>
                    <span className="text-accent-main font-extrabold">₹{calculation.totalInterest}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted font-bold text-sm">Contract Total</span>
                    <span className="text-xl font-black">₹{calculation.totalPayable}</span>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-accent-main/5 rounded-2xl border border-accent-main/10">
                  <CheckCircle2 className="text-accent-main flex-shrink-0" size={16} />
                  <p className="text-[10px] text-muted leading-relaxed font-semibold">
                    The EMI is calculated on the aggregate principal and interest. 10% processing fee is deducted from the net payout.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLoan;
