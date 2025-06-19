const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  aliases: ['latência'],
  async execute(message, args) {
    // Envia mensagem inicial
    const sent = await message.channel.send('⏱️ Calculando ping...');

    // Calcula a latência real
    const ping = sent.createdTimestamp - message.createdTimestamp;

    // Cria embed com os dados
    const EMBED = new EmbedBuilder()
      .setAuthor({ name: 'Respostas de Dados', iconURL: message.author.displayAvatarURL() })
      .setDescription(`> Latência: \`${ping}\`ms | WebSocket: \`${message.client.ws.ping}\`ms.`)
      .setColor('Yellow');

    // Edita a mensagem original com o embed
    await sent.edit({ content: null, embeds: [EMBED] });
  }
};