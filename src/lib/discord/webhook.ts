import { GAME_EMOTES, GAME_ICONS } from "../hoyolab/constants";
import type { AccountCheckInResult } from "../hoyolab/daily";

const IS_COMPONENTS_V2 = 1 << 15;
const COMPONENT = {
	SECTION: 9,
	TEXT_DISPLAY: 10,
	THUMBNAIL: 11,
	SEPARATOR: 14,
	CONTAINER: 17,
} as const;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function withComponentsQuery(webhookUrl: string) {
	const separator = webhookUrl.includes("?") ? "&" : "?";
	return `${webhookUrl}${separator}with_components=true`;
}

function escapeMarkdown(value: string) {
	return value.replace(/([\\`*_|>])/g, "\\$1");
}

function truncate(value: string, maxLength = 1024) {
	if (value.length <= maxLength) {
		return value;
	}

	return `${value.slice(0, maxLength - 3)}...`;
}

async function sendWebhook(webhookUrl: string, payload: WebhookPayload) {
	const response = await fetch(withComponentsQuery(webhookUrl), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	if (response.status !== 204) {
		throw new Error(`Unexpected response status: ${response.status}`);
	}
}

function buildGameSection(result: CheckInResult): SectionComponent {
	const rewardText = result.reward
		? `Today's Reward: ${escapeMarkdown(result.reward.name)} x${result.reward.count}`
		: "Today's Reward: Preview unavailable";
	const totalText =
		typeof result.totalSignDays === "number"
			? `Total Sign-ins: ${result.totalSignDays + (result.success ? 1 : 0)}`
			: "Total Sign-ins: Preview unavailable";
	const content = [
		`**${GAME_EMOTES[result.game as keyof typeof GAME_EMOTES] || ""} ${escapeMarkdown(
			result.game,
		)}**`,
		rewardText,
		totalText,
		`Result: \`${escapeMarkdown(result.message)}\``,
	].join("\n");

	return {
		type: COMPONENT.SECTION,
		components: [
			{
				type: COMPONENT.TEXT_DISPLAY,
				content: truncate(content),
			},
		],
		accessory: {
			type: COMPONENT.THUMBNAIL,
			media: {
				url:
					result.reward?.icon ||
					GAME_ICONS[result.game as keyof typeof GAME_ICONS],
			},
			description: result.reward?.name || result.game,
		},
	};
}

function buildAccountContainer(
	accountResult: AccountCheckInResult,
	accountIndex: number,
): ContainerComponent {
	const identifier = escapeMarkdown(
		accountResult.accountName ||
			accountResult.email ||
			`Account ${accountIndex + 1}`,
	);

	return {
		type: COMPONENT.CONTAINER,
		accent_color: accountResult.results.every((r) => r.success)
			? 0x00ff00
			: 0xff0000,
		components: [
			{
				type: COMPONENT.TEXT_DISPLAY,
				content: `## Account ${accountIndex + 1}: ${identifier}\nCheck-in executed <t:${Math.round(
					Date.now() / 1000,
				)}:R>`,
			},
			{
				type: COMPONENT.SEPARATOR,
				divider: true,
				spacing: 1,
			},
			...accountResult.results.map(buildGameSection),
		],
	};
}

export async function sendCheckin(
	webhookUrl: string,
	results: AccountCheckInResult[],
) {
	if (!webhookUrl?.startsWith("https://discord.com/api/webhooks/")) {
		throw new Error("Invalid Discord webhook URL");
	}

	for (let accountIndex = 0; accountIndex < results.length; accountIndex++) {
		const accountResult = results[accountIndex];
		const payload: WebhookPayload = {
			username: `HoYoLAB Check-in | Account ${accountIndex + 1}`,
			flags: IS_COMPONENTS_V2,
			components: [buildAccountContainer(accountResult, accountIndex)],
		};

		try {
			await sendWebhook(webhookUrl, payload);
			console.log(`Webhook sent successfully for Account ${accountIndex + 1}`);
			await delay(500);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("404")) {
					throw new Error(
						"Webhook not found. Please check your Discord webhook URL.",
					);
				}
				if (error.message.includes("429")) {
					throw new Error("Rate limit exceeded. Please try again later.");
				}
			}
			throw new Error(
				`Failed to send webhook for Account ${accountIndex + 1}: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			);
		}
	}
}

interface WebhookPayload {
	username: string;
	flags: number;
	components: ContainerComponent[];
}

interface ContainerComponent {
	type: typeof COMPONENT.CONTAINER;
	accent_color: number;
	components: Array<
		TextDisplayComponent | SeparatorComponent | SectionComponent
	>;
}

interface SectionComponent {
	type: typeof COMPONENT.SECTION;
	components: TextDisplayComponent[];
	accessory: ThumbnailComponent;
}

interface TextDisplayComponent {
	type: typeof COMPONENT.TEXT_DISPLAY;
	content: string;
}

interface ThumbnailComponent {
	type: typeof COMPONENT.THUMBNAIL;
	media: {
		url: string;
	};
	description: string;
}

interface SeparatorComponent {
	type: typeof COMPONENT.SEPARATOR;
	divider: boolean;
	spacing: number;
}

interface CheckInResult {
	game: string;
	success: boolean;
	message: string;
	reward?: {
		name: string;
		count: number;
		icon?: string;
	};
	totalSignDays?: number;
}
