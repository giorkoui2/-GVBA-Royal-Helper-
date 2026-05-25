const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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

// COMMANDS
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!ping") {
    return message.reply("🏓 GVBA bot is online!");
  }

  // SEND SUPPORT PANEL
  if (message.content === "!support") {
    const embed = new EmbedBuilder()
      .setTitle("🪖 GVBA Support Center")
      .setDescription("Choose an option below to open a ticket.")
      .setColor(0x2b2d31);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_general")
        .setLabel("General Support")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("ticket_report")
        .setLabel("Report Member")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("ticket_staff")
        .setLabel("Staff Application")
        .setStyle(ButtonStyle.Secondary)
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

// BUTTON SYSTEM
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  let name = interaction.customId;

  await interaction.reply({
    content: `🎫 Ticket opened: ${name}`,
    ephemeral: true
  });
});

client.login(process.env.TOKEN);
