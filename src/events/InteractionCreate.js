const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isButton()) {
      const customId = interaction.customId;
      const [idPrefix] = customId.split('-'); // Ex: userinfo_more_123 → 'userinfo'

      const filePath = path.join(__dirname, '..', 'commands', 'Interactions', 'Buttons', `${idPrefix}.js`);

      if (!fs.existsSync(filePath)) return;

      try {
        const button = require(filePath);
        if (button && typeof button.execute === 'function') {
          console.log(`📦 Interação de botão "${idPrefix}" carregada.`);
          await button.execute(interaction, client);
        }
      } catch (error) {
        console.error(`❌ Erro ao executar interação "${idPrefix}":`, error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'Erro ao processar a interação.', ephemeral: true });
        }
      }
    }
  }
};