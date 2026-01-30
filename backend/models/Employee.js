const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  ratePerAcre: { type: Number, required: true },
  
 
  paymentHistory: [
    {
      id: { type: Number },     // Frontend ID
      date: { type: String },   // Date
      amount: { type: Number }, // Amount
      note: { type: String }    // Description
    }
  ]
});


module.exports = mongoose.model('Employee', employeeSchema);