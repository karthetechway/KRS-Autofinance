import React from 'react';
import { 
  Briefcase, 
  Search, 
  Phone, 
  Calendar,
  ShieldCheck,
  ArrowRight,
  Filter,
  Download,
  MoreVertical,
  History,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

const Portfolio = ({ contracts, searchQuery }) => {
  const filteredContracts = contracts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Asset Portfolio</h2>
          <p className="text-muted font-medium mt-1">Management of active financial agreements</p>
        </div>
        
        <div className="flex gap-4 w-full xl:w-auto">
          <button className="flex-1 sm:flex-none px-8 py-4 bg-[#0c0c14] border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/[0.05] transition-all flex items-center justify-center gap-3">
            <Filter size={16} />
            Advanced Filters
          </button>
          <button className="flex-1 sm:flex-none px-8 py-4 bg-accent-main text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
            <Download size={16} />
            Institutional Export
          </button>
        </div>
      </div>

      <div className="bg-[#0c0c14] border border-white/[0.05] rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Contract Representative</th>
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Asset Profile</th>
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Agreement Value</th>
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Operational Status</th>
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Next Maturity</th>
                <th className="px-10 py-8 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="group hover:bg-white/[0.01] transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center font-black text-accent-main group-hover:border-accent-main/40 transition-all">
                        {contract.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-lg tracking-tight group-hover:text-accent-main transition-colors">{contract.name}</p>
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1 flex items-center gap-2">
                          <Phone size={10} className="text-accent-main" />
                          {contract.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1.5">
                      <p className="font-bold text-sm">{contract.vehicleModel}</p>
                      <span className="inline-block px-3 py-1 bg-white/[0.05] border border-white/10 rounded-lg text-[10px] font-black text-accent-main uppercase tracking-widest">
                        {contract.vehicleNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                      <p className="font-black text-lg">₹{parseFloat(contract.loanAmount).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">Amortization: ₹{contract.emiAmount}/mo</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-[10px] font-black text-success uppercase tracking-[0.2em]">Active Bond</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/10 rounded-xl w-fit">
                      <Calendar size={14} className="text-muted" />
                      <span className="text-xs font-black tracking-tight">{format(new Date(contract.nextDueDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <button className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-muted hover:text-accent-main hover:border-accent-main/40 transition-all">
                        <History size={18} />
                      </button>
                      <button className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-muted hover:text-accent-main hover:border-accent-main/40 transition-all">
                        <FileText size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-48 text-center">
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="w-24 h-24 bg-white/[0.02] border border-dashed border-white/10 rounded-full flex items-center justify-center mx-auto text-muted">
                        <Briefcase size={48} />
                      </div>
                      <h4 className="text-2xl font-black tracking-tight">No Agreement Found</h4>
                      <p className="text-muted font-medium text-lg leading-relaxed">The search query did not match any active contracts in the repository.</p>
                      <button className="px-8 py-4 bg-accent-main text-black rounded-2xl font-black text-xs uppercase tracking-widest">Clear Repository Filter</button>
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

export default Portfolio;
