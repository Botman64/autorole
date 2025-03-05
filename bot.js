require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const guilds = require("./config.json");

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ] 
});

client.on('ready', () => {
  console.log(`Launched as a bot: ${client.user.tag}!`);
});

client.on('guildMemberAdd', member => {
  const configRoles = guilds[member.guild.id];
  if (!configRoles) return;
  
  if (Array.isArray(configRoles)) {
    configRoles.forEach(roleId => {
      member.roles.add(member.guild.roles.cache.get(roleId));
    });
  } else {  
    member.roles.add(member.guild.roles.cache.get(configRoles));
  }
});

client.login(process.env.BOT_TOKEN);
