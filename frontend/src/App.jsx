import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // <-- MEKA ALUTHIN DAMMA
import Dashboard from './pages/Dashboard';
import AddJob from './pages/AddJob';
import Jobs from './pages/jobs';
import JobDetails from "./pages/JobDetails";
import Machines from './pages/Machines';
import Employees from './pages/Employees';
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Login Page */}
        <Route path="/" element={<Login />} />
        
        {/* 2. Register Page  */}
        <Route path="/register" element={<Register />} />

        {/* 3. Dashboard Route  */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 4. Add Job Rout */}
        <Route path="/add-job" element={<AddJob />} /> 

        <Route path="/jobs" element={<Jobs />} />

        <Route path="/jobs/:id" element={<JobDetails />} />

        <Route path="/machines" element={<Machines />} />

        <Route path="/employees" element={<Employees />} />

        <Route path="/reports" element={<Reports />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;