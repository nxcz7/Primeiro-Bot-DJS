const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true, // só executa uma vez
  async execute(client) {
    try {
      const OWNER = await client.users.fetch(process.env.OwnerID);
      const CHANNEL = await client.channels.fetch("1374210745763500143");
      const nomeDono = OWNER.globalName || OWNER.username;
      const memberstotal = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

      console.log(`[✅] Conectado como ${client.user.username}`);

      client.user.setStatus("idle");
      client.user.setActivity(`Gerenciando ${memberstotal} usuários.`);

      const EMBED = new EmbedBuilder()
        .setAuthor({
          name: `Sendo feito usando Discord.js.`,
          iconURL: OWNER.displayAvatarURL({ dynamic: true })
        })
        .setDescription(
          `> Fui feito pelo **${nomeDono}** em JavaScript, usando a biblioteca do Discord.js\n` +
          `> Estou gerenciando cerca de \`\`${memberstotal}\`\` usuários no total.`
        )
        .setColor("#078148");

      CHANNEL.send({ embeds: [EMBED] });
    } catch (err) {
      console.error("Erro no evento ready:", err);
    }
  }
};