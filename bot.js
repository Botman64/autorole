require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const db = new sqlite3.Database('./roles.db', (err) => {
  if (err) console.error('Database connection error:', err);
  console.log('Connected to database');
});

db.run(`CREATE TABLE IF NOT EXISTS autoroles (
  guild_id TEXT,
  role_id TEXT,
  PRIMARY KEY (guild_id, role_id)
)`);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', async () => {
  console.log(`Launched as a bot: ${client.user.tag}!`);

  const commands = [
    new SlashCommandBuilder()
      .setName('autorole')
      .setDescription('Manage auto roles')
      .addSubcommand(sub =>
        sub.setName('add')
          .setDescription('Add a role to auto roles')
          .addStringOption(option =>
            option.setName('role_id')
              .setDescription('Role ID to add')
              .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('remove')
          .setDescription('Remove a role from auto roles')
          .addStringOption(option =>
            option.setName('role_id')
              .setDescription('Role ID to remove')
              .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('list')
          .setDescription('List auto roles')
      )
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(error);
  }
});

function getGuildRoles(guildId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT role_id FROM autoroles WHERE guild_id = ?', [guildId], (err, roles) => {
      if (err) return reject(err);
      resolve(roles);
    });
  });
}

client.on('guildMemberAdd', member => {
  getGuildRoles(member.guild.id)
    .then(roles => {
      if (!roles.length) return;
      roles.forEach(row => {
        member.roles.add(member.guild.roles.cache.get(row.role_id))
          .catch(console.error);
      });
    })
    .catch(console.error);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'autorole') return;
  const subCommand = interaction.options.getSubcommand();
  const guildId = interaction.guild.id;

  if (subCommand !== 'list' && subCommand !== 'add' && subCommand !== 'remove') return;

  if (subCommand === 'list') {
    try {
      const roles = await getGuildRoles(guildId);
      if (!roles.length) {
        return interaction.reply({ content: 'No auto roles configured.', flags: MessageFlags.Ephemeral });
      }
      const embed = new EmbedBuilder()
        .setTitle('Auto Roles')
        .setDescription(roles.map(row => `<@&${row.role_id}>`).join('\n'));
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    } catch (err) {
      return interaction.reply({ content: 'Database error occurred.', flags: MessageFlags.Ephemeral });
    }
  }

  const add = subCommand === 'add';
  const roleId = interaction.options.getString('role_id');
  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) return interaction.reply({ content: 'Role not found.', flags: MessageFlags.Ephemeral });

  const query = add
    ? 'INSERT OR IGNORE INTO autoroles (guild_id, role_id) VALUES (?, ?)'
    : 'DELETE FROM autoroles WHERE guild_id = ? AND role_id = ?';
  
  const params = add ? [guildId, roleId] : [guildId, roleId];
  
  db.run(query, params, function(err) {
    if (err) return interaction.reply({ content: 'Database error occurred.', flags: MessageFlags.Ephemeral });
    if (!add && this.changes === 0) {
      return interaction.reply({ content: 'Role was not in the auto roles list.', flags: MessageFlags.Ephemeral });
    }
    return interaction.reply({
      content: `Role ${role.name} ${add ? 'added to' : 'removed from'} auto roles list.`,
      flags: MessageFlags.Ephemeral
    });
  });
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error(err);
    process.exit(0);
  });
});

client.login(process.env.BOT_TOKEN);
