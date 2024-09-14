import axios from "axios";
import { GAME_ICONS } from "../hoyolab/data";

interface WebhookPayload {
  username: string;
  content: string;
  embeds: Embed[];
}

interface Embed {
  title: string;
  description: string;
  color: number;
  author: {
    name: string;
    icon_url: string;
  };
  footer: {
    text: string;
  };
  thumbnail?: {
    url: string;
  };
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

export async function sendWebhook(
  webhookUrl: string,
  game: string,
  accountName: string,
  email: string,
  accountIndex: number,
  success: boolean,
  message: string,
  thumbnailUrl?: string
) {
  if (
    !webhookUrl ||
    !webhookUrl.startsWith("https://discord.com/api/webhooks/")
  ) {
    throw new Error("Invalid Discord webhook URL");
  }

  const embed: Embed = {
    title: success ? "Check-in Successful" : "Check-in Failed",
    description: message,
    color: success ? 0x00ff00 : 0xff0000,
    author: {
      name: game,
      icon_url:
        GAME_ICONS[game as keyof typeof GAME_ICONS] ||
        "https://cdn.gilcdn.com/ContentMediaGenericFiles/86a5a5602d2dee96134733916bc891a9-Full.webp",
    },
    footer: {
      text: `HoYoLAB-Check-in`,
    },
  };

  if (thumbnailUrl) {
    embed.thumbnail = { url: thumbnailUrl };
  }

  const payload: WebhookPayload = {
    username: `HoYoLAB Check-in | Account ${accountIndex} - ${accountName}`,
    content: `Check-in executed <t:${Math.round(Date.now() / 1000)}:R>`,
    embeds: [embed],
  };

  try {
    const response = await axios.post(webhookUrl, payload);
    if (response.status !== 204) {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
    const identifier =
      accountName && email ? `${accountName} (${email})` : accountName || email;

    console.log(`Webhook sent successfully for ${game} ${identifier}`);
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
      `Failed to send webhook for ${game} (${accountName}): ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
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

  for (let i = 0; i < results.length; i++) {
    const accountResult = results[i];
    for (const result of accountResult.results) {
      try {
        await sendWebhook(
          webhookUrl,
          result.game,
          accountResult.accountName,
          accountResult.email,
          i + 1,
          result.success,
          result.message
        );
        await delay(800);
      } catch (error) {
        console.error(
          `Error sending webhook: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        throw error; // re-throw the error to stop the process
      }
    }
  }
}
