import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // 1. IMPORT SWEETALERT2

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- EDIT MODE STATES ---
  const [isEditing, setIsEditing] = useState(false); 
  const [editData, setEditData] = useState({});       

  // --- NEW PAYMENT STATES ---
  const [newPayment, setNewPayment] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]); 

  // --- PAYMENT EDITING STATES ---
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);
  const [tempPayment, setTempPayment] = useState({ date: '', amount: '' });

  // --- SWEETALERT HELPER FUNCTION (DARK THEME) ---
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1e293b', // Slate-800 background
    color: '#fff',         // White text
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  const showAlert = (icon, title, text) => {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
      background: '#1e293b',
      color: '#fff',
      confirmButtonColor: '#10b981', // Emerald Color
    });
  };

  // 1. DATA GANNA
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`https://my-farm-app-2n3x.onrender.com/api/jobs/${id}`);
        const data = await response.json();
        if (response.ok) {
          setJob(data);
          setEditData(data); 
        } else {
            showAlert('error', 'Error!', 'Job eka hoyaganna ba!');
        }
      } catch (error) {
        console.error("Error:", error);
        showAlert('error', 'Server Error!', 'Connection eka check karanna.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  // CALCULATION LOGIC
  const calculateNewTotals = (history, totalJobAmount) => {
    const totalPaid = history.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const newBalance = totalJobAmount - totalPaid;
    return { totalPaid, newBalance };
  };

  // 2. SAVE JOB DETAILS
  const handleSaveChanges = async () => {
    const acres = parseFloat(editData.acres) || 0;
    const rate = parseFloat(editData.rate) || 0;
    const additional = parseFloat(editData.additionalCost) || 0;
    
    const newTotal = (acres * rate) + additional;
    const newBalance = newTotal - (job.paidAmount || 0);

    const updatedJobData = {
        ...editData, 
        totalAmount: newTotal,
        balance: newBalance
    };

    try {
        const res = await fetch(`https://my-farm-app-2n3x.onrender.com/api/jobs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedJobData),
        });

        if (res.ok) {
            setJob(updatedJobData); 
            setIsEditing(false);    
            Toast.fire({ icon: 'success', title: 'Job details updated successfully! ✅' });
        } else {
            showAlert('error', 'Update Failed', 'Update karanna bari una.');
        }
    } catch (error) {
        console.error("Update Error:", error);
        showAlert('error', 'Error', 'Something went wrong.');
    }
  };

  // 3. ADD PAYMENT
  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    const amount = parseFloat(newPayment);

    if (!newPayment || amount <= 0) {
        return Toast.fire({ icon: 'warning', title: 'Gana hariyata danna!' });
    }

    const newRecord = {
      date: paymentDate,
      amount: amount
    };

    const updatedHistory = job.paymentHistory ? [...job.paymentHistory, newRecord] : [newRecord];
    const { totalPaid, newBalance } = calculateNewTotals(updatedHistory, job.totalAmount);

    updateJobWithPayment(updatedHistory, totalPaid, newBalance, "Payment Added! 💰");
  };

  // 4. DELETE PAYMENT (SweetAlert Confirmation)
  const handleDeletePayment = async (indexToDelete) => {
    
    // CONFIRMATION BOX
    const result = await Swal.fire({
        title: 'Delete Payment?',
        text: "Me payment eka makannada? Balance eka wenas wei.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444', // Red for delete
        cancelButtonColor: '#334155',  // Slate for cancel
        confirmButtonText: 'Yes, Delete!',
        cancelButtonText: 'No',
        background: '#1e293b',
        color: '#fff'
    });

    if (result.isConfirmed) {
        const updatedHistory = job.paymentHistory.filter((_, index) => index !== indexToDelete);
        const { totalPaid, newBalance } = calculateNewTotals(updatedHistory, job.totalAmount);
        updateJobWithPayment(updatedHistory, totalPaid, newBalance, "Payment Deleted! 🗑️");
    }
  };

  // 5. EDIT PAYMENT
  const startEditingPayment = (index, record) => {
    setEditingPaymentIndex(index);
    setTempPayment(record); 
  };

  const saveEditedPayment = async (index) => {
    const amount = parseFloat(tempPayment.amount);
    if (amount <= 0) return Toast.fire({ icon: 'error', title: 'Valid amount ekak danna' });

    const updatedHistory = [...job.paymentHistory];
    updatedHistory[index] = { ...tempPayment, amount: amount };

    const { totalPaid, newBalance } = calculateNewTotals(updatedHistory, job.totalAmount);

    await updateJobWithPayment(updatedHistory, totalPaid, newBalance, "Payment Updated! ✅");
    setEditingPaymentIndex(null); 
  };

  // COMMON BACKEND UPDATE
  const updateJobWithPayment = async (history, paid, balance, msg = "Payment Updated! ✅") => {
    try {
      const updateData = {
        ...job,
        paidAmount: paid,
        balance: balance,
        paymentHistory: history
      };

      const res = await fetch(`https://my-farm-app-2n3x.onrender.com/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setJob(updateData);
        setEditData(updateData); 
        setNewPayment(''); 
        // SUCCESS MESSAGE
        Toast.fire({ icon: 'success', title: msg });
      } else {
        showAlert('error', 'Failed', "Error updating payment.");
      }
    } catch (err) {
      console.error(err);
      showAlert('error', 'Network Error', "Connection failed.");
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Details...</div>;
  if (!job) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Job not found.</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-200">
      
      {/* Header & Back Button */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-800 pb-6 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button onClick={() => navigate('/jobs')} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition font-medium border border-slate-700">
                ⬅ Back
                </button>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Customer: <span className="text-emerald-400">{job.customerName}</span>
                </h1>
            </div>
            {/* --- BILL NO DISPLAY IN HEADER --- */}
            <div className="hidden md:block bg-slate-900 px-4 py-2 rounded-full border border-slate-800 text-sm text-slate-400">
                Ref: <span className="text-white font-mono font-bold">#{job.billNo}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- LEFT SIDE: FULL DETAILS (EDITABLE) --- */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            🌾 Job Details
                        </h2>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full hover:bg-blue-500/20 font-bold transition">
                                ✏️ Edit
                            </button>
                        )}
                    </div>
                
                    <div className="space-y-5 text-sm">
                        
                        {/* --- BILL NO & DATE SECTION --- */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                                <label className="text-slate-500 text-xs font-bold uppercase block mb-1">Bill No</label>
                                <div className="text-emerald-400 font-mono font-bold text-lg">#{job.billNo}</div>
                            </div>
                            
                            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                                <label className="text-slate-500 text-xs font-bold uppercase block mb-1">Date</label>
                                <div className="text-slate-200 font-medium">{new Date(job.date).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                             <label className="text-slate-500 text-xs font-bold uppercase block mb-1">Phone</label>
                             <div className="text-slate-200 font-medium">{job.phone || "-"}</div>
                        </div>

                        {/* Location */}
                        <div className="pt-2">
                            <label className="text-slate-500 text-xs font-bold uppercase block mb-1">Location</label>
                            <div className="text-slate-200 font-medium bg-slate-800/50 p-2 rounded-lg border border-slate-800">📍 {job.address || "Unknown"}</div>
                        </div>

                        {/* Editable Section */}
                        {isEditing ? (
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4 animate-fadeIn mt-4">
                                <p className="text-xs text-blue-400 font-bold uppercase tracking-wide">Editing Mode Active</p>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">Machine</label>
                                        <input type="text" value={editData.machine} onChange={(e) => setEditData({...editData, machine: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 transition" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">Operator</label>
                                        <input type="text" value={editData.operator} onChange={(e) => setEditData({...editData, operator: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 transition" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">Acres</label>
                                        <input type="number" step="any" value={editData.acres} onChange={(e) => setEditData({...editData, acres: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 transition" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">Rate (Rs)</label>
                                        <input type="number" value={editData.rate} onChange={(e) => setEditData({...editData, rate: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 transition" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Add. Cost (Rs)</label>
                                    <input type="number" value={editData.additionalCost} onChange={(e) => setEditData({...editData, additionalCost: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">Note</label>
                                    <input type="text" value={editData.additionalNote} onChange={(e) => setEditData({...editData, additionalNote: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 transition" />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={handleSaveChanges} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-500 transition text-sm">Save</button>
                                    <button onClick={() => { setIsEditing(false); setEditData(job); }} className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold hover:bg-slate-600 transition text-sm">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                                    <div>
                                        <label className="text-slate-500 text-xs font-bold uppercase block mb-1">Machine</label>
                                        <div className="text-white">{job.machine || "-"}</div>
                                    </div>
                                    <div>
                                        <label className="text-slate-500 text-xs font-bold uppercase block mb-1">Operator</label>
                                        <div className="text-white">{job.operator || "-"}</div>
                                    </div>
                                </div>
                                
                                <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 font-medium">Acres (අක්කර)</span>
                                        <span className="font-bold text-emerald-400 text-xl">{job.acres}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 font-medium">Rate (ගාස්තුව)</span>
                                        <span className="text-slate-200">Rs. {job.rate?.toLocaleString()}</span>
                                    </div>
                                </div>

                                {(job.additionalCost > 0 || job.additionalNote) && (
                                    <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 mt-2">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-amber-500/80 font-bold text-sm">Additional Cost:</span>
                                            <span className="font-bold text-amber-400">Rs. {job.additionalCost?.toLocaleString()}</span>
                                        </div>
                                        {job.additionalNote && (
                                            <div className="text-xs text-amber-200/60 italic pt-1 mt-1 border-t border-amber-500/20">
                                                "{job.additionalNote}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: PAYMENTS & HISTORY --- */}
            <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Stats Cards */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                    <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                       💳 Payment Summary
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
                        {/* Total */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 rounded-bl-full group-hover:bg-blue-500/20 transition"></div>
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Total (මුළු මුදල)</span>
                            <span className="text-xl font-bold text-blue-400">Rs. {job.totalAmount?.toLocaleString()}</span>
                        </div>
                        {/* Paid */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-bl-full group-hover:bg-emerald-500/20 transition"></div>
                            <span className="text-emerald-500/70 text-xs font-bold uppercase tracking-wider block mb-1">Paid (ගෙවූ මුදල)</span>
                            <span className="text-xl font-bold text-emerald-400">Rs. {job.paidAmount?.toLocaleString()}</span>
                        </div>
                        {/* Balance */}
                        <div className={`p-4 rounded-xl border relative overflow-hidden ${job.balance > 0 ? 'bg-slate-950 border-rose-500/20' : 'bg-slate-950 border-blue-500/20'}`}>
                             <div className={`absolute top-0 right-0 w-12 h-12 rounded-bl-full transition ${job.balance > 0 ? 'bg-rose-500/10' : 'bg-blue-500/10'}`}></div>
                            <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${job.balance > 0 ? 'text-rose-500/70' : 'text-blue-500/70'}`}>Balance (ඉතිරි)</span>
                            <span className={`text-xl font-bold ${job.balance > 0 ? 'text-rose-400' : 'text-blue-400'}`}>Rs. {job.balance?.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Add Payment Form */}
                    {job.balance > 0 ? (
                        <form onSubmit={handleUpdatePayment} className="p-5 border border-emerald-500/30 rounded-xl bg-emerald-500/5">
                            <h3 className="font-bold text-emerald-400 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                ➕ Add New Payment
                            </h3>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="md:w-1/3">
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Date</label>
                                    <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none transition"/>
                                </div>
                                <div className="md:w-2/3">
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Amount (Rs)</label>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Ex: 5000" value={newPayment} onChange={(e) => setNewPayment(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none transition"/>
                                        <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">Add</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                            🎉 Fully Paid! කිසිදු හිඟ මුදලක් නොමැත.
                        </div>
                    )}
                </div>

                {/* 2. History Table */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                         <h2 className="text-lg font-bold text-slate-100">📜 Payment History</h2>
                    </div>
                    
                    {job.paymentHistory && job.paymentHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-950 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                        <th className="p-4 border-b border-slate-800">Date</th>
                                        <th className="p-4 border-b border-slate-800 text-right">Amount (Rs)</th>
                                        <th className="p-4 border-b border-slate-800 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300 text-sm">
                                    {job.paymentHistory.map((record, index) => (
                                        <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/50 transition duration-150">
                                            
                                            {/* --- EDIT MODE ROW --- */}
                                            {editingPaymentIndex === index ? (
                                                <>
                                                    <td className="p-3">
                                                        <input 
                                                            type="date" 
                                                            value={tempPayment.date} 
                                                            onChange={(e) => setTempPayment({...tempPayment, date: e.target.value})} 
                                                            className="bg-slate-800 border border-slate-600 rounded p-1.5 text-white w-full text-xs focus:outline-none focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <input 
                                                            type="number" 
                                                            value={tempPayment.amount} 
                                                            onChange={(e) => setTempPayment({...tempPayment, amount: e.target.value})} 
                                                            className="bg-slate-800 border border-slate-600 rounded p-1.5 text-white w-24 text-right text-xs focus:outline-none focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => saveEditedPayment(index)} className="bg-emerald-600 text-white px-3 py-1 rounded text-xs hover:bg-emerald-500">Save</button>
                                                            <button onClick={() => setEditingPaymentIndex(null)} className="bg-slate-700 text-white px-3 py-1 rounded text-xs hover:bg-slate-600">Cancel</button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                // --- NORMAL ROW ---
                                                <>
                                                    <td className="p-4 text-slate-400">{new Date(record.date).toLocaleDateString()}</td>
                                                    <td className="p-4 text-right font-bold text-emerald-400 font-mono text-base">{record.amount.toLocaleString()}</td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex justify-center gap-3">
                                                            <button 
                                                                onClick={() => startEditingPayment(index, record)} 
                                                                className="text-slate-500 hover:text-blue-400 transition" 
                                                                title="Edit Payment"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeletePayment(index)} 
                                                                className="text-slate-500 hover:text-rose-500 transition" 
                                                                title="Delete Payment"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="text-slate-600 text-4xl mb-2">💸</div>
                            <p className="text-slate-500 italic">No payments recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;