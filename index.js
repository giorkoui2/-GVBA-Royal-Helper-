const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

// ================= IDS =================
const TICKET_CATEGORY_ID = "1507314209397018735";
const TRANSCRIPT_CHANNEL_ID = "1507314212559655006";
const ROYALTY_ROLE_ID = "1507327303380766864";

// ================= BOT =================
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

// ================= TRANSCRIPT =================
async function createTranscript(channel) {
  const messages = await channel.messages.fetch({ limit: 100 });

  const sorted = [...messages.values()].reverse();

  let transcript = `📜 GVBA HQ TRANSCRIPT\nChannel: ${channel.name}\n\n`;

  for (const msg of sorted) {
    if (msg.author.bot) continue;
    transcript += `[${msg.author.tag}] ${msg.content}\n`;
  }

  return transcript;
}

// ================= TEXT COMMANDS =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!ping") {
    return message.reply("🏓 GVBA bot is online!");
  }

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

    return message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ================= BUTTON SYSTEM =================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const guild = interaction.guild;
  const user = interaction.user;

  // ================= CREATE TICKET =================
  if (interaction.customId.startsWith("ticket_")) {

    const channel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: 0,
      parent: TICKET_CATEGORY_ID,
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

    await channel.send({
      content: `🎫 Welcome ${user}. A Royalty member will assist you soon.`,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("Close Ticket")
            .setStyle(ButtonStyle.Danger)
        )
      ]
    });

    return interaction.reply({
      content: `✅ Ticket created: ${channel}`,
      ephemeral: true
    });
  }

  // ================= CLOSE TICKET (ROYALTY ONLY) =================
  if (interaction.customId === "close_ticket") {

    const member = interaction.member;

    // 🔒 ROLE CHECK
    if (!member.roles.cache.has(ROYALTY_ROLE_ID)) {
      return interaction.reply({
        content: "⛔ Only Royalty Team can close tickets.",
        ephemeral: true
      });
    }

    const channel = interaction.channel;

    await interaction.reply({
      content: "📊 Type result: Passed / Failed / Other",
      ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id;

    const collected = await channel.awaitMessages({
      filter,
      max: 1,
      time: 30000
    }).catch(() => null);

    let result = "Other";

    if (collected && collected.first()) {
      result = collected.first().content;
    }

    // 📜 TRANSCRIPT
    const messages = await channel.messages.fetch({ limit: 100 });
    const sorted = [...messages.values()].reverse();

    let transcript = `📜 GVBA HQ REPORT\nChannel: ${channel.name}\nResult: ${result}\n\n`;

    for (const msg of sorted) {
      if (msg.author.bot) continue;
      transcript += `[${msg.author.tag}] ${msg.content}\n`;
    }

    const logChannel = interaction.guild.channels.cache.get(TRANSCRIPT_CHANNEL_ID);

    if (logChannel) {
      await logChannel.send({
        content:
`📜 **HQ TICKET CLOSED**
Channel: ${channel.name}
Result: **${result}**

\`\`\`
${transcript.slice(0, 1900)}
\`\`\``
      });
    }

    setTimeout(() => {
      channel.delete().catch(() => {});
    }, 3000);
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
