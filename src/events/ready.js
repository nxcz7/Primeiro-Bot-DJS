const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
          client.owners.push(user); // Armazena os donos no client
        } catch (err) {
          console.error(`Erro ao buscar dono ${id}:`, err);
        }
      }

      if (client.owners.length === 0) {
        return console.error("❌ Nenhum dono foi encontrado.");
      }

      const memberstotal = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
      const servidores = client.guilds.cache.size;
      const tp = Math.floor(Date.now() / 1000);

      console.log(`[✅] Conectado como ${client.user.username}`);

      client.user.setStatus("idle");
      client.user.setActivity(`Gerenciando ${memberstotal} usuários.`);

      // Cria a lista formatada com todos os donos
      const donosFormatados = client.owners.map(owner => {
        const nome = owner.globalName || owner.username;
        return `> 👤 **${nome}** (<@${owner.id}>)`;
      }).join('\n');

      const row = new ActionRowBuilder().setComponents([
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setLabel("Discord.js")
          .setDisabled(true)
          .setEmoji("1383947317073416284")
          .setCustomId("nada"),
      ]);

      const EMBED = new EmbedBuilder()
        .setAuthor({
          name: `Sendo feito usando Discord.js.`,
          iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(
          `:crown: Meu Developers ${donosFormatados}\n` +
          `> Estou gerenciando cerca de \`\`${servidores}\`\` servidores e \`\`${memberstotal}\`\` usuários no total.\n` +
          `-# Data <t:${tp}:F>`
        )
        .setColor("#078148");

      const CHANNEL = await client.channels.fetch("1374210745763500143");
      CHANNEL.send({ embeds: [EMBED], components: [row] });
    } catch (err) {
      console.error("Erro no evento ready:", err);
    }
  }
};