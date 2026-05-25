const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const fetch = require("node-fetch");

// ================= IDS =================
const ROYALTY_ROLE_ID = "1507327303380766864";
const TRANSCRIPT_CHANNEL_ID = "1507314212559655006";

// ================= STATE =================
let boundGroupId = null;

// 🔐 SAFE: stored in Railway ENV
const openCloudKey = process.env.OPEN_CLOUD_KEY;

// ================= BOT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`🪖 GVBA HQ ONLINE as ${client.user.tag}`);
});

// ================= LOG SYSTEM =================
function log(guild, text) {
  const ch = guild.channels.cache.get(TRANSCRIPT_CHANNEL_ID);
  if (ch) ch.send(`📜 ${text}`);
}

// ================= OPEN CLOUD CORE =================
async function promoteUser(groupId, userId, rankId) {
  if (!openCloudKey) return "NO_KEY";

  try {
    const res = await fetch(
      `https://apis.roblox.com/cloud/v2/groups/${groupId}/memberships/${userId}`,
      {
        method: "PATCH",
        headers: {
          "x-api-key": openCloudKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          roleId: rankId
        })
      }
    );

    if (!res.ok) return "FAILED";

    return "SUCCESS";
  } catch (err) {
    return "ERROR";
  }
}

// ================= COMMANDS =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // 🏓 ping
  if (message.content === "!ping") {
    return message.reply("🏓 GVBA HQ ONLINE");
  }

  // 🪖 group bind
  if (message.content.startsWith("!groupbind")) {
    const id = message.content.split(" ")[1];
    if (!id) return message.reply("❌ Usage: !groupbind <groupId>");

    boundGroupId = id;
    return message.reply(`🪖 Group bound: ${boundGroupId}`);
  }

  // 📊 status
  if (message.content === "!status") {
    return message.reply(
      `🪖 HQ STATUS\nGroup: ${boundGroupId || "NOT SET"}\nOpenCloud: ${openCloudKey ? "READY" : "MISSING"}`
    );
  }

  // 🪖 PROMOTE (REAL API CALL)
  if (message.content.startsWith("!promote")) {

    const member = message.member;
    if (!member.roles.cache.has(ROYALTY_ROLE_ID)) {
      return message.reply("⛔ Royalty only command.");
    }

    const args = message.content.split(" ");
    const userId = args[1];
    const rankId = args[2];

    if (!boundGroupId) return message.reply("❌ No group bound.");
    if (!openCloudKey) return message.reply("❌ No Open Cloud key set in ENV.");

    const result = await promoteUser(boundGroupId, userId, rankId);

    if (result === "SUCCESS") {
      message.reply(`🪖 Promotion successful for ${userId}`);
      log(message.guild, `PROMOTE: ${userId} → rank ${rankId}`);
    } else {
      message.reply(`❌ Promotion failed (${result})`);
    }
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
