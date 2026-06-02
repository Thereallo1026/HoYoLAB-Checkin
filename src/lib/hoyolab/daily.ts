import { HEADERS, ROUTES } from "./constants";
import type { TokenInfo } from "./token";
import { getDsHeader } from "./token";
import { getGames } from "./utils";

async function getDailyReward(
	tokens: TokenInfo,
	routeInfo: RouteType,
): Promise<DailyRewardPreview | undefined> {
	const { ltuid, ltoken } = tokens;
	const headers = {
		...HEADERS,
		ds: getDsHeader(),
		"x-rpc-signgame": routeInfo.gameName,
		cookie: `ltmid_v2=${ltuid};ltoken_v2=${ltoken};ltuid_v2=${ltuid};`,
	};
	const searchParams = new URLSearchParams({
		act_id: routeInfo.actId,
		lang: "en-us",
	});

	const infoResponse = await fetch(`${routeInfo.infoUrl}?${searchParams}`, {
		headers,
	});

	if (!infoResponse.ok) {
		throw new Error(`Reward info HTTP error: ${infoResponse.status}`);
	}

	const infoData = await infoResponse.json();
	if (infoData.retcode !== 0) {
		throw new Error(infoData.message || "Failed to get reward sign info");
	}

	const homeResponse = await fetch(`${routeInfo.homeUrl}?${searchParams}`, {
		headers,
	});

	if (!homeResponse.ok) {
		throw new Error(`Rewards HTTP error: ${homeResponse.status}`);
	}

	const homeData = await homeResponse.json();
	if (homeData.retcode !== 0) {
		throw new Error(homeData.message || "Failed to get rewards data");
	}

	const totalSignDays = Number(infoData.data?.total_sign_day ?? 0);
	const award = homeData.data?.awards?.[totalSignDays];

	if (!award) {
		return {
			totalSignDays,
		};
	}

	return {
		totalSignDays,
		reward: {
			name: award.name,
			count: Number(award.cnt),
			icon: award.icon,
		},
	};
}

export async function performCheckin(
	tokens: TokenInfo,
): Promise<CheckInResult[]> {
	const { ltuid, ltoken } = tokens;
	const registeredGames = await getGames(tokens);
	const results: CheckInResult[] = [];

	for (const game of registeredGames) {
		if (game in ROUTES) {
			const routeInfo = ROUTES[game as keyof typeof ROUTES];
			let rewardPreview: DailyRewardPreview = {};

			try {
				try {
					rewardPreview = (await getDailyReward(tokens, routeInfo)) ?? {};
				} catch (error) {
					console.warn(
						`Failed to get reward preview for ${game}: ${
							error instanceof Error ? error.message : "Unknown error"
						}`,
					);
				}

				const headers = {
					...HEADERS,
					ds: getDsHeader(),
					"x-rpc-signgame": routeInfo.gameName,
					cookie: `ltmid_v2=${ltuid};ltoken_v2=${ltoken};ltuid_v2=${ltuid};`,
				};

				const response = await fetch(`${routeInfo.url}?lang=en-us`, {
					method: "POST",
					headers: {
						...headers,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						act_id: routeInfo.actId,
						lang: "en-us",
					}),
				});

				const data = await response.json();

				if (data.retcode === 0) {
					results.push({
						game,
						success: true,
						message: data.message,
						...rewardPreview,
					});
				} else {
					results.push({
						game,
						success: false,
						message: data.message,
						...rewardPreview,
					});
				}
			} catch (error) {
				if (error instanceof Error) {
					results.push({
						game,
						success: false,
						message: error.message,
						...rewardPreview,
					});
				} else {
					results.push({
						game,
						success: false,
						message: "An unknown error occurred",
						...rewardPreview,
					});
				}
			}
		}
	}

	return results;
}

export async function checkinAll(
	accountsArray: TokenInfo[],
): Promise<AccountCheckInResult[]> {
	const allResults: AccountCheckInResult[] = [];

	for (const account of accountsArray) {
		const results = await performCheckin(account);
		allResults.push({
			accountName: account.data.accountName,
			email: account.data.email,
			results,
		});
	}

	return allResults;
}

export interface DailyReward {
	name: string;
	count: number;
	icon?: string;
}

interface DailyRewardPreview {
	reward?: DailyReward;
	totalSignDays?: number;
}

export interface CheckInResult {
	game: string;
	success: boolean;
	message: string;
	reward?: DailyReward;
	totalSignDays?: number;
}

export interface AccountCheckInResult {
	accountName: string;
	email: string;
	results: CheckInResult[];
}

interface RouteType {
	url: string;
	infoUrl: string;
	homeUrl: string;
	gameName: string;
	actId: string;
}
