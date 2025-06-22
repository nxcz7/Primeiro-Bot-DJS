const mongoose = require("mongoose");

const verSchema = new mongoose.Schema({
  userName: { type: String },
  userId: { type: String },
  verified: { type: Boolean, default: false }
}, { collection: 'Verificados' });

module.exports = mongoose.model("Verificação", verSchema);