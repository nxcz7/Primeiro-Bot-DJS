const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  name: 'guildDelete',

  async execute(guild) {
    const logChannelId = '1385590577395138610';
    const client = guild.client;

    const guildCreatedAtUnix = Math.floor(guild.createdTimestamp / 1000);

    const embed = new EmbedBuilder()
      .setTitle('🔴 Bot Removido de um Servidor')
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }) || null)
      .setColor('Red')
      .addFields(
        { name: '📛 Nome do Servidor', value: guild.name, inline: true },
        { name: '🆔 ID do Servidor', value: `\`${guild.id}\``, inline: true },
        { name: '👥 Membros no Momento da Saída', value: `${guild.memberCount || 'Desconhecido'}`, inline: true },
        { name: '📆 Criação do Servidor', value: `<t:${guildCreatedAtUnix}:F> (<t:${guildCreatedAtUnix}:R>)`, inline: true },
        { name: '📊 Total de Servidores', value: `${client.guilds.cache.size}`, inline: true }
      ).setTimestamp();

    const nameButton = new ButtonBuilder()
      .setLabel(guild.name)
      .setStyle(ButtonStyle.Danger)
      .setCustomId('guild_name_disabled')
      .setDisabled(true);

    const row = new ActionRowBuilder().addComponents(nameButton);

    const logChannel = client.channels.cache.get(logChannelId);
    if (logChannel && logChannel.isTextBased()) {
      logChannel.send({ embeds: [embed], components: [row] }).catch(console.error);
    }
  }
};