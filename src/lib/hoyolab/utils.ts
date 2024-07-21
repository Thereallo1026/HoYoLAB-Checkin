import axios from "axios";
import { TokenInfo, getDsHeader } from "./token";
import { HEADERS } from "./data";

export async function getGames(tokens: TokenInfo): Promise<string[]> {
  const { ltuid, ltoken } = tokens;
  const url = `https://bbs-api-os.hoyolab.com/game_record/card/wapi/getGameRecordCard?uid=${ltuid}`;
  const headers = {
    ...HEADERS,
    ds: getDsHeader(),
    cookie: `ltuid_v2=${ltuid}; ltoken_v2=${ltoken};`,
  };

  const resp = await axios.get(url, { headers });
  if (resp.data.retcode !== 0) {
    throw new Error(resp.data.message);
  }

  // extract game names from resp
  const gameNames = resp.data.data.list.map((game: any) => game.game_name);
  return gameNames;
}
