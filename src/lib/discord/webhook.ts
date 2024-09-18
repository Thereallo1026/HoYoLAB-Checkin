import axios from "axios";
import { GAME_EMOTES } from "../hoyolab/constants";

interface WebhookPayload {
  username: string;
  content: string;
  embeds: Embed[];
}

interface Embed {
  title: string;
  color: number;
  fields: EmbedField[];
  footer: {
    text: string;
  };
}

interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

interface CheckInResult {
  game: string;
  success: boolean;
  message: string;
}

interface AccountCheckInResult {
  accountName: string;
  email: string;
  results: CheckInResult[];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendWebhook(webhookUrl: string, payload: WebhookPayload) {
  const response = await axios.post(webhookUrl, payload);
  if (response.status !== 204) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
}

export async function sendCheckin(
  webhookUrl: string,
  results: AccountCheckInResult[]
) {
  if (
    !webhookUrl ||
    !webhookUrl.startsWith("https://discord.com/api/webhooks/")
  ) {
    throw new Error("Invalid Discord webhook URL");
  }

  for (let accountIndex = 0; accountIndex < results.length; accountIndex++) {
    const accountResult = results[accountIndex];
    const fields: EmbedField[] = accountResult.results.map((result) => ({
      name: `${GAME_EMOTES[result.game as keyof typeof GAME_EMOTES] || ""} ${
        result.game
      }`,
      value: `Check-in ${result.success ? "success" : "failed"}\n\`\`\`${
        result.message
      }\`\`\``,
      inline: false,
    }));

    const identifier = `${accountResult.accountName || accountResult.email}`;
    const embed: Embed = {
      title: `Account ${accountIndex + 1}: ${identifier.replace("*", "\\*")}`,
      color: accountResult.results.every((r) => r.success)
        ? 0x00ff00
        : 0xff0000,
      fields,
      footer: {
        text: "HoYoLAB Check-in",
      },
    };

    const payload: WebhookPayload = {
      username: `HoYoLAB Check-in | Account ${accountIndex + 1}`,
      content: `Check-in executed <t:${Math.round(Date.now() / 1000)}:R>`,
      embeds: [embed],
    };

    try {
      await sendWebhook(webhookUrl, payload);
      console.log(`Webhook sent successfully for Account ${accountIndex + 1}`);
      await delay(500);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(
            "Webhook not found. Please check your Discord webhook URL."
          );
        } else if (error.response?.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
      }
      throw new Error(
        `Failed to send webhook for Account ${accountIndex + 1}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
