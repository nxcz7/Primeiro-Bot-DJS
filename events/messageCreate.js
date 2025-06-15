module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    const prefix = process.env.PREFIXO;
    
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(prefix))return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
  }
}