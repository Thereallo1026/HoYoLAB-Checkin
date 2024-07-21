# HoYoLAB-Checkin
[![TypeScript](https://img.shields.io/static/v1?style=for-the-badge&label=TypeScript&message=v4.5&color=3178C6&logo=typescript)](https://www.typescriptlang.org/)

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
- HoYoLAB Account
- Network monitoring tool

### Usage

1. **Fork the repository**: Go to [HoYoLAB-Checkin on GitHub](https://github.com/yourusername/HoYoLAB-Checkin) and fork the repository.

2. **Add environment variables to GitHub Actions**:

   - Go to the "Settings" of your forked repository.
   - Navigate to "Security" secion > "Secrets and variables" > "Actions".
   - Add the following repository secrets:

     ```env
     HOYO_TOKENS=[{"stoken":"v2_XXXXXXX1234567890abcdefgHIJKLMN","mid":"1234567890_abc"},{"stoken":"v2_XXXXXXX1234567890abcdefgHIJKLMN","mid":"0987654321_def"}]
     WEBHOOK=https://discord.com/api/webhooks/000000000000000000/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     ```

3. **Ensure the GitHub Action works**:

   - Make sure the action is triggered and runs correctly by executing it once manually from the GitHub Actions tab.

### Configuration

- **Configuring tokens**: Ensure your tokens are correctly formatted in the environment variables.
- **Setting Up Webhook**: Add your Discord webhook URL to the appropriate configuration file.


### Frequently Asked Questions

#### What is a network monitoring tool?

A network monitoring tool helps you inspect and analyze network traffic. Examples include Fiddler (Both Anywhere and Classic), HTTP Toolkit, and any other tool capable of proxying and monitoring device traffic.

#### Where can I find my stoken?

You can locate your stoken by monitoring requests to the URL that includes "getBySToken" from the HoYoLAB app.

#### Why didn't the script work after some time?

The script may fail due to an expired stoken or a HoYoLAB geetest challenge. To resolve this, log in to HoYoLAB and complete the geetest challenge to restore functionality for automation.


### Contributing

1. [Fork this repository](https://github.com/thereallo1026/HoYoLAB-Checkin).
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push the branch.
4. Open a pull request describing your changes in detail.

### Contact

For any questions or issues, feel free to:
- Open an issue on the [GitHub repository](https://github.com/thereallo1026/HoYoLAB-Checkin/issues).
- Find me in any of the socials mentioned in [my profile](https://thereallo.dev).
