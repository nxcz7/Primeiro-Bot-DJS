const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  client.commands = new Map();

  const loadCommands = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        loadCommands(fullPath); // busca recursiva
      } else if (file.endsWith('.js')) {
        const command = require(fullPath);
        if (command.name) {
          client.commands.set(command.name, command);
        }
      }
    }
  };

  loadCommands(path.join(__dirname, '..', 'commands'));
  console.log(`[✅] ${client.commands.size} comandos carregados.`);
};