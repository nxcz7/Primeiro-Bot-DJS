const Economia = require('../../models/Economia');

module.exports = {
  name: "saldo",
  aliases: ["atm"],
  description: "Veja seu saldo de Lyquis",
  
  async execute(message) {
    const user = message.mentions.users.first() || message.author;

    let perfil = await Economia.findOne({ userid: user.id });

    if (!perfil) {
      perfil = await Economia.create({
        nome: user.username,
        userid: user.id
      });
    }

    const total = perfil.money + perfil.banco;

    message.channel.send({
      embeds: [{
        title: `💼 Carteira de ${user.username}`,
        description: `
💰 **Lyquis na Mão:** \`${perfil.money}\`
🏦 **Banco:** \`${perfil.banco}\`
📊 **Total:** \`${total}\` Lyquis
        `,
        color: 0x2ecc71,
      }]
    });
  }
};