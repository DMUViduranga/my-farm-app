import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs');
        const data = await response.json();
        
        if (response.ok) {
          const sortedJobs = data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setJobs(sortedJobs);
        }
      } catch (error) {
        console.error("Error loading jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Search Logic
  const filteredJobs = jobs.filter((job) => {
    const term = searchQuery.toLowerCase();
    const customerName = job.customerName?.toLowerCase() || '';
    const billNo = job.billNo?.toLowerCase() || '';
    return customerName.includes(term) || billNo.includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-200">
      
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                    📚 Bill Potha <span className="text-slate-500 text-lg font-normal">(Jobs List)</span>
                </h1>
                <p className="text-slate-400 mt-1 text-sm">ඔයා කරපු වැඩ වල සම්පූර්ණ විස්තරය.</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="flex-1 md:flex-none px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition border border-slate-700 font-medium"
                >
                    ⬅ Dashboard
                </button>
                <button 
                    onClick={() => navigate('/add-job')} 
                    className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 font-bold flex items-center justify-center gap-2"
                >
                    <span>+</span> Aluth Bill Ekak
                </button>
            </div>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="mb-6">
            <div className="relative w-full max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 group-focus-within:text-emerald-400 transition">🔍</span>
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl leading-5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm shadow-xl transition-all"
                    placeholder="Search by Name or Bill No..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            {loading ? (
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading data...</p>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="text-5xl mb-4 opacity-50">📭</div>
                    <p className="text-slate-500 text-lg">
                        {searchQuery ? "No matches found." : "Thama jobs kisiwak na."}
                    </p>
                </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-800">
                            <th className="p-5">📅 Date</th>
                            <th className="p-5 text-emerald-400">🧾 Bill No</th>
                            <th className="p-5">👤 Customer</th>
                            <th className="p-5 text-center">🌱 Acres</th>
                            <th className="p-5 text-right">Total (Rs)</th>
                            <th className="p-5 text-right">Paid (Rs)</th>
                            <th className="p-5 text-right">Balance</th>
                            <th className="p-5 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-300 text-sm divide-y divide-slate-800/50">
                        
                        {filteredJobs.map((job) => {
                            const total = job.totalAmount || 0;
                            const balance = job.balance || 0;
                            const paidAmount = total - balance; 

                            return (
                                <tr key={job._id} className="hover:bg-slate-800/50 transition duration-200 group">
                                
                                {/* Date */}
                                <td className="p-5 text-slate-400 font-medium">
                                    {new Date(job.date).toLocaleDateString('en-GB')}
                                </td>
                                
                                {/* Bill No */}
                                <td className="p-5 font-mono font-bold text-emerald-400/80 group-hover:text-emerald-400 transition">
                                    #{job.billNo}
                                </td>
                                
                                {/* Name (Clickable) */}
                                <td className="p-5">
                                    <button 
                                        onClick={() => navigate(`/jobs/${job._id}`)}
                                        className="font-bold text-white hover:text-emerald-400 text-left transition flex items-center gap-2 group-hover:translate-x-1 duration-200"
                                        title="View Details"
                                    >
                                        {job.customerName}
                                        <span className="opacity-0 group-hover:opacity-100 text-xs text-slate-500">↗</span>
                                    </button>
                                </td>

                                {/* Acres */}
                                <td className="p-5 text-center">
                                    <span className="bg-slate-800 text-slate-300 py-1 px-3 rounded-full text-xs font-bold border border-slate-700">
                                        {job.acres}
                                    </span>
                                </td>

                                {/* Total Amount */}
                                <td className="p-5 text-right font-mono text-slate-400">
                                    {total.toLocaleString()}
                                </td>

                                {/* Paid Amount */}
                                <td className="p-5 text-right font-mono text-emerald-500/70">
                                    {paidAmount.toLocaleString()}
                                </td>

                                {/* Balance */}
                                <td className={`p-5 text-right font-mono font-bold ${balance > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                                    {balance > 0 ? balance.toLocaleString() : "0"}
                                </td>

                                {/* Status Badge */}
                                <td className="p-5 text-center">
                                    {balance > 0 ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                            ⏳ Pending
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                            ✅ Completed
                                        </span>
                                    )}
                                </td>

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;