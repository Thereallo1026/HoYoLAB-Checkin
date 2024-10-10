import type { TokenInfo } from "./token";
import { getDsHeader } from "./token";
import { ROUTES, HEADERS } from "./constants";
import { getGames } from "./utils";

export async function performCheckin(
  tokens: TokenInfo
): Promise<CheckInResult[]> {
  const { ltuid, ltoken } = tokens;
  const registeredGames = await getGames(tokens);
  const results: CheckInResult[] = [];

  for (const game of registeredGames) {
    if (game in ROUTES) {
      const { url, actId } = ROUTES[game as keyof typeof ROUTES];

      try {
        const headers = {
          ...HEADERS,
          ds: getDsHeader(),
          cookie: `ltmid_v2=${ltuid};ltoken_v2=${ltoken};ltuid_v2=${ltuid};`,
        };

        if (game === "Genshin Impact") {
          headers["x-rpc-signgame"] = "hk4e";
        } else if (game === "Zenless Zone Zero") {
          headers["x-rpc-signgame"] = "zzz";
        }

        const response = await fetch(`${url}?lang=en-us`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            act_id: actId,
            lang: "en-us",
          }),
        });

        const data = await response.json();

        if (data.retcode === 0) {
          results.push({ game, success: true, message: data.message });
        } else {
          results.push({
            game,
            success: false,
            message: data.message,
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          results.push({
            game,
            success: false,
            message: error.message,
          });
        } else {
          results.push({
            game,
            success: false,
            message: "An unknown error occurred",
          });
        }
      }
    }
  }

  return results;
}

export async function checkinAll(
  accountsArray: TokenInfo[]
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