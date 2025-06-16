const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const util = require('util');

module.exports = {
  name: 'eval',
  aliases: ['ev', 'executar'],
  description: 'Executa código JavaScript diretamente no bot.',
  async execute(message, args, client) {
    const owners = client.owners.map(o => o.id);

if (!owners.includes(message.author.id)) {
  return message.reply('❌ Você não tem permissão para usar este comando.');
}

    const input = args.join(" ");
    if (!input) return message.reply("⚠️ Forneça um código para ser avaliado.");

    try {
      let code;
      if (input.trim().startsWith('return') || input.trim().startsWith('{')) {
        code = `(async () => { ${input} })()`;
      } else {
        code = `(async () => { return ${input} })()`;
      }

      let result = await eval(code);

      if (typeof result !== 'string') {
        result = util.inspect(result, { depth: 1 });
      }

      result = clean(result, client);

      if (result.length > 1900) {
        const buffer = Buffer.from(result);
        const file = new AttachmentBuilder(buffer, { name: 'eval-output.txt' });

        return message.reply({
          content: '📦 O resultado é muito longo. Veja o anexo.',
          files: [file]
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("🧪 Resultado do Eval")
        .addFields(
          { name: "📥 Entrada", value: `\`\`\`js\n${clean(input, client)}\n\`\`\`` },
          { name: "📤 Saída", value: `\`\`\`js\n${result}\n\`\`\`` }
        )
        .setColor("Green");

      message.reply({ embeds: [embed] });

    } catch (error) {
      const embed = new EmbedBuilder()
        .setTitle("❌ Erro ao executar")
        .addFields(
          { name: "📥 Entrada", value: `\`\`\`js\n${clean(input, client)}\n\`\`\`` },
          { name: "❗ Erro", value: `\`\`\`js\n${clean(error.message || error, client)}\n\`\`\`` }
        )
        .setColor("Red");

      message.reply({ embeds: [embed] });
    }
  }
};

function clean(text, client) {
  if (typeof text !== "string") return text;
  return text
    .replace(/`/g, "`\u200b")
    .replace(/@/g, "@\u200b")
    .replaceAll(process.env.TOKEN, "[TOKEN OCULTO]")
    .replaceAll(client?.token || '', "[CLIENT TOKEN]");
}