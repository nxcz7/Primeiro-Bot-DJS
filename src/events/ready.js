const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const VerifiedUser = require("../models/VerifiedUser");

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    try {
      // Obter donos do .env
      const ownerIDs = process.env.OwnerID?.split(',').map(id => id.trim()) || [];
      client.owners = [];

      for (const id of ownerIDs) {
        try {
          const user = await client.users.fetch(id);
          client.owners.push(user);
        } catch (err) {
          console.error(`Erro ao buscar dono ${id}:`, err);
        }
      }

      if (client.owners.length === 0) {
        return console.error("❌ Nenhum dono foi encontrado.");
      }

      const servidores = client.guilds.cache.size;
      const tp = Math.floor(Date.now() / 1000);

      // ✅ Obter quantidade de usuários verificados
      const verificados = await VerifiedUser.countDocuments({ verified: true });

      // 🔄 Obter todos os membros únicos dos servidores
      let membrosUnicos = new Set();

      for (const [guildId, guild] of client.guilds.cache) {
        try {
          await guild.members.fetch(); // Garante que todos os membros estejam carregados
          for (const [memberId, member] of guild.members.cache) {
            if (!member.user.bot) membrosUnicos.add(memberId);
          }
        } catch (err) {
          console.warn(`⚠️ Não foi possível carregar membros de ${guild.name}:`, err.message);
        }
      }

      const totalUsuarios = membrosUnicos.size;
      const naoVerificados = totalUsuarios - verificados;

      console.log(`[✅] Conectado como ${client.user.username}`);
      client.user.setStatus("idle");
      client.user.setActivity(`Gerenciando ${totalUsuarios} usuários.`);

      // 👑 Formatando donos
      const donosFormatados = client.owners.map(owner => {
        const nome = owner.globalName || owner.username;
        return `> 👤 **${nome}** (<@${owner.id}>)`;
      }).join('\n');

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setLabel("Discord.js")
          .setDisabled(true)
          .setEmoji("1383947317073416284")
          .setCustomId("nada")
      );

      const EMBED = new EmbedBuilder()
        .setAuthor({
          name: `Sendo feito usando Discord.js.`,
          iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(
`> 👑 Meus Developers
${donosFormatados}

> Estou gerenciando cerca de \`\`${servidores}\`\` servidores e \`\`${totalUsuarios}\`\` usuários únicos.

> ✅ Verificados: \`\`${verificados}\`\`
> ❌ Não Verificados: \`\`${naoVerificados}\`\`

-# Data <t:${tp}:F>`
        )
        .setColor("#078148");

      const CHANNEL = await client.channels.fetch("1374210745763500143");
      CHANNEL.send({ embeds: [EMBED], components: [row] });
    } catch (err) {
      console.error("❌ Erro no evento ready:", err);
    }
  }
};