import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Admin', role: 'employee' });

  // --- STATS STATE ---
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalBalance: 0,
    collectedCash: 0,
    jobsCount: 0,
    totalAcres: 0,
    machineExpenses: 0,
    driverCost: 0,
    netProfit: 0
  });

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('role');
    if (storedName) setUser({ name: storedName, role: storedRole || 'employee' });

    // --- DATA FETCHING ---
    const fetchData = async () => {
      try {
        const [jobsRes, machinesRes, empRes] = await Promise.all([
          fetch('http://localhost:5000/api/jobs'),
          fetch('http://localhost:5000/api/machines'),
          fetch('http://localhost:5000/api/employees')
        ]);

        const jobs = await jobsRes.json();
        const machines = await machinesRes.json();
        const employees = await empRes.json();

        if (jobsRes.ok && machinesRes.ok && empRes.ok) {

          // A. INCOME CALCULATIONS
          const income = jobs.reduce((acc, job) => acc + (job.totalAmount || 0), 0);
          const balance = jobs.reduce((acc, job) => acc + (job.balance || 0), 0);
          const collected = income - balance;
          const acres = jobs.reduce((acc, job) => acc + (job.acres || 0), 0);

          // B. MACHINE EXPENSES
          let totalFuelCost = 0;
          let totalRepairCost = 0;

          machines.forEach(mac => {
            if (mac.fuelRecords) totalFuelCost += mac.fuelRecords.reduce((sum, rec) => sum + (rec.cost || 0), 0);
            if (mac.repairRecords) totalRepairCost += mac.repairRecords.reduce((sum, rec) => sum + (rec.cost || 0), 0);
          });
          const totalMachineExp = totalFuelCost + totalRepairCost;

          // C. DRIVER COSTS
          let totalDriverPay = 0;
          jobs.forEach(job => {
            const driverName = job.operator;
            const driver = employees.find(e => e.name === driverName);
            if (driver && driver.ratePerAcre) {
              totalDriverPay += (job.acres || 0) * (driver.ratePerAcre || 0);
            }
          });

          // D. NET PROFIT
          const profit = income - (totalMachineExp + totalDriverPay);

          setStats({
            totalIncome: income,
            totalBalance: balance,
            collectedCash: collected,
            jobsCount: jobs.length,
            totalAcres: acres,
            machineExpenses: totalMachineExp,
            driverCost: totalDriverPay,
            netProfit: profit
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200">

      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shadow-2xl z-20">
        <div className="p-6 text-2xl font-bold tracking-tight border-b border-slate-800 flex items-center gap-2">
          <span className="text-3xl">🌾</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Harvest Pro</span>
        </div>

        <nav className="flex-1 p-4 space-y-3 mt-4">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 p-3 bg-slate-800 text-green-400 border border-slate-700 rounded-xl font-bold shadow-sm transition-all">
            <span>📊</span> Dashboard
          </button>
          <button onClick={() => navigate('/jobs')} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-xl transition-all font-medium">
            <span>📚</span> Bill Potha
          </button>
          <button onClick={() => navigate('/machines')} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-xl transition-all font-medium">
            <span>🚜</span> Machines
          </button>
          <button onClick={() => navigate('/employees')} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-xl transition-all font-medium">
            <span>👷</span> Employees
          </button>
          <button onClick={() => navigate('/reports')}
            className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-xl transition-all font-medium"
          >
            <span>📊</span> Reports
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full p-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
            <span>🚪</span> Log Out
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 overflow-y-auto bg-slate-950 relative">

        {/* HEADER */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-white">Business Overview</h1>
            <p className="text-slate-500 text-xs mt-1">Welcome back to your dashboard</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800 py-2 px-4 rounded-full border border-slate-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-500 uppercase">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-8">

          {/* 1. MAIN SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* INCOME */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-blue-500/20"></div>
              <h3 className="text-slate-400 font-bold uppercase text-xs tracking-wider">Total Billed</h3>
              <p className="text-3xl font-bold text-blue-400 mt-2">Rs. {stats.totalIncome.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-2">Full Invoice Value</p>
            </div>

            {/* COLLECTED CASH (Highlighted) */}
            <div className="bg-emerald-900/20 p-6 rounded-2xl border border-emerald-500/30 shadow-xl relative overflow-hidden group hover:bg-emerald-900/30 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-emerald-500/30"></div>
              <h3 className="text-emerald-400/80 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                Collected Cash <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h3>
              <p className="text-3xl font-extrabold text-emerald-400 mt-2 drop-shadow-sm">Rs. {stats.collectedCash.toLocaleString()}</p>
              <p className="text-xs text-emerald-500/70 mt-2 font-medium">Cash In Hand ✅</p>
            </div>

            {/* EXPENSES */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-red-500/50 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-red-500/20"></div>
              <h3 className="text-slate-400 font-bold uppercase text-xs tracking-wider">Total Expenses</h3>
              <p className="text-3xl font-bold text-red-400 mt-2">
                Rs. {(stats.machineExpenses + stats.driverCost).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-2">Machines + Drivers</p>
            </div>

            {/* NET PROFIT */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-yellow-500/20 shadow-xl relative overflow-hidden group hover:border-yellow-500/50 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-yellow-500/20"></div>
              <h3 className="text-yellow-500/70 font-bold uppercase text-xs tracking-wider">Net Profit</h3>
              <p className="text-3xl font-extrabold text-yellow-400 mt-2">
                Rs. {stats.netProfit.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-2">Pure Profit 💰</p>
            </div>

          </div>

          {/* 2. DETAILED BREAKDOWN & ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Breakdown Column */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                📉 Expense Breakdown <span className="text-slate-500 text-sm font-normal">(Details)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-bold">Machine Costs</p>
                    <p className="text-xl font-bold text-red-400 mt-1">Rs. {stats.machineExpenses.toLocaleString()}</p>
                  </div>
                  <span className="text-2xl">🚜</span>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-bold">Driver Payments</p>
                    <p className="text-xl font-bold text-orange-400 mt-1">Rs. {stats.driverCost.toLocaleString()}</p>
                  </div>
                  <span className="text-2xl">👷</span>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-bold">To Collect (Balance)</p>
                    <p className="text-xl font-bold text-purple-400 mt-1">Rs. {stats.totalBalance.toLocaleString()}</p>
                  </div>
                  <span className="text-2xl">⏳</span>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-bold">Total Work</p>
                    <p className="text-xl font-bold text-blue-400 mt-1">{stats.totalAcres} Acres</p>
                  </div>
                  <span className="text-2xl">🌾</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Column */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100">⚡ Quick Actions</h2>

              <div onClick={() => navigate('/add-job')} className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-green-900/30 hover:-translate-y-1 transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">New Bill</h3>
                    <p className="text-green-100 text-sm mt-1 group-hover:text-white transition-colors">Create a new job record</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl group-hover:bg-white/30 transition-all">📝</div>
                </div>
              </div>

              <div onClick={() => navigate('/employees')} className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 cursor-pointer hover:bg-slate-750 hover:border-slate-600 hover:-translate-y-1 transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-200">Manage Drivers</h3>
                    <p className="text-slate-400 text-sm mt-1">View payments & details</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-2xl group-hover:bg-slate-600 transition-all">👷</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;