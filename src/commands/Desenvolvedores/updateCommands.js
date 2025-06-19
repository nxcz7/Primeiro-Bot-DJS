const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'reload',
  aliases: ['up'],
  description: 'Recarrega comandos dinamicamente',
  async execute(message, args, client) {
    const owners = client.owners?.map(o => o.id) || [];
    if (!owners.includes(message.author.id)) {
      return message.reply('❌ Você não tem permissão para usar este comando.');
    }

    const comandosDir = path.join(__dirname, '..'); // vai até src/commands
    const nomeComando = args[0];

    // 🔁 Função para recarregar todos os comandos
    const recarregarTodos = (dir) => {
      let total = 0;
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          total += recarregarTodos(fullPath);
        } else if (file.endsWith('.js')) {
          try {
            delete require.cache[require.resolve(fullPath)];
            const novoComando = require(fullPath);

            if (novoComando.name) {
              client.commands.set(novoComando.name, novoComando);

              // Recarrega aliases
              if (Array.isArray(novoComando.aliases)) {
                for (const alias of novoComando.aliases) {
                  client.commands.set(alias, novoComando);
                }
              }

              total++;
            }
          } catch (err) {
            console.error(`[❌] Erro ao recarregar ${file}:\n`, err);
          }
        }
      }

      return total;
    };

    // 🔃 Recarrega comando individual
    const recarregarUm = (nome) => {
      let encontrado = false;

      const buscar = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            buscar(fullPath);
          } else if (file.endsWith('.js')) {
            const cache = require(fullPath);
            if (cache.name === nome || (cache.aliases && cache.aliases.includes(nome))) {
              delete require.cache[require.resolve(fullPath)];
              const novo = require(fullPath);

              if (novo.name) {
                client.commands.set(novo.name, novo);
                if (Array.isArray(novo.aliases)) {
                  for (const alias of novo.aliases) {
                    client.commands.set(alias, novo);
                  }
                }
              }

              encontrado = true;
            }
          }
        }
      };

      buscar(comandosDir);
      return encontrado;
    };

    if (!nomeComando) {
      const total = recarregarTodos(comandosDir);
      return message.reply(`🔁 Todos os comandos foram recarregados com sucesso!\n📦 Total: \`${total}\` comandos`);
    }

    const sucesso = recarregarUm(nomeComando);

    if (sucesso) {
      return message.reply(`✅ Comando \`${nomeComando}\` recarregado com sucesso!`);
    } else {
      return message.reply(`❌ Comando \`${nomeComando}\` não encontrado.`);
    }
  }
};