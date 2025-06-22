const mongoose = require("mongoose");

const economiaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  userid: { type: String, required: true },
  money: { type: Number, default: 0 },
  banco: { type: Number, default: 0 },
  daily: { type: Date, default: null }},
  
  { collection: 'Economia' });

module.exports = mongoose.model("Economia", economiaSchema);