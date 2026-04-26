import React, { useState } from 'react';
import { 
  Upload, 
  Search, 
  Phone, 
  Calendar,
  AlertCircle,
  FileDown,
  ExternalLink,
  Filter,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';

const CustomerList = ({ customers, onUpload }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split('\n').slice(1);
        const data = rows.filter(row => row.trim()).map(row => {
          const cols = row.split(',');
          return {
            name: cols[0],
            phone: cols[1],
            address: cols[2],
            aadhar: cols[3],
            rcDetails: cols[4],
            vehicleNumber: cols[5],
            vehicleModel: cols[6],
            vehicleYear: cols[7],
            loanAmount: cols[8],
            interestRate: cols[9],
            emiMonths: cols[10],
            emiAmount: cols[11],
            nextDueDate: cols[12] || format(new Date(), 'yyyy-MM-dd'),
          };
        });
        onUpload(data);
      };
      reader.readAsText(file);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="relative flex-1 w-full max-w-2xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent-main transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Filter by name, phone or vehicle plate..." 
            className="input-modern pl-12 h-14"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 w-full xl:w-auto">
          <label className="btn-secondary h-14 flex items-center justify-center gap-3 cursor-pointer group flex-1">
            <Upload size={18} className="group-hover:text-accent-main transition-colors" />
            <span>Bulk Import</span>
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
          <button className="btn-secondary h-14 flex items-center justify-center gap-3 flex-1">
            <FileDown size={18} />
            <span>Generate CSV</span>
          </button>
        </div>
      </div>

      <div className="data-grid-container shadow-2xl">
        <div className="overflow-x-auto">
          <table className="data-grid">
            <thead>
              <tr>
                <th>Customer Entity</th>
                <th>Asset Profile</th>
                <th>Contract Value</th>
                <th>State</th>
                <th>Maturity / Next Due</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="group">
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent-main/10 rounded-xl flex items-center justify-center">
                        <UserCheck className="text-accent-main" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{customer.name}</p>
                        <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest mt-0.5">
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-bold text-sm">{customer.vehicleModel}</p>
                      <span className="text-[10px] font-black text-accent-main bg-accent-main/10 px-2 py-0.5 rounded uppercase mt-1 inline-block">
                        {customer.vehicleNumber}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-black text-sm">₹{parseFloat(customer.loanAmount).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-muted mt-0.5">EMI: ₹{customer.emiAmount}</p>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success">
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                        <Calendar size={14} className="text-muted" />
                      </div>
                      <span className="text-xs font-bold">{format(new Date(customer.nextDueDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </td>
                  <td>
                    <button className="w-10 h-10 flex items-center justify-center bg-white/[0.02] hover:bg-accent-main/20 hover:text-accent-main rounded-xl transition-all border border-transparent hover:border-accent-main/20">
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <div className="max-w-sm mx-auto space-y-4">
                      <div className="w-20 h-20 bg-white/[0.02] border border-white/[0.05] border-dashed rounded-full flex items-center justify-center mx-auto text-muted">
                        <Filter size={32} />
                      </div>
                      <h4 className="text-xl font-bold">No Matching Records</h4>
                      <p className="text-sm text-muted font-medium">We couldn't find any contracts matching your current search parameters.</p>
                      <button onClick={() => setSearchTerm('')} className="text-accent-main font-bold text-sm hover:underline">Clear all filters</button>
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

export default CustomerList;
