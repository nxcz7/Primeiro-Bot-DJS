const { EmbedBuilder } = require("discord.js");
const Servidor = require("../../models/Servidores");

module.exports = {
  name: "setprefix",
  description: "Altere o prefixo do bot neste servidor",
  async execute(message, args) {
    // 🔐 Verifica permissão
    if (!message.member.permissions.has("Administrator")) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Você precisa ser um **administrador** para usar este comando.")
            .setColor("Red")
        ]
      });
    }

    // 🔎 Busca o prefixo atual
    const dados = await Servidor.findOne({ guildId: message.guild.id });
    const prefixAtual = dados?.prefix || "!";

    // ❌ Sem argumento
    const novoPrefixo = args[0];
    if (!novoPrefixo) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Prefixo não informado")
            .setDescription("Você precisa informar o novo prefixo.")
            .addFields({
              name: "ℹ️ Como usar",
              value: `\`${prefixAtual}setprefix ?\``,
              inline: false
            })
            .setColor("Orange")
        ]
      });
    }

    // ❌ Validação
    if (novoPrefixo.length > 5) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ O prefixo deve ter no máximo **5 caracteres**.")
            .setColor("Orange")
        ]
      });
    }

    // ✅ Atualiza no banco
    await Servidor.findOneAndUpdate(
      { guildId: message.guild.id },
      {
        prefix: novoPrefixo,
        guildName: message.guild.name
      },
      { upsert: true }
    );

    return message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ Prefixo Atualizado")
          .setDescription(`Novo prefixo: \`${novoPrefixo}\``)
          .setColor("Green")
      ]
    });
  }
};