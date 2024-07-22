import axios from "axios";
import { TokenInfo, getDsHeader } from "./token";
import { ROUTES, HEADERS } from "./data";
import { getGames } from "./utils";

interface CheckInResult {
  game: string;
  success: boolean;
  message: string;
}

interface AccountCheckInResult {
  accountName: string;
  results: CheckInResult[];
}

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

        const response = await axios.post(
          url,
          {
            act_id: actId,
            lang: "en-us",
          },
          { headers }
        );

        if (response.data.retcode === 0) {
          results.push({ game, success: true, message: response.data.message });
        } else {
          results.push({
            game,
            success: false,
            message: response.data.message,
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          results.push({
            game,
            success: false,
            message: error.response?.data?.message || error.message,
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
      results,
    });
  }

  return allResults;
}
