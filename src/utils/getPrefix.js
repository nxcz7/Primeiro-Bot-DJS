const Servidor = require("../models/Servidores")

async function getPrefix(guildId) {
  let guildData = await Servidor.findOne({ guildId: guild.id });
  
  if (!guildData) {
    guildData = await Servidor.create({ guildId: guild.id,
      guildName: guild.name,
      prefix: !
    });
  } else if (guildData.guildName !== guild.name) {
    guildData.guildName = guild.name;
    await guildData.save();
  }
  return guildData.prefix;
}

module.exports = getPrefix;