const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`GVBA Bot online as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  console.log("MESSAGE DETECTED:", message.content);

  if (message.content === "!ping") {
    message.reply("🏓 GVBA bot is online!");
  }
});

client.login(process.env.TOKEN);
