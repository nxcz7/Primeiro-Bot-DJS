const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'reload',
  aliases: ['up'],
  description: 'Recarrega comandos dinamicamente',
  async execute(message, args, client) {
    const owners = client.owners.map(o => o.id);
    if (!owners.includes(message.author.id)) {
      return message.reply('❌ Você não tem permissão para usar este comando.');
    }

    const nomeComando = args[0];
    const comandosDir = path.join(__dirname, '..'); // Sobe para a pasta 'commands'

    // 🔁 Recarrega um comando específico
    const recarregar = (nome) => {
      let encontrado = false;

      const buscar = (dir) => {
        const arquivos = fs.readdirSync(dir);
        for (const arquivo of arquivos) {
          const fullPath = path.join(dir, arquivo);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            buscar(fullPath);
          } else if (arquivo.endsWith('.js')) {
            const comando = require(fullPath);
            if (comando.name === nome) {
              delete require.cache[require.resolve(fullPath)];
              const novoComando = require(fullPath);
              client.commands.set(novoComando.name, novoComando);
              encontrado = true;
            }
          }
        }
      };

      buscar(comandosDir);
      return encontrado;
    };

    // 🔄 Recarregar todos os comandos
    if (!nomeComando) {
      let total = 0;

      const recarregarTodos = (dir) => {
        const arquivos = fs.readdirSync(dir);
        for (const arquivo of arquivos) {
          const fullPath = path.join(dir, arquivo);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            recarregarTodos(fullPath);
          } else if (arquivo.endsWith('.js')) {
            try {
              delete require.cache[require.resolve(fullPath)];
              const novoComando = require(fullPath);
              if (novoComando.name) {
                client.commands.set(novoComando.name, novoComando);
                total++;
              }
            } catch (err) {
              console.error(`[❌] Erro ao recarregar ${arquivo}:\n`, err);
            }
          }
        }
      };

      recarregarTodos(comandosDir);
      return message.reply(`🔁 Todos os comandos foram recarregados com sucesso!\n📦 Total: \`${total}\` comandos`);
    }

    // 🔃 Recarregar comando individual
    const sucesso = recarregar(nomeComando);

    if (sucesso) {
      return message.reply(`✅ Comando \`${nomeComando}\` recarregado com sucesso!`);
    } else {
      return message.reply(`❌ Comando \`${nomeComando}\` não encontrado.`);
    }
  }
};