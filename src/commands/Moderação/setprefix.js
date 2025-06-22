const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Economia = require('../../models/Economia');
const Servidor = require('../../models/Servidores');
const partidasAtivas = require('../../utils/gameState');

function parseValor(input, saldoTotal = 0) {
  if (!input) return 0;
  const val = input.toLowerCase().trim();
  if (val === 'all') return saldoTotal;
  if (val === 'half') return Math.floor(saldoTotal / 2);
  const match = val.match(/^([0-9]*\.?[0-9]+)([kmbt])?$/);
  if (!match) return NaN;
  let number = parseFloat(match[1]);
  const suffix = match[2];
  switch (suffix) {
    case 'k': number *= 1e3; break;
    case 'm': number *= 1e6; break;
    case 'b': number *= 1e9; break;
    case 't': number *= 1e12; break;
  }
  return Math.floor(number);
}

function getCard() {
  const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return cards[Math.floor(Math.random() * cards.length)];
}

function calcValor(cards) {
  let total = 0, ases = 0;
  for (const c of cards) {
    if (['J', 'Q', 'K'].includes(c)) total += 10;
    else if (c === 'A') { total += 11; ases++; }
    else total += parseInt(c);
  }
  while (total > 21 && ases > 0) { total -= 10; ases--; }
  return total;
}

function formatCards(cards) {
  return cards.join(', ');
}

module.exports = {
  name: 'blackjack',
  aliases: ['bj'],
  async execute(message, args) {
    const userid = message.author.id;
    const nome = message.author.username;

    if (partidasAtivas.has(userid))
      return message.reply('⚠️ Você já está em uma partida. Finalize ela primeiro!');

    let prefix = '!';
    const dados = await Servidor.findOne({ guildId: message.guild.id });
    if (dados?.prefix) prefix = dados.prefix;

    let userData = await Economia.findOne({ userid });
    if (!userData) userData = await Economia.create({ nome, userid, money: 0, banco: 0 });

    const apostaRaw = args[0];
    const aposta = parseValor(apostaRaw, userData.money);

    if (!apostaRaw)
      return message.reply(`❌ Use: \`${prefix}blackjack <aposta>\` — Ex: \`${prefix}blackjack 2k\``);

    if (isNaN(aposta) || aposta <= 0 || aposta > userData.money)
      return message.reply(`❌ Valor de aposta inválido ou saldo insuficiente. Seu saldo: **${userData.money} Bytes**`);

    partidasAtivas.add(userid);

    let playerCards = [getCard(), getCard()];
    let dealerCards = [getCard(), getCard()];
    let playerTotal = calcValor(playerCards);
    let dealerTotal = calcValor(dealerCards);

    const dealerDisplay = `${dealerCards[0]}, ❓`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hit').setLabel('🃏 Pedir Carta').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('stand').setLabel('✋ Parar').setStyle(ButtonStyle.Danger)
    );

    const embed = new EmbedBuilder()
      .setTitle(`🎮 Blackjack - ${nome}`)
      .setColor('#2ecc71')
      .setDescription(
        `🎲 Aposta: **${aposta} Bytes**\n\n` +
        `🧍‍♂️ Suas Cartas: \`${formatCards(playerCards)}\` (Total: **${playerTotal}**)\n` +
        `🤖 Cartas do Dealer: \`${dealerDisplay}\`\n\n` +
        `Escolha sua jogada clicando nos botões abaixo:`
      );

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === userid,
      time: 60000
    });

    collector.on('collect', async interaction => {
      await interaction.deferUpdate();

      if (interaction.customId === 'hit') {
        playerCards.push(getCard());
        playerTotal = calcValor(playerCards);

        if (playerTotal > 21) {
          userData.money -= aposta;
          await userData.save();
          partidasAtivas.delete(userid);

          return msg.edit({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setTitle('💥 Você Estourou!')
                .setDescription(
                  `🧍‍♂️ Cartas: \`${formatCards(playerCards)}\` (Total: ${playerTotal})\n` +
                  `Você perdeu **${aposta} Bytes**.\n` +
                  `Saldo atual: **${userData.money} Bytes**`
                )
            ],
            components: []
          });
        }

        return msg.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(`🎮 Blackjack - ${nome}`)
              .setColor('#2ecc71')
              .setDescription(
                `🎲 Aposta: **${aposta} Bytes**\n\n` +
                `🧍‍♂️ Suas Cartas: \`${formatCards(playerCards)}\` (Total: **${playerTotal}**)\n` +
                `🤖 Cartas do Dealer: \`${dealerDisplay}\`\n\n` +
                `Escolha sua jogada clicando nos botões abaixo:`
              )
          ]
        });
      }

      if (interaction.customId === 'stand') {
        while (dealerTotal < 17) {
          dealerCards.push(getCard());
          dealerTotal = calcValor(dealerCards);
        }

        const blackjack = playerTotal === 21 && playerCards.length === 2;
        let resultado = '';
        let cor = 'Yellow';
        let ganho = 0;

        if (blackjack) {
          ganho = Math.floor(aposta * 2.5);
          userData.money += ganho;
          resultado = `🃏 BLACKJACK! Você ganhou **${ganho} Bytes** com uma jogada perfeita!`;
          cor = 'Green';
          await message.channel.send(`🎉 **INCRÍVEL! ${nome} tirou um BLACKJACK!** 🂡🂱`);
        } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
          ganho = aposta;
          userData.money += ganho;
          resultado = `✅ Vitória! Você ganhou **${ganho} Bytes**!`;
          cor = 'Green';
        } else if (playerTotal < dealerTotal) {
          userData.money -= aposta;
          resultado = `❌ Você perdeu **${aposta} Bytes**. Mais sorte na próxima!`;
          cor = 'Red';
        } else {
          const perda = Math.floor(aposta * 0.07);
          userData.money -= perda;
          resultado = `🤝 Empate! Você perdeu uma taxa de **7%** da aposta (**${perda} Bytes**)`;
          cor = 'Orange';
        }

        await userData.save();
        partidasAtivas.delete(userid);

        return msg.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(`🏁 Resultado Final`)
              .setColor(cor)
              .setDescription(
                `🧍‍♂️ Suas Cartas: \`${formatCards(playerCards)}\` (Total: **${playerTotal}**)\n` +
                `🤖 Cartas do Dealer: \`${formatCards(dealerCards)}\` (Total: **${dealerTotal}**)\n\n` +
                `${resultado}\n💰 Saldo atual: **${userData.money} Bytes**`
              )
          ],
          components: []
        });
      }
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        partidasAtivas.delete(userid);
        msg.edit({
          embeds: [
            new EmbedBuilder()
              .setColor('Grey')
              .setTitle('⌛ Tempo Esgotado')
              .setDescription('A partida foi encerrada por inatividade.')
          ],
          components: []
        });
      }
    });
  }
};