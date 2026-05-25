const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// BOT READY
client.once("ready", () => {
  console.log(`GVBA Bot online as ${client.user.tag}`);
});

// SIMPLE COMMAND SYSTEM
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // /ping
  if (interaction.commandName === "ping") {
    await interaction.reply("🏓 Pong! GVBA bot is online.");
  }

  // /support panel
  if (interaction.commandName === "support") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("support_general")
        .setLabel("General Support")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("support_report")
        .setLabel("Report Member")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("support_staff")
        .setLabel("Staff Application")
        .setStyle(ButtonStyle.Secondary)
    );

    const embed = new EmbedBuilder()
      .setTitle("🪖 GVBA Support Center")
      .setDescription("Choose an option below to open a ticket.")
      .setColor("DarkBlue");

    await interaction.reply({ embeds: [embed], components: [row] });
  }
});

// BUTTON SYSTEM
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("support_")) {
    await interaction.reply({
      content: `🎫 Ticket created: ${interaction.customId}`,
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
