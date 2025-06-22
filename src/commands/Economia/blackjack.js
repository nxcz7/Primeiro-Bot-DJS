const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Economia = require('../../models/Economia');
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
  let total = 0;
  let ases = 0;
  for (const c of cards) {
    if (['J', 'Q', 'K'].includes(c)) total += 10;
    else if (c === 'A') {
      total += 11;
      ases++;
    } else {
      total += parseInt(c);
    }
  }
  while (total > 21 && ases > 0) {
    total -= 10;
    ases--;
  }
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
      return message.reply('⚠️ Você já está em uma partida de Blackjack em andamento. Por favor, finalize-a antes de iniciar outra.');

    let userData = await Economia.findOne({ userid });
    if (!userData) userData = await Economia.create({ nome, userid, money: 0, banco: 0 });

    if (!args[0]) return message.reply('❌ Informe o valor da aposta! Use por exemplo: `!blackjack 1k` ou `!blackjack all`');

    const aposta = parseValor(args[0], userData.money);
    if (isNaN(aposta) || aposta <= 0) return message.reply('❌ Valor inválido para aposta. Use números ou abreviações como 1k, 1.5m, all, half.');
    if (aposta > userData.money) return message.reply(`❌ Você não tem saldo suficiente. Seu saldo atual é ${userData.money} Bytes.`);

    partidasAtivas.add(userid);

    // Cartas iniciais
    let playerCards = [getCard(), getCard()];
    let dealerCards = [getCard(), getCard()];

    let playerTotal = calcValor(playerCards);
    let dealerTotal = calcValor(dealerCards);

    // Mostrar dealer com 1 carta oculta
    const dealerInitialDisplay = `${dealerCards[0]}, ❓`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hit').setLabel('🃏 Pedir Carta').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('stand').setLabel('✋ Parar').setStyle(ButtonStyle.Danger)
    );

    let embed = new EmbedBuilder()
      .setTitle(`♠️ Blackjack - ${nome}`)
      .setColor('Blue')
      .setDescription(
        `Você apostou **${aposta} Bytes**.\n\n` +
        `**Suas cartas:** ${formatCards(playerCards)} (Total: ${playerTotal})\n` +
        `**Cartas do dealer:** ${dealerInitialDisplay}\n\n` +
        `Clique em **Pedir Carta** para mais cartas ou **Parar** para finalizar sua jogada.`
      );

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === userid;
    const collector = msg.createMessageComponentCollector({ filter, time: 120000 });

    collector.on('collect', async interaction => {
      await interaction.deferUpdate();

      if (interaction.customId === 'hit') {
        playerCards.push(getCard());
        playerTotal = calcValor(playerCards);

        if (playerTotal > 21) {
          // Estourou
          userData.money -= aposta;
          await userData.save();
          partidasAtivas.delete(userid);

          embed = new EmbedBuilder()
            .setTitle(`♠️ Blackjack - ${nome}`)
            .setColor('Red')
            .setDescription(
              `💥 Você estourou com as cartas: ${formatCards(playerCards)} (Total: ${playerTotal})!\n` +
              `Você perdeu **${aposta} Bytes**.\n\n` +
              `Seu saldo atual é: **${userData.money} Bytes**.`
            );

          return msg.edit({ embeds: [embed], components: [] });
        }

        // Ainda não estourou, atualiza embed com cartas e total
        embed = new EmbedBuilder()
          .setTitle(`♠️ Blackjack - ${nome}`)
          .setColor('Blue')
          .setDescription(
            `Você apostou **${aposta} Bytes**.\n\n` +
            `**Suas cartas:** ${formatCards(playerCards)} (Total: ${playerTotal})\n` +
            `**Cartas do dealer:** ${dealerInitialDisplay}\n\n` +
            `Clique em **Pedir Carta** para mais cartas ou **Parar** para finalizar sua jogada.`
          );

        return msg.edit({ embeds: [embed] });
      }

      if (interaction.customId === 'stand') {
        // Dealer joga seguindo regra: compra até >= 17
        while (dealerTotal < 17) {
          dealerCards.push(getCard());
          dealerTotal = calcValor(dealerCards);
        }

        let resultadoTexto = '';
        let corEmbed = '';
        let saldoFinal = userData.money;

        if (dealerTotal > 21 || playerTotal > dealerTotal) {
          // Jogador vence
          saldoFinal += aposta;
          resultadoTexto = `🎉 Parabéns! Você venceu essa rodada!\nVocê ganhou **${aposta} Bytes**.`;
          corEmbed = 'Green';
        } else if (playerTotal < dealerTotal) {
          // Jogador perde
          saldoFinal -= aposta;
          resultadoTexto = `💥 Que pena, você perdeu essa rodada.\nVocê perdeu **${aposta} Bytes**.`;
          corEmbed = 'Red';
        } else {
          // Empate
          resultadoTexto = `😐 Empate! Nenhum Bytes ganho ou perdido.`;
          corEmbed = 'Yellow';
        }

        userData.money = saldoFinal;
        await userData.save();
        partidasAtivas.delete(userid);

        embed = new EmbedBuilder()
          .setTitle(`♠️ Blackjack - ${nome}`)
          .setColor(corEmbed)
          .setDescription(
            `**Suas cartas:** ${formatCards(playerCards)} (Total: ${playerTotal})\n` +
            `**Cartas do dealer:** ${formatCards(dealerCards)} (Total: ${dealerTotal})\n\n` +
            resultadoTexto + `\n\nSeu saldo final é: **${userData.money} Bytes**.`
          );

        msg.edit({ embeds: [embed], components: [] });
        collector.stop();
      }
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        partidasAtivas.delete(userid);
        embed = new EmbedBuilder()
          .setTitle(`♠️ Blackjack - ${nome}`)
          .setColor('Grey')
          .setDescription('⏰ Tempo esgotado. A partida foi cancelada.');

        msg.edit({ embeds: [embed], components: [] });
      }
    });
  }
};