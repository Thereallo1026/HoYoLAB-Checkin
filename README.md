![HoYoLAB Checkin](https://github.com/user-attachments/assets/1ae984ff-54cc-4040-814f-6b12d78b0930)

## Features

- **Automated Daily Check-ins**: Executes daily check-ins for HoYoverse games.
- **Auto Game Detection**: Automatically detects which games are registered and performs check-ins accordingly.
- **Discord Notifications**: Sends notifications to a Discord channel about check-in status and any relevant updates using webhooks.
- **Multiple Accounts Support**: Handles check-ins for multiple HoYoLAB accounts simultaneously.

## Getting Started

### Prerequisites

- GitHub Account
- Discord Account
- HoYoLAB Account
- Network monitoring tool

### Usage

1. **Fork the repository**: Go to [HoYoLAB-Checkin on GitHub](https://github.com/Thereallo1026/HoYoLAB-Checkin) and fork the repository.

2. **Retrieve Tokens from HoYoLAB**: Use a network monitoring tool to capture the `stoken` and `mid` from HoYoLAB requests. For detailed instructions, please refer to [this section](#where-can-i-find-my-stoken).

3. **Add environment variables to GitHub Actions**:

   - Go to the "Settings" of your forked repository.
   - Navigate to the "Security" section > "Secrets and variables" > "Actions".
   - Add the following repository secrets:

     ```env
     HOYO_TOKENS=[{"stoken":"v2_XXXXXXX1234567890abcdefgHIJKLMN","mid":"1234567890_abc"},{"stoken":"v2_XXXXXXX1234567890abcdefgHIJKLMN","mid":"0987654321_def"}]
     WEBHOOK=https://discord.com/api/webhooks/000000000000000000/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     ```

4. **Test GitHub action workflow**:

   - Make sure the action is triggered and runs correctly by executing it once manually from the GitHub Actions tab.

> [!TIP]
> The workflow might fail on the first run due to already checked in, you can ignore the error if you checked in before. It will run correctly on the next scheduled run.

### Configuration

- **Configuring tokens**: Ensure your tokens are correctly formatted in the environment variables.
- **Setting Up Webhook**: Add your Discord webhook URL to the appropriate environment variable.

## Frequently Asked Questions

### What is a network monitoring tool?

A network monitoring tool helps you inspect and analyze network traffic. Examples include Fiddler (Both Anywhere and Classic), HTTP Toolkit, and any other tool capable of proxying and monitoring device traffic.

### Where can I find my stoken?

You can locate your stoken by monitoring requests to the endpoint that includes "getBySToken" from the HoYoLAB app, the URL should be `https://sg-public-api.hoyoverse.com/account/ma-passport/token/getBySToken`.

Both the stoken and mid can be found at the cookies header.
![Screenshot](https://github.com/user-attachments/assets/327cc971-2715-4b64-b404-7d02a93aa4da)

### Why did the script fail after a period of time?

The script may fail due to expired stokens or a HoYoLAB geetest challenge, while the chance of this happening is minimal, it's not impossible. To resolve this:

#### Geetest

Log in to HoYoLAB and complete the geetest challenge.

#### Expired tokens

Redo the setup process, and replace all expired tokens.

## Contributing

1. [Fork this repository](https://github.com/thereallo1026/HoYoLAB-Checkin).
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push the branch.
4. Open a pull request describing your changes in detail.

## Planned Features

- [ ] **Rewards Preview**: Show the rewards you will get from the check-in.

- [ ] **Redemption Codes**: Redeem redemption codes from promotions and live events.

## Contact

For any questions or issues, feel free to:

- Open an issue on the [GitHub repository](https://github.com/thereallo1026/HoYoLAB-Checkin/issues).
- Find me in any of the socials mentioned in [my profile](https://thereallo.dev).
