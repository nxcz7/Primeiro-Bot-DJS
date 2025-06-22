const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  name: 'guildCreate',

  async execute(guild) {
    const logChannelId = '1385590577395138610';
    const client = guild.client;

    let ownerTag = 'Indisponível';
    let ownerCreatedAt = null;

    try {
      const owner = await guild.fetchOwner();
      ownerTag = `${owner.user.tag} (\`${owner.id}\`)`;
      ownerCreatedAt = `<t:${Math.floor(owner.user.createdTimestamp / 1000)}:F> (<t:${Math.floor(owner.user.createdTimestamp / 1000)}:R>)`;
    } catch (err) {
      console.error('❌ Erro ao buscar dono do servidor:', err);
    }

    const guildCreatedAtUnix = Math.floor(guild.createdTimestamp / 1000);

    const embed = new EmbedBuilder()
      .setTitle('🟢 Bot Adicionado em Novo Servidor')
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }) || null)
      .setColor('Green')
      .addFields(
        { name: '📛 Nome do Servidor', value: guild.name, inline: true },
        { name: '🆔 ID do Servidor', value: `\`${guild.id}\``, inline: true },
        { name: '👥 Membros', value: `${guild.memberCount}`, inline: true },
        { name: '👑 Dono', value: ownerTag, inline: true },
        { name: '📆 Criação do Servidor', value: `<t:${guildCreatedAtUnix}:F> (<t:${guildCreatedAtUnix}:R>)`, inline: true },
        ownerCreatedAt ? { name: '📅 Conta do Dono Criada', value: ownerCreatedAt, inline: true } : null,
        { name: '📊 Total de Servidores', value: `${client.guilds.cache.size}`, inline: true }
      ).setTimestamp();

    const nameButton = new ButtonBuilder()
      .setLabel(guild.name)
      .setStyle(ButtonStyle.Danger)
      .setCustomId('guild_name_disabled')
      .setDisabled(true);

    const inviteButton = new ButtonBuilder()
      .setLabel('🔗 Link do Servidor')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${guild.id}`)
      .setDisabled(false); // Isso apenas abre o servidor via link, se for público/tem permissão

    const row = new ActionRowBuilder().addComponents(nameButton, inviteButton);

    const logChannel = client.channels.cache.get(logChannelId);
    if (logChannel && logChannel.isTextBased()) {
      logChannel.send({ embeds: [embed], components: [row] }).catch(console.error);
    }
  }
};