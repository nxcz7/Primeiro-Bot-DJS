const { findUser } = require('../../funcs/findUser');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'userinfo',
  aliases: ['ui', 'infouser'],
  description: 'Retorna as informações de um usuário.',
  async execute(message) {
                 //0. Pegando o ID
    const usuario = await findUser(message);
               //1. Informações Basicas
    const nome = usuario.username;
    const id = usuario.id;
                //2. Data de Criação
    const userMs = usuario.createdTimestamp;
    const userCreation = Math.floor(userMs / 1000);
            
                //3. Data de Entrada
    const userOb = await message.guild.members.fetch(usuario);
    const userJoinedTimes = userOb.joinedTimestamp;
    const userJoin = Math.floor(userJoinedTimes / 1000);
               //4. ID Cargo mais Alto
    const roles = userOb.roles.cache
      .filter(role => role.id !== message.guild.id)
      .sort((a, b) => b.position - a.position);
    const roleID = roles.first() ? `<@&${roles.first().id}>` : 'Nenhum Cargo';

    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Informações de Usuário', iconURL: message.author.displayAvatarURL() })
      .setDescription(`
> 👤 Nome do usuário: \`${nome}\` \`\`( ${id} )\`\`
> 🗓 Criou a conta: <t:${userCreation}:d> <t:${userCreation}:t> \`\`(\`\` <t:${userCreation}:R> \`\`)\`\`
> 🙋‍♂️ Entrou no servidor: <t:${userJoin}:d> <t:${userJoin}:t> \`\`(\`\` <t:${userJoin}:R> \`\`)\`\`

> ✨️ Cargo mais alto: ${roleID}`)
      .setColor('Yellow');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`userinfo_2-${usuario.id}-${message.author.id}`) // inclui autor para segurança
        .setLabel('Outras Informações')
        .setStyle(ButtonStyle.Secondary)
    );

    await message.reply({ embeds: [embed], components: [row] });
  }
};