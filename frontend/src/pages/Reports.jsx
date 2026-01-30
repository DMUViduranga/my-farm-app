import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('All');


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/jobs');
        const data = await res.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  // 2. Dropdown List 
  const uniqueAddresses = ['All', ...new Set(jobs.map(job => job.address ? job.address.trim() : 'Unknown'))];

  // 3. Filter Logic
  const filteredJobs = selectedAddress === 'All' 
    ? jobs 
    : jobs.filter(job => (job.address ? job.address.trim() : 'Unknown') === selectedAddress);

  // 4. Calculations (Summary)
  const totalAcres = filteredJobs.reduce((acc, job) => acc + (parseFloat(job.acres) || 0), 0);
  const totalIncome = filteredJobs.reduce((acc, job) => acc + (parseFloat(job.totalAmount) || 0), 0);
  const totalJobsCount = filteredJobs.length;

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            📊 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Location Reports</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Filter income & work by Address</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="px-5 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-white transition font-bold">
            ⬅ Dashboard
        </button>
      </div>

      {/* --- FILTER SECTION --- */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg mb-8">
        <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 block">
            Select Address (ලිපිනය තෝරන්න)
        </label>
        <div className="relative">
            <select 
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full md:w-1/3 bg-slate-800 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold cursor-pointer appearance-none"
            >
                {uniqueAddresses.map((addr, index) => (
                    <option key={index} value={addr}>
                        {addr === 'All' ? '🌍 Show All Addresses' : `📍 ${addr}`}
                    </option>
                ))}
            </select>
            <div className="absolute top-4 right-4 md:left-[30%] pointer-events-none text-slate-400 text-xs">▼</div>
        </div>
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Acres */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full"></div>
            <p className="text-slate-500 text-xs font-bold uppercase">මුළු අක්කර (Total Acres)</p>
            <h3 className="text-4xl font-bold text-blue-400 mt-2">{totalAcres.toFixed(2)}</h3>
        </div>

        {/* Total Income */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full"></div>
            <p className="text-emerald-500/70 text-xs font-bold uppercase">මුළු ආදායම (Total Income)</p>
            <h3 className="text-4xl font-bold text-emerald-400 mt-2">Rs. {totalIncome.toLocaleString()}</h3>
        </div>

        {/* Job Count */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-full"></div>
            <p className="text-slate-500 text-xs font-bold uppercase">ජොබ් ගණන (Job Count)</p>
            <h3 className="text-4xl font-bold text-purple-400 mt-2">{totalJobsCount}</h3>
        </div>
      </div>

      {/* --- DETAILED TABLE --- */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">📋 Detailed Report - {selectedAddress}</h3>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700">
                {filteredJobs.length} Records
            </span>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold">
                    <tr>
                        <th className="p-4 border-b border-slate-800">Date</th>
                        <th className="p-4 border-b border-slate-800">Customer</th>
                        <th className="p-4 border-b border-slate-800">Address</th>
                        <th className="p-4 border-b border-slate-800 text-center">Acres</th>
                        <th className="p-4 border-b border-slate-800 text-right">Amount (Rs)</th>
                    </tr>
                </thead>
                <tbody className="text-slate-300">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <tr key={job._id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                                <td className="p-4 text-slate-400">{new Date(job.date).toLocaleDateString()}</td>
                                <td className="p-4 font-bold text-white">{job.customerName || job.name}</td>
                                <td className="p-4">
                                    <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700">
                                       📍 {job.address}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded font-bold">
                                        {job.acres}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-bold text-emerald-400 font-mono">
                                    {job.totalAmount?.toLocaleString()}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="p-8 text-center text-slate-500">
                                No records found for {selectedAddress}.
                            </td>
                        </tr>
                    )}
                </tbody>
                {/* Footer Total */}
                {filteredJobs.length > 0 && (
                    <tfoot className="bg-slate-900/80 font-bold text-white">
                        <tr>
                            <td colSpan="3" className="p-4 text-right uppercase text-xs tracking-wider text-slate-500">Total Summary</td>
                            <td className="p-4 text-center text-blue-400">{totalAcres.toFixed(2)}</td>
                            <td className="p-4 text-right text-emerald-400 text-lg border-t-2 border-slate-700">
                                {totalIncome.toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;