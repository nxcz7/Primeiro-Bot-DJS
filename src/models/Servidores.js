const mongoose = require("mongoose");

const servidorSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  guildName: { type: String },
  prefix: { type: String, default: "!" }},
   
    { collection: "Servidores"});

module.exports = mongoose.model("Servidor", servidorSchema);