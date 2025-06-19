// src/utils/findUser.js

async function findUser(message) {
  const client = message.client;
  const conteudo = message.content.split(/\s+/).slice(1).join(' '); // ignora o nome do comando
  let user = message.mentions.users.first();

  // ID direto
  if (!user && /^\d{17,19}$/.test(conteudo)) {
    try {
      user = await client.users.fetch(conteudo);
    } catch (e) {}
  }

  // Nome de usuário ou tag
  if (!user && conteudo) {
    const termo = conteudo.toLowerCase();
    user = client.users.cache.find(u =>
      u.username.toLowerCase() === termo ||
      u.tag.toLowerCase() === termo
    );
  }

  // fallback
  if (!user) user = message.author;

  return user;
}

module.exports = { findUser };