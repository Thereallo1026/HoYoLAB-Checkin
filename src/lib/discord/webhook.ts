import axios from "axios";
import { GAME_ICONS } from "../hoyolab/data";

interface WebhookPayload {
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

export async function sendWebhook(
  webhookUrl: string,
  game: string,
  email: string,
  success: boolean,
  message: string,
  thumbnailUrl?: string
) {
  const embed: Embed = {
    title: success ? "Check-in Successful" : "Check-in Failed",
    description: message,
    color: success ? 0x00ff00 : 0xff0000,
    author: {
      name: game,
      icon_url:
        GAME_ICONS[game as keyof typeof GAME_ICONS] ||
        "https://placeholder.com/default_icon",
    },
    footer: {
      text: `${game} | ${email}`,
    },
  };

  if (thumbnailUrl) {
    embed.thumbnail = { url: thumbnailUrl };
  }

  const payload: WebhookPayload = {
    content: `Check-in executed successfully <t:${Math.round(
      Date.now() / 1000
    )}:R>`,
    embeds: [embed],
  };

  try {
    await axios.post(webhookUrl, payload);
    console.log(`Webhook sent successfully for ${game} (${email})`);
  } catch (error) {
    console.error(`Failed to send webhook for ${game} (${email}):`, error);
  }
}

export async function sendCheckin(webhookUrl: string, results: any[]) {
  for (const accountResult of results) {
    for (const result of accountResult.results) {
      await sendWebhook(
        webhookUrl,
        result.game,
        accountResult.email,
        result.success,
        result.message
      );
    }
  }
}
