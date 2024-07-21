import * as dotenv from "dotenv";
import { condenseTokens } from "./lib/hoyolab/token";
import { getGames } from "./lib/hoyolab/utils";
import { checkinAll } from "./lib/hoyolab/daily";
import { sendCheckin } from "./lib/discord/webhook";

dotenv.config();
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
    console.log(
      `Got tokens for ${tokens.email}\nRegistered games: ${gameArray.join(
        ", "
      )}`
    );
  }

  console.log("\nPerforming daily check-ins...\n");

  // check-in all accounts
  const checkInResults = await checkinAll(tokensArray);

  for (const accountResult of checkInResults) {
    console.log(`Daily check-in for ${accountResult.email}:`);
    for (const result of accountResult.results) {
      console.log(
        `  ${result.game}: ${result.success ? "Success" : "Failed"} - ${
          result.message
        }`
      );
    }
    console.log("---");
  }

  // send webhooks
  console.log("\nSending Discord webhooks...");
  await sendCheckin(DISCORD_WEBHOOK_URL, checkInResults);
  console.log("Discord webhooks sent.");
})();
