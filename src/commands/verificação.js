const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "enviarverificacao",
  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle("🔒 Verificação")
      .setDescription("Clique no botão abaixo para se verificar e usar o bot.")
      .setColor("Yellow");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verificar_botao")
        .setLabel("✅ Verificar")
        .setStyle(ButtonStyle.Success)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  },
};