import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Swal from 'sweetalert2';

// --- UI COMPONENTS ---
const InputField = ({ label, name, type = "text", placeholder, required = false, value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">{label}</label>
    <input 
      type={type} 
      name={name} 
      value={value}
      onChange={onChange} 
      className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-slate-600" 
      placeholder={placeholder} 
      step={type === "number" ? "any" : undefined}
      required={required} 
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, placeholder }) => (
  <div className="flex flex-col">
    <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">{label}</label>
    <div className="relative">
      <select 
        name={name} 
        onChange={onChange} 
        value={value}
        required
        className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <option value="">{placeholder}</option>
        {options}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">▼</div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const AddJob = () => {
  const navigate = useNavigate();

  // STATE & DATA 
  const [machines, setMachines] = useState([]);
  const [employees, setEmployees] = useState([]); 

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    billNo: '', 
    customerName: '',
    phone: '',
    address: '',
    machine: '',
    operator: '', 
    acres: '',
    rate: '',
    additionalCost: '',
    additionalNote: '',
    advance: '',
  });

  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {

    const fetchMachines = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/machines');
            if (response.ok) {
                const data = await response.json();
                setMachines(data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

 
    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/employees');
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    fetchMachines();
    fetchEmployees();
  }, []);

  // Calculation Logic
  useEffect(() => {
    const acres = parseFloat(formData.acres) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const additional = parseFloat(formData.additionalCost) || 0;
    const advance = parseFloat(formData.advance) || 0;

    const subTotal = (acres * rate) + additional;
    setTotal(subTotal);
    setBalance(subTotal - advance);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- SUBMIT LOGIC (WITH SWEETALERT2) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Show Loading Alert
    Swal.fire({
        title: 'Saving...',
        text: 'Please wait while we save the job',
        allowOutsideClick: false,
        background: '#1e293b', // Dark theme colors
        color: '#fff',
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const jobData = { ...formData, totalAmount: total, balance: balance };

    try {
        const response = await fetch('http://localhost:5000/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData),
        });

        const data = await response.json();

        if (response.ok) {
            // 2. Success Alert 
            Swal.fire({
                icon: 'success',
                title: 'Done!',
                text: 'Job added successfully!',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#22c55e',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                navigate('/dashboard');
            });
        } else {
            // Error Alert
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: data.message,
                background: '#1e293b',
                color: '#fff'
            });
        }

    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'Could not connect to the server!',
            background: '#1e293b',
            color: '#fff'
        });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex justify-center items-start font-sans pt-10">
      
      <div className="bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
        
        {/* --- HEADER --- */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
             <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               📝 <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">New Job Entry</span>
             </h2>
             <p className="text-slate-400 text-sm mt-1">Create a new bill and job record</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 transition-all text-sm font-medium"
          >
            <span>Close</span> ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* --- LEFT COLUMN: CUSTOMER DETAILS --- */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 text-sm font-bold">1</div>
                <h3 className="text-xl font-bold text-slate-100">Customer Details</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <InputField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} />
                 <InputField label="Bill No" name="billNo" placeholder="B-001" required={true} value={formData.billNo} onChange={handleChange} />
              </div>

              <InputField label="Customer Name" name="customerName" placeholder="Ex: Kamal Perera" required={true} value={formData.customerName} onChange={handleChange} />
              <InputField label="Phone Number" name="phone" placeholder="07x xxxxxxx" required={true} value={formData.phone} onChange={handleChange} />
              
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Address</label>
                <textarea 
                  name="address" 
                  value={formData.address}
                  onChange={handleChange} 
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-slate-600" 
                  rows="3" 
                  placeholder="Enter customer address..."
                ></textarea>
              </div>
            </div>

            {/* --- RIGHT COLUMN: JOB DETAILS --- */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 text-sm font-bold">2</div>
                <h3 className="text-xl font-bold text-slate-100">Work Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField 
                    label="Machine" 
                    name="machine" 
                    value={formData.machine} 
                    onChange={handleChange} 
                    placeholder="Select Machine"
                    options={machines.map((mac) => <option key={mac._id} value={mac.name}>{mac.name}</option>)}
                />
                
                <SelectField 
                    label="Operator" 
                    name="operator" 
                    value={formData.operator} 
                    onChange={handleChange} 
                    placeholder="Select Driver"
                    options={
                        employees.length > 0 ? 
                        employees.map(emp => <option key={emp._id} value={emp.name}>{emp.name}</option>) : 
                        <option disabled>No Employees</option>
                    }
                />
              </div>

              <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl space-y-4 shadow-inner">
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Acres (Akkara)" name="acres" type="number" placeholder="0.0" required={true} value={formData.acres} onChange={handleChange} />
                    <InputField label="Rate (Per Acre)" name="rate" type="number" placeholder="Rs." required={true} value={formData.rate} onChange={handleChange} />
                </div>
              </div>

              <div className="p-5 border border-dashed border-slate-600 rounded-xl bg-slate-900/30">
                <label className="block text-sm font-bold text-slate-300 mb-3">➕ Additional Costs</label>
                <div className="flex gap-3">
                    <div className="w-1/3">
                        <input type="number" name="additionalCost" value={formData.additionalCost} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Amount" />
                    </div>
                    <div className="w-2/3">
                        <input type="text" name="additionalNote" value={formData.additionalNote} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Reason (Note)" />
                    </div>
                </div>
              </div>

            </div>
          </div>

          {/* --- PAYMENT SECTION --- */}
          <div className="mt-10 pt-8 border-t border-slate-700">
             <div className="bg-slate-950 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
                
                {/* Total */}
                <div className="text-center md:text-left">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Total Amount</p>
                    <p className="text-4xl font-extrabold text-white mt-1">Rs. {total.toLocaleString()}</p>
                </div>

                {/* Advance Input */}
                <div className="flex-1 w-full md:w-auto max-w-xs">
                    <label className="block text-center text-slate-400 text-xs uppercase font-bold mb-2">Advance Payment</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rs.</span>
                        <input 
                            type="number" 
                            name="advance" 
                            value={formData.advance}
                            onChange={handleChange} 
                            className="w-full bg-slate-800 text-center text-2xl font-bold text-green-400 border-2 border-slate-700 rounded-xl py-3 px-4 focus:border-green-500 focus:ring-0 outline-none transition-all placeholder-slate-600"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Balance */}
                <div className="text-center md:text-right p-4 rounded-xl bg-slate-900 border border-slate-800 min-w-[200px]">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Balance Due</p>
                    <p className={`text-3xl font-black mt-1 ${balance > 0 ? 'text-red-500 drop-shadow-sm' : 'text-emerald-500'}`}>
                        Rs. {balance.toLocaleString()}
                    </p>
                    {balance > 0 && <span className="text-xs text-red-400/70 font-medium">To be collected</span>}
                </div>

             </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="mt-10 flex justify-end gap-4">
            <button 
                type="button" 
                onClick={() => navigate('/dashboard')} 
                className="px-8 py-4 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                className="px-10 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-green-900/20 transform hover:-translate-y-1 transition-all flex items-center gap-2"
            >
                💾 Save Record
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddJob;