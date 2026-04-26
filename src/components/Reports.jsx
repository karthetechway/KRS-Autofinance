import React from 'react';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  IndianRupee,
  Calendar,
  Download,
  ShieldAlert,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { calculateLateFees } from '../utils/finance';

const Reports = ({ customers }) => {
  const overdueCustomers = customers.filter(c => {
    const nextDue = new Date(c.nextDueDate);
    return nextDue < new Date() && c.status === 'active';
  });

  const totalOverdueAmount = overdueCustomers.reduce((acc, c) => {
    const lateFees = calculateLateFees(c.nextDueDate);
    return acc + parseFloat(c.emiAmount) + lateFees;
  }, 0);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="stats-card !border-error/20 bg-gradient-to-br from-error/[0.03] to-transparent">
          <div className="flex justify-between items-center mb-6">
            <div className="p-3 bg-error/10 rounded-2xl">
              <ShieldAlert className="text-error" size={24} />
            </div>
            <span className="text-[10px] font-black text-error bg-error/10 px-2 py-1 rounded-lg uppercase tracking-widest">At Risk</span>
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Delinquent Accounts</p>
          <h3 className="text-4xl font-extrabold">{overdueCustomers.length}</h3>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-muted">
            <TrendingUp size={14} className="text-error rotate-180" />
            <span>Increased by 2 from last week</span>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex justify-between items-center mb-6">
            <div className="p-3 bg-accent-main/10 rounded-2xl">
              <Target className="text-accent-main" size={24} />
            </div>
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Outstanding Pipeline</p>
          <h3 className="text-4xl font-extrabold gold-text">₹{totalOverdueAmount.toLocaleString()}</h3>
          <p className="text-[11px] text-muted font-bold mt-4 italic">Weighted including ₹10/day penalty fees</p>
        </div>

        <div className="stats-card !border-success/20 bg-gradient-to-br from-success/[0.03] to-transparent">
          <div className="flex justify-between items-center mb-6">
            <div className="p-3 bg-success/10 rounded-2xl">
              <TrendingUp className="text-success" size={24} />
            </div>
            <ArrowUpRight className="text-success" size={20} />
          </div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Collection Efficiency</p>
          <h3 className="text-4xl font-extrabold text-success">92.4%</h3>
          <div className="w-full bg-success/10 h-1.5 rounded-full mt-5">
            <div className="bg-success h-full rounded-full" style={{ width: '92.4%' }}></div>
          </div>
        </div>
      </div>

      <div className="data-grid-container shadow-2xl">
        <div className="p-8 border-b border-subtle bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Delinquency Analysis</h3>
            <p className="text-sm text-muted font-medium">Detailed audit of overdue contracts and penalty accruals.</p>
          </div>
          <button className="btn-primary !py-3 !px-6 text-sm">
            <Download size={18} />
            Export Audit
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-grid">
            <thead>
              <tr>
                <th>Debtor</th>
                <th>Agreement Date</th>
                <th>Aging (Days)</th>
                <th>Base Installment</th>
                <th>Penalty Accrued</th>
                <th>Total Liability</th>
              </tr>
            </thead>
            <tbody>
              {overdueCustomers.map((c) => {
                const daysOverdue = differenceInDays(new Date(), new Date(c.nextDueDate));
                const lateFees = calculateLateFees(c.nextDueDate);
                const total = parseFloat(c.emiAmount) + lateFees;

                return (
                  <tr key={c.id}>
                    <td className="font-bold">{c.name}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-muted" />
                        <span className="text-xs font-bold">{format(new Date(c.nextDueDate), 'MMM dd, yyyy')}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-error font-black text-xs px-2 py-1 bg-error/10 rounded-lg">
                        {daysOverdue} Days Past Due
                      </span>
                    </td>
                    <td className="font-bold">₹{parseFloat(c.emiAmount).toLocaleString()}</td>
                    <td className="text-accent-main font-black">₹{lateFees}</td>
                    <td>
                      <div className="inline-flex flex-col">
                        <span className="text-lg font-black text-error">₹{total.toLocaleString()}</span>
                        <span className="text-[9px] font-black uppercase text-muted tracking-tighter">Settlement Required</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {overdueCustomers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success border border-success/20">
                        <CheckCircle2 size={40} />
                      </div>
                      <h4 className="text-xl font-bold">Optimal Collection Health</h4>
                      <p className="text-sm text-muted font-medium">All active contracts are currently performing within agreed terms.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
