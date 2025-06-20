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
              //5. Verificando se é Bot
    const UmBot = usuario.bot ? '✅️' : ':x:';
 //////////////////////////////////////////////////////
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Informações de Usuário', iconURL: message.author.displayAvatarURL() })
      .setDescription(`
> 👤 Nome: \`${nome}\` \`\`( ${id} )\`\`
> 🗓 Criou a conta <t:${userCreation}:d> <t:${userCreation}:t> \`\`(\`\` <t:${userCreation}:R> \`\`)\`\`
> 🙋‍♂️ Entrou no servidor <t:${userJoin}:d> <t:${userJoin}:t> \`\`(\`\` <t:${userJoin}:R> \`\`)\`\`

> ✨️ Cargo mais alto ${roleID}
> 🤖É um Bot? ${UmBot}`)
      .setColor('Yellow');
      
    const MaisInfo = new ButtonBuilder()
    .setCustomId(`userinfo-${usuario.id}-${message.author.id}`)
    .setLabel('Mais Informações')
    .setStyle(ButtonStyle.Secondary);

    const botao1 = new ActionRowBuilder().addComponents(MaisInfo);
    
    message.reply({ embeds: [embed], components: [botao1] });
  }
};