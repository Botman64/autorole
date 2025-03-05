# Discord Autorole Bot

A simple Discord bot built with Discord.js v14 that automatically assigns roles to new members when they join your server.

## Features

- 🚀 Automatic role assignment for new members
- ⚙️ Multi-server support
- 🔒 Secure token-based authentication
- 💪 Built with Discord.js v14

## Prerequisites

- Node.js 16.9.0 or higher
- A Discord Bot Token
- Server Admin permissions to add the bot

## Installation

1. Clone this repository:
```bash
git clone https://github.com/Botman64/autorole.git
cd autorole
```

2. Install dependencies:
```bash
npm install
```

3. Set up your configuration:
   - Copy `.env.example` to `.env` and add your bot token
   - Edit `config.json` with your server and role IDs

## Configuration

### Environment Variables
Create a `.env` file with your bot token:
```env
BOT_TOKEN=your_bot_token_here
```

### Role Configuration
In `config.json`, add your server ID and the role ID you want to assign:
```json
{
    "your_server_id": "role_id_to_assign",
    "another_server_id": "another_role_id"
}
```

## Usage

1. Start the bot:
```bash
npm start
```

2. Invite the bot to your server with the following permissions:
   - Manage Roles
   - Read Messages/View Channels

## Required Bot Permissions

- `MANAGE_ROLES` - For assigning roles to new members
- `VIEW_CHANNELS` - For detecting when new members join

## Support

If you encounter any issues or have questions, please open an issue in this repository.

## License

This project is licensed under the GPL-3.0 License.
