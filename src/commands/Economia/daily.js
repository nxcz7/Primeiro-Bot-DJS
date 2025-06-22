const Economia = require('../../models/Economia');

module.exports = {
  name: "daily",
  description: "Receba sua recompensa diária de Lyquis!",

  async execute(message) {
    const user = message.author;
    const agora = new Date();

    // Define próxima meia-noite no horário de Brasília (UTC-3)
    const resetTime = new Date();
    resetTime.setUTCHours(3, 0, 0, 0); // meia-noite UTC-3 (UTC+0 = 03:00)
    if (agora >= resetTime) {
      resetTime.setUTCDate(resetTime.getUTCDate() + 1); // próxima meia-noite
    }

    // Buscar ou criar perfil
    let perfil = await Economia.findOne({ userid: user.id });
    if (!perfil) {
      perfil = await Economia.create({
        nome: user.username,
        userid: user.id,
        daily: null
      });
    }

    // Se já pegou e ainda não passou da meia-noite
    if (perfil.daily && agora < perfil.daily) {
      const timestamp = Math.floor(perfil.daily.getTime() / 1000);
      return message.reply(`⏳ Você já coletou sua diária! Volte <t:${timestamp}:R>.`);
    }

    // Recompensa aleatória
    const recompensa = Math.floor(Math.random() * 500) + 100;

    // Atualiza
    perfil.money += recompensa;
    perfil.daily = resetTime;
    await perfil.save();

    message.channel.send({
      embeds: [{
        title: "🎁 Recompensa Diária",
        description: `
Você recebeu \`${recompensa}\` **Lyquis** hoje!

📅 Você poderá pegar novamente <t:${Math.floor(resetTime.getTime() / 1000)}:R>.`,
        color: 0x2ecc71,
        footer: { text: "Categoria: Economia | DAILY" }
      }]
    });
  }
};