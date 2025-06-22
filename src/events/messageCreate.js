const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const Verificação = require("../models/VerifiedUser");
const Servidor = require("../models/Servidores");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // 🔎 Busca ou cria prefixo + salva nome do servidor
    let dados = await Servidor.findOne({ guildId: message.guild.id });
    if (!dados) {
      dados = await Servidor.create({
        guildId: message.guild.id,
        guildName: message.guild.name,
        prefix: "!"
      });
    } else if (dados.guildName !== message.guild.name) {
      dados.guildName = message.guild.name;
      await dados.save();
    }

    const prefix = dados.prefix;

    // 👋 Responde a menção do bot
    const isMention =
      message.content.trim() === `<@${client.user.id}>` ||
      message.content.trim() === `<@!${client.user.id}>`;

    if (isMention) {
      const mentionCommand = client.commands.get("mention");
      if (mentionCommand) {
        try {
          return await mentionCommand.execute(message, [], client);
        } catch (err) {
          console.error(err);
          return message.reply("❌ Erro ao responder à menção.");
        }
      }
    }

    // ⛔ Se não usar prefixo, ignora
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command || command.onlyMention) return;

    // 🛡️ Verificação de usuário
    const userData = await Verificação.findOne({ userId: message.author.id });
    if (!userData || !userData.verified) {
      const embed = new EmbedBuilder()
        .setTitle("🔒 Verificação Necessária")
        .setDescription("Você precisa se verificar para usar os comandos.\nClique no botão abaixo para se verificar.")
        .setColor("Yellow");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("verificar-botao")
          .setLabel("✅ Verificar")
          .setStyle(ButtonStyle.Success)
      );

      return message.reply({ embeds: [embed], components: [row] });
    }

    // ✅ Executa o comando
    try {
      await command.execute(message, args, client, prefix);
    } catch (error) {
      console.error(error);
      message.reply("❌ Erro ao executar o comando.");
    }
  }
};