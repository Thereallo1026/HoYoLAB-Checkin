import { TokenInfo, getDsHeader } from "./token";
import { HEADERS } from "./constants";

export async function getGames(tokens: TokenInfo): Promise<string[]> {
  const { ltuid, ltoken } = tokens;
  const url = `https://bbs-api-os.hoyolab.com/game_record/card/wapi/getGameRecordCard?uid=${ltuid}`;
  const headers = {
    ...HEADERS,
    ds: getDsHeader(),
    cookie: `ltuid_v2=${ltuid}; ltoken_v2=${ltoken};`,
  };

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (data.retcode !== 0) {
    throw new Error(data.message);
  }

  // extract game names from resp
  const gameNames = data.data.list.map((game: any) => game.game_name);
  return gameNames;
}
