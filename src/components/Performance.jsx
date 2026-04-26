import React from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  BarChart2,
  PieChart,
  ArrowRight
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { motion } from 'framer-motion';

const Performance = ({ contracts }) => {
  const activePortfolio = contracts.length;
  const netPrincipalValue = contracts.reduce((acc, curr) => acc + parseFloat(curr.loanAmount || 0), 0);
  
  const weeklyMaturity = contracts.filter(c => {
    const nextDue = new Date(c.nextDueDate);
    return isWithinInterval(nextDue, {
      start: startOfWeek(new Date()),
      end: endOfWeek(new Date())
    });
  });

  const kpis = [
    { label: 'Active Asset Base', value: activePortfolio, detail: 'Net Contracts', icon: Briefcase, trend: '+4%', up: true },
    { label: 'Gross Portfolio Value', value: `₹${(netPrincipalValue / 100000).toFixed(2)}L`, detail: 'Current Principal', icon: Target, trend: '+12%', up: true },
    { label: 'Weekly Projected Yield', value: `₹${(weeklyMaturity.reduce((acc, c) => acc + parseFloat(c.emiAmount), 0)).toLocaleString()}`, detail: 'Expected Collections', icon: TrendingUp, trend: '+2.5%', up: true },
    { label: 'Recovery Efficiency', value: '94.2%', detail: 'LTM performance', icon: BarChart2, trend: '-0.4%', up: false },
  ];

  return (
    <div className="space-y-12">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="group p-8 bg-[#0c0c14] border border-white/[0.05] rounded-[32px] hover:border-accent-main/20 transition-all duration-500 hover:shadow-2xl hover:shadow-accent-main/5">
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-accent-main/10 rounded-2xl group-hover:bg-accent-main group-hover:text-black transition-all duration-500">
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                  kpi.up ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {kpi.trend}
                </div>
              </div>
              <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
              <h3 className="text-4xl font-black mb-1">{kpi.value}</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{kpi.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Market Summary */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex justify-between items-center px-2">
            <div>
              <h3 className="text-2xl font-black tracking-tight">Portfolio Distribution</h3>
              <p className="text-muted text-sm font-medium mt-1">Real-time contract performance analytics</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Daily</button>
              <button className="px-4 py-2 bg-accent-main text-black rounded-xl text-xs font-bold">Weekly</button>
            </div>
          </div>

          <div className="p-10 bg-[#0c0c14] border border-white/[0.05] rounded-[40px] relative overflow-hidden group">
            <div className="flex flex-col md:flex-row justify-between gap-12">
              <div className="flex-1 space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-muted uppercase tracking-widest">Active Yield</span>
                    <span className="text-3xl font-black text-accent-main">₹{(netPrincipalValue * 0.14).toLocaleString()}</span>
                  </div>
                  <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '74%' }}
                      className="h-full bg-gradient-to-r from-accent-main-dark to-accent-main"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Projection based on 14% LTM yield average</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-muted text-[10px] font-black uppercase tracking-widest">Delinquency Rate</p>
                    <p className="text-2xl font-black">2.4%</p>
                    <div className="h-1 w-full bg-error/20 rounded-full">
                      <div className="h-full bg-error w-[12%] rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted text-[10px] font-black uppercase tracking-widest">Settlement Rate</p>
                    <p className="text-2xl font-black">98.1%</p>
                    <div className="h-1 w-full bg-success/20 rounded-full">
                      <div className="h-full bg-success w-[98%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-72 flex flex-col justify-center items-center text-center p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl backdrop-blur-sm">
                <div className="w-40 h-40 rounded-full border-[12px] border-white/5 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 border-[12px] border-accent-main rounded-full border-t-transparent -rotate-45"></div>
                  <p className="text-3xl font-black">84%</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted">Efficiency</p>
                </div>
                <div className="mt-8 space-y-4 w-full">
                  <p className="text-xs font-bold text-muted">Portfolio health is within institutional parameters.</p>
                  <button className="w-full py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-main hover:text-black transition-all">
                    Generate Audit
                  </button>
                </div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-main/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black tracking-tight px-2">Operational Feed</h3>
          <div className="space-y-4">
            {contracts.slice(-4).reverse().map((contract, i) => (
              <div key={contract.id} className="p-6 bg-[#0c0c14] border border-white/[0.05] rounded-3xl flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center font-black text-accent-main group-hover:scale-110 transition-transform">
                    {contract.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-tight">{contract.name}</p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Origination Successful</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm">₹{parseFloat(contract.loanAmount).toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-success uppercase tracking-tighter mt-1">{format(new Date(contract.activationDate), 'HH:mm')}</p>
                </div>
              </div>
            ))}
            {contracts.length === 0 && (
              <div className="p-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[32px]">
                <Clock className="mx-auto text-muted mb-4 opacity-20" size={40} />
                <p className="text-sm font-bold text-muted uppercase tracking-widest">Awaiting Transactions</p>
              </div>
            )}
            <button className="w-full py-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-3xl text-xs font-black uppercase tracking-[0.3em] text-muted hover:text-white transition-all flex items-center justify-center gap-3">
              View Activity History
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
