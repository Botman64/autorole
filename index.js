require('dotenv').config();
const Discord = require("discord.js");
const guilds = require("./config.json");

const client = new Discord.Client({ intents: [
  Discord.Intents.FLAGS.GUILDS,
  Discord.Intents.FLAGS.GUILD_MEMBERS
] });

client.on('ready', () => {
  console.log(`Launched as a bot: ${client.user.tag}!`);
});

client.on('guildMemberAdd', member => {
  if (!guilds[member.guild.id]) return; 
  return member.roles.add(member.guild.roles.cache.get(guilds[member.guild.id]));
});

client.login(process.env.BOT_TOKEN);