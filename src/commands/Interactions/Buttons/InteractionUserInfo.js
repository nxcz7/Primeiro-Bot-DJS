const { EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(interaction) {
    console.log('Interação recebida:', interaction.customId);
    
    const [, userId, authorId] = interaction.customId.split('-');

    if (interaction.user.id !== authorId) {
      return interaction.reply({ content: 'Você não pode usar esse botão.', ephemeral: true });
    }

    try {
      const member = await interaction.guild.members.fetch(userId);
      
      const permissoesTraduzidas = {
        CREATE_INSTANT_INVITE: 'Criar convite instantâneo',
        KICK_MEMBERS: 'Expulsar membros',
        BAN_MEMBERS: 'Banir membros',
        ADMINISTRATOR: 'Administrador',
        MANAGE_CHANNELS: 'Gerenciar canais',
        MANAGE_GUILD: 'Gerenciar servidor',
        ADD_REACTIONS: 'Adicionar reações',
        VIEW_AUDIT_LOG: 'Ver registro de auditoria',
        PRIORITY_SPEAKER: 'Voz prioritária',
        STREAM: 'Transmitir ao vivo',
        VIEW_CHANNEL: 'Ver canais',
        SEND_MESSAGES: 'Enviar mensagens',
        SEND_TTS_MESSAGES: 'Enviar mensagens TTS',
        MANAGE_MESSAGES: 'Gerenciar mensagens',
        EMBED_LINKS: 'Inserir links',
        ATTACH_FILES: 'Anexar arquivos',
        READ_MESSAGE_HISTORY: 'Ler histórico de mensagens',
        MENTION_EVERYONE: 'Mencionar @everyone/@here',
        USE_EXTERNAL_EMOJIS: 'Usar emojis externos',
        CONNECT: 'Conectar a canais de voz',
        SPEAK: 'Falar em canais de voz',
        MUTE_MEMBERS: 'Silenciar membros',
        DEAFEN_MEMBERS: 'Ensurdecer membros',
        MOVE_MEMBERS: 'Mover membros',
        USE_VAD: 'Usar detecção de voz',
        CHANGE_NICKNAME: 'Alterar apelido',
        MANAGE_NICKNAMES: 'Gerenciar apelidos',
        MANAGE_ROLES: 'Gerenciar cargos',
        MANAGE_WEBHOOKS: 'Gerenciar webhooks',
        MANAGE_EMOJIS_AND_STICKERS: 'Gerenciar emojis e figurinhas',
        USE_APPLICATION_COMMANDS: 'Usar comandos de aplicativo',
        REQUEST_TO_SPEAK: 'Solicitar para falar',
        MANAGE_EVENTS: 'Gerenciar eventos',
        MANAGE_THREADS: 'Gerenciar tópicos',
        CREATE_PUBLIC_THREADS: 'Criar tópicos públicos',
        CREATE_PRIVATE_THREADS: 'Criar tópicos privados',
        USE_EXTERNAL_STICKERS: 'Usar figurinhas externas',
        SEND_MESSAGES_IN_THREADS: 'Enviar mensagens em tópicos',
        START_EMBEDDED_ACTIVITIES: 'Iniciar atividades',
        MODERATE_MEMBERS: 'Silenciar por tempo'
      };

      const rawPerms = member.permissions.toArray().slice(0, 5);

      const permissoes = rawPerms.length
        ? rawPerms
            .map(perm => {
              const upperSnake = perm
                .replace(/([a-z])([A-Z])/g, '$1_$2') // camelCase → snake_case
                .toUpperCase(); // tudo maiúsculo

              return permissoesTraduzidas[upperSnake] || `⚠️ ${perm}`;
            })
            .join(', ')
        : 'Nenhuma';

      const embed = new EmbedBuilder()
        .setTitle(`📌 Informações Avançadas`)
        .setDescription(`
> 🆔 ID: \`\`${member.id}\`\`
> 📱 Apelido: \`\`${member.nickname || 'Nenhum'}\`\`
> 📜 Permissões: \`${permissoes}\`
        `.trim())
        .setColor('Purple');

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Erro ao buscar informações do usuário.', ephemeral: true });
    }
  }
};