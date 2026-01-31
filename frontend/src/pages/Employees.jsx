import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Employee Form State
  const [newEmp, setNewEmp] = useState({ name: '', phone: '', ratePerAcre: '' });

  // 2. Payment Form State
  const [paymentForm, setPaymentForm] = useState({ date: '', amount: '', note: '' });
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const empRes = await fetch('https://my-farm-app-2n3x.onrender.com/api/employees');
      const jobRes = await fetch('https://my-farm-app-2n3x.onrender.com/api/jobs');
      setEmployees(await empRes.json());
      setJobs(await jobRes.json());
    } catch (error) { 
      console.error(error); 
    }
  };

  // --- EMPLOYEE ACTIONS ---
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmp.name) return;

    try {
      const response = await fetch('https://my-farm-app-2n3x.onrender.com/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEmp, paymentHistory: [] })
      });

      if(response.ok) {
        // Success Alert
        Swal.fire({
            icon: 'success',
            title: 'Employee Added!',
            text: `${newEmp.name} has been added successfully.`,
            background: '#1e293b', color: '#fff',
            timer: 1500, showConfirmButton: false
        });
        setNewEmp({ name: '', phone: '', ratePerAcre: '' });
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteEmployee = async (id) => {
    // Confirmation Dialog
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444', // Red
        cancelButtonColor: '#334155', // Slate
        confirmButtonText: 'Yes, delete it!',
        background: '#1e293b', color: '#fff'
    });

    if (result.isConfirmed) {
        try {
            await fetch(`https://my-farm-app-2n3x.onrender.com/api/employees/${id}`, { method: 'DELETE' });
            fetchData();
            setSelectedEmp(null);
            Swal.fire({
                title: 'Deleted!',
                text: 'Employee has been removed.',
                icon: 'success',
                background: '#1e293b', color: '#fff',
                timer: 1500, showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
        }
    }
  };

  // --- PAYMENT ACTIONS ---
  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!selectedEmp || !paymentForm.amount) return;

    let updatedHistory;
    if (editingPaymentId) {
      updatedHistory = selectedEmp.paymentHistory.map(pay => 
        pay.id === editingPaymentId 
          ? { ...pay, date: paymentForm.date, amount: parseFloat(paymentForm.amount), note: paymentForm.note }
          : pay
      );
    } else {
      const newPayment = {
        id: Date.now(),
        date: paymentForm.date || new Date().toISOString().split('T')[0],
        amount: parseFloat(paymentForm.amount),
        note: paymentForm.note
      };
      updatedHistory = [...(selectedEmp.paymentHistory || []), newPayment];
    }

    const updatedEmployee = { ...selectedEmp, paymentHistory: updatedHistory };

    try {
      await fetch(`https://my-farm-app-2n3x.onrender.com/api/employees/${selectedEmp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEmployee)
      });

      setSelectedEmp(updatedEmployee);
      setEmployees(employees.map(emp => emp._id === updatedEmployee._id ? updatedEmployee : emp));
      
      setPaymentForm({ date: '', amount: '', note: '' });
      setEditingPaymentId(null);

      // Success Notification
      Swal.fire({
        icon: 'success',
        title: editingPaymentId ? 'Payment Updated!' : 'Payment Added!',
        text: `Rs. ${paymentForm.amount} recorded.`,
        background: '#1e293b', color: '#fff',
        timer: 1500, showConfirmButton: false
      });

    } catch (error) {
      console.error("Error saving payment:", error);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    // Confirmation Dialog for Payment
    const result = await Swal.fire({
        title: 'Delete this payment?',
        text: "This will affect the balance calculation.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Yes, delete!',
        background: '#1e293b', color: '#fff'
    });

    if(!result.isConfirmed) return;

    const updatedHistory = selectedEmp.paymentHistory.filter(pay => pay.id !== paymentId);
    const updatedEmployee = { ...selectedEmp, paymentHistory: updatedHistory };

    try {
      await fetch(`https://my-farm-app-2n3x.onrender.com/api/employees/${selectedEmp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEmployee)
      });

      setSelectedEmp(updatedEmployee);
      setEmployees(employees.map(emp => emp._id === updatedEmployee._id ? updatedEmployee : emp));
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        background: '#1e293b', color: '#fff',
        timer: 1000, showConfirmButton: false
      });

    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  const handleEditClick = (payment) => {
    setPaymentForm({
      date: payment.date,
      amount: payment.amount,
      note: payment.note
    });
    setEditingPaymentId(payment.id);
  };

  const handleCancelEdit = () => {
    setPaymentForm({ date: '', amount: '', note: '' });
    setEditingPaymentId(null);
  };

  // --- CALCULATIONS ---
  const empJobs = selectedEmp 
    ? jobs.filter(job => job.operator && job.operator.toLowerCase().includes(selectedEmp.name.toLowerCase())) 
    : [];

  const totalAcres = empJobs.reduce((acc, job) => acc + (job.acres || 0), 0);
  const totalEarnings = totalAcres * (selectedEmp?.ratePerAcre || 0);
  const totalPaid = (selectedEmp?.paymentHistory || []).reduce((acc, pay) => acc + (pay.amount || 0), 0);
  const balanceToPay = totalEarnings - totalPaid;

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Common Styles for Dark Mode
  const cardClass = "bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden";
  const inputClass = "w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500";
  const labelClass = "text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block";

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-200">
      
      {/* Scrollbar Styles */}
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">👷</span> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Employee Manager</span>
        </h1>
        <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition font-bold flex items-center gap-2">
            ⬅ Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* --- LEFT SIDE: LIST (4 Columns) --- */}
        <div className="md:col-span-4 space-y-6">
          
          {/* ADD EMPLOYEE FORM */}
          <div className={cardClass + " p-5"}>
            <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                ➕ <span className="text-blue-400">Add New Employee</span>
            </h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                  <input type="text" placeholder="Full Name" required className={inputClass} 
                    value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} />
              </div>
              <div>
                  <input type="text" placeholder="Phone Number" className={inputClass} 
                    value={newEmp.phone} onChange={e => setNewEmp({...newEmp, phone: e.target.value})} />
              </div>
              <div>
                  <input type="number" placeholder="Rate Per Acre (Rs.)" required className={inputClass} 
                    value={newEmp.ratePerAcre} onChange={e => setNewEmp({...newEmp, ratePerAcre: e.target.value})} />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-bold transition shadow-lg shadow-blue-900/20">
                Save Employee
              </button>
            </form>
          </div>

          {/* EMPLOYEE LIST */}
          <div className={cardClass + " p-4 h-[600px] flex flex-col"}>
            <input type="text" placeholder="🔍 Search Employee..." className={inputClass + " mb-4"}
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {filteredEmployees.map(emp => (
                <div key={emp._id} onClick={() => { setSelectedEmp(emp); handleCancelEdit(); }}
                  className={`p-3 border rounded-xl cursor-pointer flex justify-between items-center group transition-all
                    ${selectedEmp?._id === emp._id 
                        ? 'bg-blue-900/20 border-blue-500/50 shadow-inner' 
                        : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'}`}
                >
                  <div>
                    <h4 className={`font-bold ${selectedEmp?._id === emp._id ? 'text-blue-400' : 'text-slate-200'}`}>{emp.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">Rate: Rs.{emp.ratePerAcre}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp._id); }} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-500 hover:bg-red-900/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: DETAILS (8 Columns) --- */}
        <div className="md:col-span-8">
          {selectedEmp ? (
            <div className="space-y-6">
              
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 border-b-4 border-b-blue-500 shadow-lg">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Work Done</p>
                  <h2 className="text-2xl font-bold text-blue-400 mt-1">{totalAcres} <span className="text-sm text-slate-600">Acres</span></h2>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 border-b-4 border-b-emerald-500 shadow-lg">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Earnings</p>
                  <h2 className="text-2xl font-bold text-emerald-400 mt-1">Rs. {totalEarnings.toLocaleString()}</h2>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 border-b-4 border-b-orange-500 shadow-lg">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Paid</p>
                  <h2 className="text-2xl font-bold text-orange-400 mt-1">Rs. {totalPaid.toLocaleString()}</h2>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 border-b-4 border-b-yellow-400 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400/10 rounded-bl-full"></div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Balance Due</p>
                  <h2 className="text-3xl font-extrabold text-yellow-400 mt-1">Rs. {balanceToPay.toLocaleString()}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* PAYMENT FORM */}
                <div className={`${cardClass} p-6 border-t-4 ${editingPaymentId ? 'border-t-blue-500' : 'border-t-emerald-500'}`}>
                  <h3 className="font-bold text-lg mb-5 text-slate-100 flex items-center gap-2">
                    {editingPaymentId ? '✏️ Edit Payment' : '💸 Add Payment / Advance'}
                  </h3>
                  <form onSubmit={handleSavePayment} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Date</label>
                        <input type="date" required className={inputClass}
                          value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} />
                      </div>
                      <div>
                        <label className={labelClass}>Amount (Rs)</label>
                        <input type="number" required placeholder="0.00" className={`${inputClass} font-bold text-right text-emerald-400`}
                          value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Note</label>
                      <input type="text" placeholder="e.g. Salary Advance" className={inputClass}
                        value={paymentForm.note} onChange={e => setPaymentForm({...paymentForm, note: e.target.value})} />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className={`flex-1 text-white font-bold py-3 rounded-lg shadow-lg transition transform active:scale-95 ${editingPaymentId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                            {editingPaymentId ? 'Update Record' : 'Add Payment'}
                        </button>
                        {editingPaymentId && (
                            <button type="button" onClick={handleCancelEdit} className="px-5 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 font-bold">
                                Cancel
                            </button>
                        )}
                    </div>
                  </form>
                </div>

                {/* PAYMENT HISTORY TABLE */}
                <div className={`${cardClass} p-5 h-80 overflow-y-auto`}>
                  <h3 className="font-bold text-lg mb-4 text-slate-300">📜 Payment History</h3>
                  {selectedEmp.paymentHistory && selectedEmp.paymentHistory.length > 0 ? (
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-800 sticky top-0">
                        <tr>
                          <th className="p-3 rounded-tl-lg">Date</th>
                          <th className="p-3">Note</th>
                          <th className="p-3 text-right">Amount</th>
                          <th className="p-3 text-center rounded-tr-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {selectedEmp.paymentHistory.slice().reverse().map((pay) => (
                          <tr key={pay.id} className={`border-b border-slate-800 hover:bg-slate-800/50 ${editingPaymentId === pay.id ? 'bg-blue-900/20' : ''}`}>
                            <td className="p-3">{new Date(pay.date).toLocaleDateString()}</td>
                            <td className="p-3 text-slate-400 italic">{pay.note || '-'}</td>
                            <td className="p-3 text-right font-bold text-emerald-400">Rs. {parseFloat(pay.amount).toLocaleString()}</td>
                            <td className="p-3 text-center flex justify-center gap-2">
                                <button onClick={() => handleEditClick(pay)} className="p-1.5 hover:bg-blue-900/30 text-blue-400 rounded transition" title="Edit">✏️</button>
                                <button onClick={() => handleDeletePayment(pay.id)} className="p-1.5 hover:bg-red-900/30 text-red-400 rounded transition" title="Delete">🗑️</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <span className="text-2xl opacity-50 mb-2">💸</span>
                        <p className="text-sm">No payments recorded yet.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* JOB HISTORY TABLE */}
              <div className={cardClass + " p-6"}>
                <h3 className="font-bold mb-4 text-lg text-slate-300 flex items-center gap-2">
                    🚜 <span className="text-slate-100">Job History</span> <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 font-normal">Derived from Bill Potha</span>
                </h3>
                {empJobs.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-800 text-slate-400 uppercase text-xs">
                          <th className="p-3 border-b border-slate-700">Date</th>
                          <th className="p-3 border-b border-slate-700">Customer</th>
                          <th className="p-3 border-b border-slate-700">Machine</th>
                          <th className="p-3 border-b border-slate-700 text-center">Acres</th>
                          <th className="p-3 border-b border-slate-700 text-right">Earned</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {empJobs.map(job => (
                          <tr key={job._id} className="border-b border-slate-800 hover:bg-slate-800/40 transition">
                            <td className="p-3">{new Date(job.date).toLocaleDateString()}</td>
                            <td className="p-3">{job.customerName}</td>
                            <td className="p-3 text-slate-500">{job.machine}</td>
                            <td className="p-3 text-center">
                                <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded font-bold text-xs">{job.acres}</span>
                            </td>
                            <td className="p-3 text-right text-emerald-400 font-bold font-mono">
                              {((job.acres || 0) * selectedEmp.ratePerAcre).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-lg border border-dashed border-slate-700">
                    <p>No jobs found for this employee yet.</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            // EMPTY STATE
            <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-10 min-h-[500px]">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <span className="text-5xl">👷‍♂️</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-300 mb-2">Manage Your Team</h2>
              <p className="text-slate-500">Select an employee from the left to view details and payments.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Employees;