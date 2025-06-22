const fs = require('fs');
const { Client, EmbedBuilder } = require("discord.js");
require('dotenv').config();
const connectDB = require('./src/config/database'); connectDB();

const client = new Client({
  intents: 53608447,
});

 require('./src/handlers/commandHandler')(client); // Carrega os Comandos
 require('./src/handlers/eventHandler')(client); // Carrega os Eventos

client.login(process.env.TOKEN);