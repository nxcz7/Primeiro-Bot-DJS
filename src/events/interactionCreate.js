const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
  const interactionHandlers = [];

  // Carrega todos os manipuladores de uma categoria (botões, modais, selects)
  const loadCategory = (category) => {
    const dir = path.join(__dirname, '..', 'interactions', category);
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const handler = require(filePath);

        if (!handler.customId || !handler.execute) {
          console.warn(`⚠️  [${category.toUpperCase()}] ${file} está faltando 'customId' ou 'execute'.`);
          continue;
        }

        interactionHandlers.push({ ...handler, type: category });
        console.log(`✅ [${category.toUpperCase()}] ${file} carregado com sucesso.`);
      } catch (err) {
        console.error(`❌ [${category.toUpperCase()}] Erro ao carregar ${file}:`, err);
      }
    }
  };

  // Carrega as 3 categorias principais
  ['buttons', 'modals', 'selects'].forEach(loadCategory);

  // Evento principal
  client.on('interactionCreate', async (interaction) => {
    try {
      const type = interaction.isButton()
        ? 'buttons'
        : interaction.isModalSubmit()
        ? 'modals'
        : interaction.isStringSelectMenu()
        ? 'selects'
        : null;

      if (!type) return;

      for (const handler of interactionHandlers) {
        if (handler.type !== type) continue;

        const match = interaction.customId.match(handler.customId);
        if (match) {
          return await handler.execute(interaction, match);
        }
      }
    } catch (err) {
      console.error(`❌ Erro ao executar interação:`, err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '❌ Erro ao processar essa interação.', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ Erro ao processar essa interação.', ephemeral: true });
      }
    }
  });

  console.log('[✅ ] interações Carregadas.);
};