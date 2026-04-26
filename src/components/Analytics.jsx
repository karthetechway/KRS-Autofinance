import React from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  Target, 
  IndianRupee,
  Calendar,
  Download,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  BarChart3,
  Clock
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { calculateLateFees } from '../utils/finance';

const Analytics = ({ contracts }) => {
  const delinquentContracts = contracts.filter(c => {
    const nextDue = new Date(c.nextDueDate);
    return nextDue < new Date() && c.status === 'active';
  });

  const totalDelinquentAmount = delinquentContracts.reduce((acc, c) => {
    const lateFees = calculateLateFees(c.nextDueDate);
    return acc + parseFloat(c.emiAmount) + lateFees;
  }, 0);

  return (
    <div className="space-y-12">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Delinquency Analysis</h2>
          <p className="text-muted font-medium mt-1">Audit of overdue agreements and risk assessment</p>
        </div>
        
        <div className="flex gap-4 w-full xl:w-auto">
          <button className="flex-1 sm:flex-none px-8 py-4 bg-error text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
            <AlertTriangle size={16} />
            Generate Risk Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-10 bg-[#0c0c14] border border-error/20 bg-gradient-to-br from-error/[0.05] via-transparent to-transparent rounded-[48px]">
          <div className="flex justify-between items-center mb-10">
            <div className="p-4 bg-error/10 rounded-2xl">
              <ShieldAlert className="text-error" size={32} />
            </div>
            <div className="px-3 py-1.5 bg-error/10 text-error rounded-full text-[10px] font-black uppercase tracking-widest">High Risk</div>
          </div>
          <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2">Delinquent Agreements</p>
          <h3 className="text-5xl font-black tracking-tight">{delinquentContracts.length}</h3>
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-3">
            <TrendingUp size={16} className="text-error rotate-180" />
            <p className="text-[11px] font-bold text-muted uppercase tracking-widest">+2.4% vs prev. month</p>
          </div>
        </div>
        
        <div className="p-10 bg-[#0c0c14] border border-white/[0.05] rounded-[48px]">
          <div className="flex justify-between items-center mb-10">
            <div className="p-4 bg-accent-main/10 rounded-2xl">
              <Target className="text-accent-main" size={32} />
            </div>
          </div>
          <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2">Portfolio at Risk (PAR)</p>
          <h3 className="text-5xl font-black tracking-tight gold-text">₹{totalDelinquentAmount.toLocaleString()}</h3>
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-3">
            <BarChart3 size={16} className="text-accent-main" />
            <p className="text-[11px] font-bold text-muted uppercase tracking-widest italic">Including accrued penalty surcharges</p>
          </div>
        </div>

        <div className="p-10 bg-[#0c0c14] border border-success/20 bg-gradient-to-br from-success/[0.05] via-transparent to-transparent rounded-[48px]">
          <div className="flex justify-between items-center mb-10">
            <div className="p-4 bg-success/10 rounded-2xl">
              <TrendingUp className="text-success" size={32} />
            </div>
            <ArrowUpRight className="text-success" size={24} />
          </div>
          <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2">Settlement Efficiency</p>
          <h3 className="text-5xl font-black tracking-tight text-success">92.4%</h3>
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
            <div className="w-full bg-success/10 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-success transition-all duration-1000" style={{ width: '92.4%' }}></div>
            </div>
            <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Exceeding benchmark (88%)</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0c0c14] border border-white/[0.05] rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-white/[0.05] bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
          <div>
            <h3 className="text-2xl font-black tracking-tight">Delinquency Aging Report</h3>
            <p className="text-sm font-medium text-muted mt-1">Institutional audit of non-performing assets (NPAs)</p>
          </div>
          <button className="w-full sm:w-auto px-8 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center justify-center gap-3">
            <Download size={18} />
            Download Full Audit
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Agreement Representative</th>
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Maturity Date</th>
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Aging Profile</th>
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Installment</th>
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Accrued Penalty</th>
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Total Liability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {delinquentContracts.map((c) => {
                const daysOverdue = differenceInDays(new Date(), new Date(c.nextDueDate));
                const lateFees = calculateLateFees(c.nextDueDate);
                const total = parseFloat(c.emiAmount) + lateFees;

                return (
                  <tr key={c.id} className="hover:bg-white/[0.01] transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center font-black text-error border border-error/20">
                          {c.name[0]}
                        </div>
                        <span className="font-bold text-lg tracking-tight">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/10 rounded-xl w-fit">
                        <Calendar size={14} className="text-muted" />
                        <span className="text-xs font-black tracking-tight">{format(new Date(c.nextDueDate), 'MMM dd, yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-error/10 rounded-lg">
                          <Clock className="text-error" size={14} />
                        </div>
                        <span className="text-sm font-black text-error uppercase tracking-widest">{daysOverdue} Days Aging</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 font-black text-lg">₹{parseFloat(c.emiAmount).toLocaleString()}</td>
                    <td className="px-10 py-8">
                      <div className="px-4 py-2 bg-accent-main/10 border border-accent-main/20 rounded-xl w-fit">
                        <span className="text-accent-main font-black text-sm">₹{lateFees}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="p-6 bg-error/5 border border-error/10 rounded-3xl group-hover:border-error/40 transition-all">
                        <p className="text-2xl font-black text-error tracking-tight">₹{total.toLocaleString()}</p>
                        <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mt-1">Settlement Pending</p>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {delinquentContracts.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-48 text-center">
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="w-24 h-24 bg-success/10 border border-dashed border-success/20 rounded-full flex items-center justify-center mx-auto text-success">
                        <Target size={48} />
                      </div>
                      <h4 className="text-2xl font-black tracking-tight">Optimal Collection Health</h4>
                      <p className="text-muted font-medium text-lg leading-relaxed">No delinquent agreements detected in the current audit cycle.</p>
                      <button className="px-8 py-4 bg-success/10 text-success border border-success/20 rounded-2xl font-black text-xs uppercase tracking-widest">View Recovery Trends</button>
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

export default Analytics;
