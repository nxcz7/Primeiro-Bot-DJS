const { EmbedBuilder } = require('discord.js');

module.exports = {
  customId: /^userinfo_2-(\d+)-(\d+)$/, // regex para identificar interações com ID variável
  async execute(interaction, match) {
    const [_, targetUserId, authorId] = match;

    if (interaction.user.id !== authorId) {
      return interaction.reply({
        content: '❌ Apenas quem usou o comando pode clicar neste botão.',
        ephemeral: true
      });
    }

    const usuario = await interaction.guild.members.fetch(targetUserId).catch(() => null);
    if (!usuario) {
      return interaction.reply({ content: 'Usuário não encontrado.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Outras Informações', iconURL: usuario.user.displayAvatarURL() })
      .setDescription(`
> 🤖 Bot: ${usuario.user.bot ? '✅️' : ':x:'}
> 🚀 Impulsionando: ${usuario.premiumSinceTimestamp ? `<t:${Math.floor(usuario.premiumSinceTimestamp / 1000)}:R>` : 'Nunca'}
> 🕒 Mutado: ${usuario.communicationDisabledUntilTimestamp ? `<t:${Math.floor(usuario.communicationDisabledUntilTimestamp / 1000)}:R>` : 'Nenhum'}
> 🖼 Avatar: [clique aqui](${usuario.user.displayAvatarURL({ size: 1024 })})
`)
      .setColor('Purple');

    await interaction.update({ embeds: [embed], components: [] });
  }
};