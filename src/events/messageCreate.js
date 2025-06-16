const { Collection } = require("discord.js");
require("dotenv").config();

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    const prefix = process.env.PREFIXO;

    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args, client); // 🚀 Executa o comando
    } catch (error) {
      console.error(error);
      message.reply("❌ Erro ao executar o comando.");
    }
  }
};