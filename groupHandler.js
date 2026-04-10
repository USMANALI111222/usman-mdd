const config = require("./config");

async function handleGroupUpdate(sock, update) {
  const { id, participants, action } = update;

  try {
    const groupMeta = await sock.groupMetadata(id);
    const groupName = groupMeta.subject;

    for (const participant of participants) {
      if (action === "add" && config.welcome) {
        const ppUrl = await sock
          .profilePictureUrl(participant, "image")
          .catch(() => "https://i.ibb.co/8LyvT0W/avatar.png");

        const welcomeText =
          `╭┈───〔 *WELCOME* 〕┈───⊷\n` +
          `├▢ 👋 *Welcome:* @${participant.split("@")[0]}\n` +
          `├▢ 👥 *Group:* ${groupName}\n` +
          `├▢ 👤 *Members:* ${groupMeta.participants.length}\n` +
          `╰───────────────────⊷\n\n` +
          (config.welcomeMsg || "Welcome to the group! 🎉");

        await sock.sendMessage(id, {
          image: { url: ppUrl },
          caption: welcomeText,
          mentions: [participant],
        });
      }

      if (action === "remove" && config.goodbye) {
        const goodbyeText =
          `╭┈───〔 *GOODBYE* 〕┈───⊷\n` +
          `├▢ 👋 *Left:* @${participant.split("@")[0]}\n` +
          `├▢ 👥 *Group:* ${groupName}\n` +
          `╰───────────────────⊷\n\n` +
          (config.goodbyeMsg || "Goodbye! 👋");

        await sock.sendMessage(id, {
          text: goodbyeText,
          mentions: [participant],
        });
      }
    }
  } catch (e) {}
}

module.exports = { handleGroupUpdate };
