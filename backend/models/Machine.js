const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'Tractor' },
  status: { type: String, default: 'Active' },
  
  // Diesel Records 
  fuelRecords: [{
    date: String,
    liters: Number,
    cost: Number,
    id: Number
  }],

  // Repair Records
  repairRecords: [{
    date: String,
    description: String,
    cost: Number,
    id: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Machine', machineSchema);