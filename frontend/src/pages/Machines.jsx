import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // 1. IMPORT ADDED

const Machines = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('list'); 
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [machines, setMachines] = useState([]); 
  const [jobs, setJobs] = useState([]); 

  // Forms
  const [newMachineName, setNewMachineName] = useState('');
  const [newMachineType, setNewMachineType] = useState('Tractor');
  const [fuelForm, setFuelForm] = useState({ date: '', liters: '', cost: '' });
  const [repairForm, setRepairForm] = useState({ date: '', description: '', cost: '' });

  // --- SWEETALERT CONFIGURATION (Dark Theme) ---
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1e293b', // Slate-800
    color: '#fff',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
        const machRes = await fetch('https://my-farm-app-2n3x.onrender.com/api/machines');
        if (machRes.ok) setMachines(await machRes.json());

        const jobRes = await fetch('https://my-farm-app-2n3x.onrender.com/api/jobs');
        if (jobRes.ok) setJobs(await jobRes.json());
    } catch (error) { 
        console.error(error);
        Toast.fire({ icon: 'error', title: 'Connection Error!' });
    }
  };

  // --- ACTIONS ---

  // 1. DELETE MACHINE
  const handleDeleteMachine = async (e, id) => {
    e.stopPropagation(); 
    
    // SWEETALERT CONFIRMATION
    const result = await Swal.fire({
        title: 'Delete Machine?',
        text: "Me Machine eka makannada? History ekath makei.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Yes, Delete!',
        background: '#1e293b',
        color: '#fff'
    });

    if (!result.isConfirmed) return;

    try {
        await fetch(`https://my-farm-app-2n3x.onrender.com/api/machines/${id}`, { method: 'DELETE' });
        Toast.fire({ icon: 'success', title: 'Machine Deleted! 🗑️' }); // TOAST
        fetchData();
    } catch (error) { console.error(error); }
  };

  // 2. DELETE EXPENSE (Fuel/Repair)
  const handleDeleteExpense = async (type, recordId) => {
    
    // SWEETALERT CONFIRMATION
    const result = await Swal.fire({
        title: 'Delete Record?',
        text: "Me record eka makannada?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Yes, Delete!',
        background: '#1e293b',
        color: '#fff'
    });

    if (!result.isConfirmed) return;

    try {
        const res = await fetch(`https://my-farm-app-2n3x.onrender.com/api/machines/${selectedMachine._id}/expense/${type}/${recordId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            const updatedMachine = await res.json();
            setSelectedMachine(updatedMachine);
            Toast.fire({ icon: 'success', title: 'Record Deleted! 🗑️' }); // TOAST
            fetchData();
        }
    } catch (error) { console.error(error); }
  };

  // 3. EDIT EXPENSE
  const handleEditExpense = async (type, record) => {
    // Delete old one first (same logic as before)
    await fetch(`https://my-farm-app-2n3x.onrender.com/api/machines/${selectedMachine._id}/expense/${type}/${record.id}`, {
        method: 'DELETE'
    });

    if (type === 'fuel') {
        setFuelForm({ date: record.date, liters: record.liters, cost: record.cost });
        Toast.fire({ icon: 'info', title: 'Edit mode: Form eka purawala Add obanna.' }); // TOAST
    } else {
        setRepairForm({ date: record.date, description: record.description, cost: record.cost });
        Toast.fire({ icon: 'info', title: 'Edit mode: Form eka purawala Add obanna.' }); // TOAST
    }
    
    const res = await fetch(`https://my-farm-app-2n3x.onrender.com/api/machines/${selectedMachine._id}`);
    const data = await res.json();
    setSelectedMachine(data); 
    fetchData();
  };

  // --- ADD FUNCTIONS ---
  const handleAddMachine = async () => {
    if(!newMachineName) return Toast.fire({ icon: 'warning', title: 'Name eka danna!' });

    try {
        await fetch('https://my-farm-app-2n3x.onrender.com/api/machines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newMachineName, type: newMachineType })
        });
        Toast.fire({ icon: 'success', title: 'Machine Saved! ✅' }); // TOAST
        setNewMachineName('');
        fetchData();
    } catch (error) { console.error(error); }
  };

  const handleAddFuel = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`https://my-farm-app-2n3x.onrender.com/api/machines/${selectedMachine._id}/expense`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'fuel', data: { ...fuelForm, id: Date.now() } })
        });
        if (res.ok) {
            Toast.fire({ icon: 'success', title: 'Diesel Added! ⛽' }); // TOAST
            setSelectedMachine(await res.json());
            setFuelForm({ date: '', liters: '', cost: '' });
            fetchData();
        }
    } catch (error) { console.error(error); }
  };

  const handleAddRepair = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`https://my-farm-app-2n3x.onrender.com/api/machines/${selectedMachine._id}/expense`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'repair', data: { ...repairForm, id: Date.now() } })
        });
        if (res.ok) {
            Toast.fire({ icon: 'success', title: 'Repair Added! 🔧' }); // TOAST
            setSelectedMachine(await res.json());
            setRepairForm({ date: '', description: '', cost: '' });
            fetchData();
        }
    } catch (error) { console.error(error); }
  };

  // --- CALCULATIONS ---
  const machineJobs = selectedMachine 
    ? jobs.filter(job => job.machine && job.machine.toLowerCase() === selectedMachine.name.toLowerCase()) 
    : [];
  
  const totalIncome = machineJobs.reduce((acc, job) => acc + (job.totalAmount || 0), 0);
  const totalAcres = machineJobs.reduce((acc, job) => acc + (parseFloat(job.acres) || 0), 0);

  const fuelRecords = selectedMachine?.fuelRecords || [];
  const repairRecords = selectedMachine?.repairRecords || [];

  const totalFuelCost = fuelRecords.reduce((acc, r) => acc + (parseFloat(r.cost) || 0), 0);
  const totalFuelLiters = fuelRecords.reduce((acc, r) => acc + (parseFloat(r.liters) || 0), 0);
  const totalRepairCost = repairRecords.reduce((acc, r) => acc + (parseFloat(r.cost) || 0), 0);
  const netProfit = totalIncome - (totalFuelCost + totalRepairCost); 

  // --- RENDER LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-200">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                          🚜 Machine Yard
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Manage your machinery and expenses.</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 border border-slate-700 font-medium transition">
                    ⬅ Dashboard
                </button>
            </div>

            {/* Add Machine Card */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg mb-8">
                <h3 className="text-emerald-400 font-bold mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                    ➕ Add New Machine
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <input 
                        type="text" 
                        placeholder="Machine Name (e.g., Kubota 4501)" 
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none transition" 
                        value={newMachineName} 
                        onChange={(e) => setNewMachineName(e.target.value)} 
                    />
                    <select 
                        className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none transition md:w-48" 
                        value={newMachineType} 
                        onChange={(e) => setNewMachineType(e.target.value)}
                    >
                        <option value="Tractor">🚜 Tractor</option>
                        <option value="Harvester">🌾 Harvester</option>
                        <option value="Lorry">🚛 Lorry</option>
                    </select>
                    <button 
                        onClick={handleAddMachine} 
                        className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Machines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {machines.map(mac => (
                    <div 
                        key={mac._id} 
                        onClick={() => { setSelectedMachine(mac); setView('details'); }} 
                        className="bg-slate-900 p-6 rounded-2xl border border-slate-800 cursor-pointer hover:border-yellow-500/50 hover:bg-slate-800/80 transition group relative overflow-hidden shadow-xl"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <span className="text-6xl">🚜</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{mac.name}</h3>
                        <p className="text-slate-500 font-medium bg-slate-950 inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wide border border-slate-800">
                            {mac.type}
                        </p>
                        
                        <div className="mt-6 flex justify-between items-end">
                            <span className="text-blue-400 text-sm font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                                View Details ➜
                            </span>
                            <button 
                                onClick={(e) => handleDeleteMachine(e, mac._id)}
                                className="text-slate-600 hover:text-rose-500 transition p-2 hover:bg-rose-500/10 rounded-full"
                                title="Delete Machine"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
                {machines.length === 0 && (
                    <div className="col-span-full text-center p-12 text-slate-500 italic">
                        No machines added yet.
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  // --- RENDER DETAILS VIEW ---
  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-200">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                <button onClick={() => setView('list')} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 border border-slate-700 font-medium transition">
                    ⬅ Back
                </button>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    🚜 <span className="text-yellow-400">{selectedMachine.name}</span> <span className="text-slate-500 text-lg font-normal">Details</span>
                </h1>
            </div>
        
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                 {/* Total Work */}
                 <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full"></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Work</p>
                    <p className="text-xl font-bold text-blue-400 font-mono">{totalAcres} Acres</p>
                </div>
                 {/* Income */}
                 <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full"></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Income</p>
                    <p className="text-xl font-bold text-emerald-400 font-mono">Rs. {totalIncome.toLocaleString()}</p>
                </div>
                {/* Diesel */}
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full"></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Diesel Cost</p>
                    <p className="text-xl font-bold text-rose-400 font-mono">Rs. {totalFuelCost.toLocaleString()}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1">{totalFuelLiters} Liters</p>
                </div>
                {/* Repairs */}
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full"></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Repairs</p>
                    <p className="text-xl font-bold text-amber-400 font-mono">Rs. {totalRepairCost.toLocaleString()}</p>
                </div>
                {/* Net Profit */}
                <div className={`p-5 rounded-xl border relative overflow-hidden ${netProfit >= 0 ? 'bg-slate-900 border-blue-500/30' : 'bg-slate-900 border-rose-500/30'}`}>
                    <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full ${netProfit >= 0 ? 'bg-blue-500/10' : 'bg-rose-500/10'}`}></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Net Profit</p>
                    <p className={`text-2xl font-bold font-mono ${netProfit >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>Rs. {netProfit.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- LEFT COLUMN: EXPENSES --- */}
                <div className="space-y-6">
                    
                    {/* DIESEL SECTION */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                        <h3 className="font-bold text-rose-400 mb-4 flex items-center gap-2 uppercase text-sm tracking-wide">
                            ⛽ Diesel Records
                        </h3>
                        <form onSubmit={handleAddFuel} className="flex flex-col md:flex-row gap-2 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                            <input type="date" required className="bg-slate-800 border border-slate-700 text-white p-2 rounded text-sm focus:outline-none focus:border-rose-500" value={fuelForm.date} onChange={e=>setFuelForm({...fuelForm, date: e.target.value})} />
                            <input type="number" placeholder="Liters" className="bg-slate-800 border border-slate-700 text-white p-2 rounded text-sm w-full md:w-24 focus:outline-none focus:border-rose-500" value={fuelForm.liters} onChange={e=>setFuelForm({...fuelForm, liters: e.target.value})} />
                            <input type="number" placeholder="Cost (Rs)" className="bg-slate-800 border border-slate-700 text-white p-2 rounded text-sm w-full focus:outline-none focus:border-rose-500" value={fuelForm.cost} onChange={e=>setFuelForm({...fuelForm, cost: e.target.value})} />
                            <button className="bg-rose-600 text-white px-4 py-2 rounded font-bold hover:bg-rose-500 transition shadow-lg shadow-rose-900/20">+</button>
                        </form>
                        
                        <div className="h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {fuelRecords.length === 0 ? <p className="text-slate-600 text-xs italic text-center py-4">No records yet.</p> : null}
                            {fuelRecords.map((f, i) => (
                                <div key={i} className="border-b border-slate-800 py-3 flex justify-between items-center hover:bg-slate-800/50 px-2 rounded transition">
                                    <div>
                                        <span className="block font-bold text-slate-300 text-sm">{f.date}</span>
                                        <span className="text-xs text-rose-400/80 font-mono">{f.liters}L • Rs.{parseFloat(f.cost).toLocaleString()}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleEditExpense('fuel', f)} className="text-slate-500 hover:text-blue-400 transition" title="Edit">✏️</button>
                                        <button onClick={() => handleDeleteExpense('fuel', f.id)} className="text-slate-500 hover:text-rose-500 transition" title="Delete">🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* REPAIR SECTION */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                        <h3 className="font-bold text-amber-400 mb-4 flex items-center gap-2 uppercase text-sm tracking-wide">
                            🔧 Repair Records
                        </h3>
                        <form onSubmit={handleAddRepair} className="flex flex-col md:flex-row gap-2 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                            <input type="date" required className="bg-slate-800 border border-slate-700 text-white p-2 rounded text-sm focus:outline-none focus:border-amber-500" value={repairForm.date} onChange={e=>setRepairForm({...repairForm, date: e.target.value})} />
                            <input type="text" placeholder="Description" className="bg-slate-800 border border-slate-700 text-white p-2 rounded text-sm w-full focus:outline-none focus:border-amber-500" value={repairForm.description} onChange={e=>setRepairForm({...repairForm, description: e.target.value})} />
                            <input type="number" placeholder="Cost" className="bg-slate-800 border border-slate-700 text-white p-2 rounded text-sm w-full md:w-32 focus:outline-none focus:border-amber-500" value={repairForm.cost} onChange={e=>setRepairForm({...repairForm, cost: e.target.value})} />
                            <button className="bg-amber-600 text-white px-4 py-2 rounded font-bold hover:bg-amber-500 transition shadow-lg shadow-amber-900/20">+</button>
                        </form>
                        
                        <div className="h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {repairRecords.length === 0 ? <p className="text-slate-600 text-xs italic text-center py-4">No records yet.</p> : null}
                            {repairRecords.map((r, i) => (
                                <div key={i} className="border-b border-slate-800 py-3 flex justify-between items-center hover:bg-slate-800/50 px-2 rounded transition">
                                    <div>
                                        <span className="block font-bold text-slate-300 text-sm">{r.date}</span>
                                        <span className="text-xs text-amber-400/80">{r.description} • <span className="font-mono">Rs.{parseFloat(r.cost).toLocaleString()}</span></span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleEditExpense('repair', r)} className="text-slate-500 hover:text-blue-400 transition" title="Edit">✏️</button>
                                        <button onClick={() => handleDeleteExpense('repair', r.id)} className="text-slate-500 hover:text-rose-500 transition" title="Delete">🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: JOB HISTORY --- */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg h-full">
                    <h3 className="font-bold text-slate-200 mb-6 flex items-center gap-2 uppercase text-sm tracking-wide border-b border-slate-800 pb-4">
                        📜 Machine Job History
                    </h3>
                    <div className="overflow-y-auto h-[600px] pr-2 custom-scrollbar">
                         {machineJobs.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <span className="text-4xl block mb-2">🌱</span>
                                <p>No jobs found for this machine.</p>
                            </div>
                         ) : (
                             machineJobs.map(job => (
                                <div key={job._id} className="flex justify-between items-center border-b border-slate-800 py-4 hover:bg-slate-800/30 px-3 rounded transition group">
                                     <div>
                                         <div className="text-slate-400 text-xs font-bold mb-1">{new Date(job.date).toLocaleDateString()}</div>
                                         <div className="text-slate-200 font-bold">{job.customerName}</div>
                                         <div className="text-xs text-slate-500">{job.acres} Acres</div>
                                     </div>
                                     <div className="text-right">
                                         <span className="block font-bold text-emerald-400 font-mono text-lg">Rs. {job.totalAmount.toLocaleString()}</span>
                                         <button onClick={() => navigate(`/jobs/${job._id}`)} className="text-xs text-blue-500 hover:text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition">View Bill ↗</button>
                                     </div>
                                </div>
                             ))
                         )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Machines;