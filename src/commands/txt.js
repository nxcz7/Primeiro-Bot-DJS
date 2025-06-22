module.exports = {
  name: "mention",
  onlyMention: true,
  async execute(message) {
    await message.reply(`Olá ${message.author}, fui mencionado! Use \`!ajuda\` para ver meus comandos.`);
  }
};