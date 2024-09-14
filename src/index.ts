import { condenseTokens } from "./lib/hoyolab/token";
import { getGames } from "./lib/hoyolab/utils";
import { checkinAll } from "./lib/hoyolab/daily";
import { sendCheckin } from "./lib/discord/webhook";

const accountsArray = JSON.parse(process.env.HOYO_TOKENS as string);
const DISCORD_WEBHOOK_URL = process.env.WEBHOOK;

if (!DISCORD_WEBHOOK_URL) {
  console.error("Discord webhook URL is not set in the environment variables.");
  process.exit(1);
}

(async () => {
  const tokensArray = await condenseTokens(accountsArray);

  // log registered games
  for (const tokens of tokensArray) {
    const gameArray = await getGames(tokens);
    const { accountName, email } = tokens.data;

    const tokenMessage =
      accountName && email
        ? `Got tokens for ${accountName} (${email})`
        : `Got tokens for ${accountName || email}`;

    console.log(tokenMessage);

    console.log(
      `Registered games: ${gameArray.length ? gameArray.join(", ") : "None"}`
    );
  }

  console.log("\nPerforming daily check-ins...\n");

  // check-in all accounts
  const checkInResults = await checkinAll(tokensArray);

  for (const accountResult of checkInResults) {
    const identifier = accountResult.accountName || accountResult.email;
    console.log(`Daily check-in for ${identifier}:`);
    for (const result of accountResult.results) {
      console.log(
        `[${result.success ? "Success" : "Failed"}] ${result.game}: ${
          result.message
        }`
      );
    }
    console.log("---");
  }

  // send webhooks
  console.log("\nSending Discord webhooks...");
  try {
    await sendCheckin(DISCORD_WEBHOOK_URL, checkInResults);
    console.log("Discord webhooks sent successfully.");
  } catch (error) {
    console.error(
      "Failed to send Discord webhooks:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
})();
