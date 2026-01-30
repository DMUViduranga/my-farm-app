const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- 1. MODELS ---

// A. USER MODEL
const UserSchema = new mongoose.Schema({
  businessName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' }
});
const User = mongoose.model('User', UserSchema);

// B. JOB MODEL
const JobSchema = new mongoose.Schema({
  date: String,
  billNo: { type: String, required: true }, 
  customerName: String,
  phone: String,
  address: String,
  machine: String, 
  operator: String, 
  acres: Number,
  rate: Number,
  additionalCost: Number,
  additionalNote: String,
  totalAmount: Number,
  paidAmount: { type: Number, default: 0 },
  balance: Number,
  paymentHistory: [
    { date: String, amount: Number }
  ]
}, { timestamps: true });

const Job = mongoose.model('Job', JobSchema);

// C. MACHINE MODEL
const MachineSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  type: { type: String, default: 'Tractor' },
  status: { type: String, default: 'Active' },
  
  // Diesel Records List
  fuelRecords: [{
    date: String,
    liters: Number,
    cost: Number,
    id: Number
  }],

  // Repair Records List
  repairRecords: [{
    date: String,
    description: String,
    cost: Number,
    id: Number
  }]
}, { timestamps: true });

const Machine = mongoose.model('Machine', MachineSchema);

//  D. EMPLOYEE MODEL (WORKERS) - UPDATED 

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  role: { type: String, default: 'Driver' }, 
  ratePerAcre: { type: Number, default: 0 }, 
  dailyRate: { type: Number, default: 0 },
  
  
  paymentHistory: [{
    id: Number,
    date: String,
    amount: Number,
    note: String
  }]
}, { timestamps: true });

const Employee = mongoose.model('Employee', EmployeeSchema);

// Database connection
mongoose.connect("mongodb+srv://uviduranga8:31102000UVD@cluster0.a0tq2vb.mongodb.net/?appName=Cluster0")
  .then(() => console.log("MongoDB Cloud Connected!"))
  .catch((err) => console.log(err));

// --- 3. ROUTES ---

// --- A. AUTHENTICATION ---
app.post('/api/auth/register-owner', async (req, res) => {
  try {
    const { businessName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Me Email eka danatamath thiyenawa." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOwner = new User({ businessName, email, password: hashedPassword, role: 'owner' });
    await newOwner.save();
    res.status(201).json({ message: "Owner Account eka haduwa!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/auth/create-employee', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Me Email eka danatamath thiyenawa." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newEmployee = new User({ email, password: hashedPassword, role: 'employee' });
    await newEmployee.save();
    res.status(201).json({ message: "Aluth Employee kenekwa Add kala!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email eka waradi!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password eka waradi!" });

    const token = jwt.sign({ id: user._id, role: user.role }, "secret_key_123", { expiresIn: "1d" });
    res.json({ token, user: { email: user.email, role: user.role, businessName: user.businessName } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// --- B. JOB ROUTES ---
app.post('/api/jobs', async (req, res) => {
  try {
    let jobData = req.body;
    if (jobData.advance && jobData.advance > 0) {
      jobData.paidAmount = parseFloat(jobData.advance); 
      jobData.paymentHistory = [{ date: jobData.date, amount: parseFloat(jobData.advance) }];
      jobData.balance = jobData.totalAmount - jobData.paidAmount;
    } else {
      jobData.paidAmount = 0;
      jobData.paymentHistory = [];
      jobData.balance = jobData.totalAmount;
    }
    const newJob = new Job(jobData);
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedJob) return res.status(404).json({ message: 'Job update failed' });
    res.json(updatedJob);
  } catch (error) { res.status(500).json({ message: error.message }); }
});


// --- C. MACHINE ROUTES ---
app.get('/api/machines', async (req, res) => {
    try { const machines = await Machine.find(); res.json(machines); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/machines', async (req, res) => {
    try { const newMachine = new Machine(req.body); const savedMachine = await newMachine.save(); res.json(savedMachine); } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/machines/:id/expense', async (req, res) => {
    const { type, data } = req.body; 
    try {
        const machine = await Machine.findById(req.params.id);
        if (!machine) return res.status(404).send("Machine not found");

        if (type === 'fuel') {
            machine.fuelRecords.push(data);
        } else if (type === 'repair') {
            machine.repairRecords.push(data);
        }

        await machine.save();
        res.json(machine);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/machines/:id', async (req, res) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    res.json({ message: "Machine deleted" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/machines/:id/expense/:type/:recordId', async (req, res) => {
  try {
    const { id, type, recordId } = req.params;
    const machine = await Machine.findById(id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    if (type === 'fuel') {
      machine.fuelRecords = machine.fuelRecords.filter(r => r.id != recordId);
    } else if (type === 'repair') {
      machine.repairRecords = machine.repairRecords.filter(r => r.id != recordId);
    }

    await machine.save();
    res.json(machine);
  } catch (error) { res.status(500).json({ error: error.message }); }
});


//  D. EMPLOYEE ROUTES - UPDATED 
app.post('/api/employees', async (req, res) => {
  try {

    const empData = { ...req.body, paymentHistory: [] };
    const newEmp = new Employee(empData);
    await newEmp.save();
    res.json(newEmp);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee Deleted" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Update Route 
app.put('/api/employees/:id', async (req, res) => {
  try {

    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// Server Start
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server eka duwanawa: http://localhost:${PORT}`);
});