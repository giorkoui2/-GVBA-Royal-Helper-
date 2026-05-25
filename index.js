const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");

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


// TEXT COMMANDS
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // ping test
  if (message.content === "!ping") {
    return message.reply("🏓 GVBA bot is online!");
  }

  // support panel
  if (message.content === "!support") {
    const embed = new EmbedBuilder()
      .setTitle("🪖 GVBA Support Center")
      .setDescription("Click a button to open a ticket.")
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


// BUTTONS (REAL TICKETS)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const guild = interaction.guild;
  const user = interaction.user;

  if (interaction.customId.startsWith("ticket_")) {

    // CREATE REAL CHANNEL
    const channel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: 0, // text channel
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]
    });

    await channel.send(`🎫 Welcome ${user} to your ticket. A staff member will assist you shortly.`);

    return interaction.reply({
      content: `✅ Ticket created: ${channel}`,
      ephemeral: true
    });
  }
});


client.login(process.env.TOKEN);
