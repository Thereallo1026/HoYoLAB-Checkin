# HoYoLAB-Checkin

Automated daily check-ins for all HoYoverse games using GitHub Actions.

## Features

- **Automated Daily Check-ins**: Executes daily check-ins for HoYoverse games.
- **Auto Game Detection**: Automatically detects which games are registered and performs check-ins accordingly.
- **Discord Webhook Notifications**: Sends notifications to a Discord channel about check-in status and any relevant updates.
- **Multiple Accounts Support**: Handles check-ins for multiple HoYoLAB accounts simultaneously.


## Getting Started

### Prerequisites

- GitHub Account
- Discord Account

### Usage

1. **Fork the repository**: Go to [HoYoLAB-Checkin on GitHub](https://github.com/yourusername/HoYoLAB-Checkin) and fork the repository.

2. **Add environment variables to GitHub Actions**:

   - Go to the "Settings" of your forked repository.
   - Navigate to "Secrets and variables" > "Actions".
   - Add the following environment variables:

     ```env
     HOYO_TOKENS=[{"stoken":"v2_XXXXXXX1234567890abcdefgHIJKLMN","mid":"1234567890_abc"},{"stoken":"v2_XXXXXXX1234567890abcdefgHIJKLMN","mid":"0987654321_def"}]
     WEBHOOK=https://discord.com/api/webhooks/000000000000000000/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     ```

3. **Ensure the GitHub Action works**:

   - Make sure the action is triggered and runs correctly by executing it once manually from the GitHub Actions tab.

### Configuration

- **Configuring tokens**: Ensure your tokens are correctly formatted in the environment variables.
- **Setting Up Webhook**: Add your Discord webhook URL to the appropriate configuration file.

### Contributing

1. Fork the repository at [HoYoLAB-Checkin](https://github.com/thereallo1026/HoYoLAB-Checkin).
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push the branch.
4. Open a pull request describing your changes.

### Contact

For any questions or issues, please open an issue on the [GitHub repository](https://github.com/thereallo1026/HoYoLAB-Checkin/issues).
