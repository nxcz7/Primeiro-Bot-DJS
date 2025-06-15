const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const loadEvents = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        loadEvents(fullPath);
      } else if (file.endsWith('.js')) {
        const event = require(fullPath);
        if (event && event.name) {
          if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
          } else {
            client.on(event.name, (...args) => event.execute(...args, client));
          }
        }
      }
    }
  };
  
  loadEvents(path.join(__dirname, '..', 'events'));
  console.log('[✅] Eventos Carregados');
};