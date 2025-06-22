const Verificação = require("../../../models/VerifiedUser");

module.exports = {
  async execute(interaction) {
    const userName = interaction.user.username; // Corrigido
    const userId = interaction.user.id;

    let user = await Verificação.findOne({ userId });

    if (!user) {
      user = new Verificação({ userName, userId, verified: true });
    } else if (user.verified) {
      return interaction.reply({ content: "✅ Você já está verificado!", ephemeral: true });
    } else {
      user.verified = true;
    }

    await user.save();
    return interaction.reply({ content: "✅ Verificado com sucesso! Agora você pode usar os comandos.", ephemeral: true });
  }
};