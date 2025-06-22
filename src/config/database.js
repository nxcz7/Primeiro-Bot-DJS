const mongoose = require("mongoose");
require("dotenv").config();

module.exports = async () => {
  try {
    await
mongoose.connect(process.env.MONGO_URL);
   console.log("[✅] MongoDB Conectado!");
  } catch (err) {
   console.log("❌ Erro ao Conectar:", err);
  }
};