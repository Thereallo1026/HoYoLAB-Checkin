import crypto from "node:crypto";

async function getToken(stoken: string, mid: string) {
  const url =
    "https://sg-public-api.hoyoverse.com/account/ma-passport/token/getBySToken";
  const headers = {
    "user-agent": "HoYoLAB/21 CFNetwork/1496.0.7 Darwin/23.5.0",
    "accept-language": "en-us",
    "x-rpc-app_id": "c9oqaq3s3gu8",
    cookie: `stoken=${stoken};mid=${mid}`,
    "Content-Type": "application/json",
  };
  const body = { dst_token_types: [2] };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = (await response.json()) as Data;
    const retcode = json.retcode;
    if (retcode !== 0) {
      throw new Error(json.message);
    }
    const accountName = json.data.user_info.account_name;
    const email = json.data.user_info.email;

    const tokenData = json.data as TokenData;
    const ltuid = tokenData.user_info.aid;
    const ltoken = tokenData.tokens.find((t) => t.token_type === 2)?.token;
    if (!ltoken) {
      throw new Error("Failed to get ltoken");
    }
    return { ltuid, ltoken, data: { accountName, email } }; // return
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get token: ${error.message}`);
    }
    throw new Error("An unknown error occurred");
  }
}

export async function condenseTokens(accountsArray: Account[]) {
  const tokensArray: TokenInfo[] = [];

  for (const account of accountsArray) {
    const { stoken, mid } = account;
    try {
      const token = await getToken(stoken, mid);
      tokensArray.push({
        ltuid: token.ltuid,
        ltoken: token.ltoken,
        data: {
          accountName: token.data.accountName,
          email: token.data.email,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  return tokensArray;
}

// ds header generation
function generateRandomString(myLength: number) {
  const chars = "0123456789";
  const randomArray = Array.from(
    { length: myLength },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );
  const randomString = randomArray.join("");
  return randomString;
}

export function getDsHeader() {
  const r = generateRandomString(6);
  const t = Math.floor(Date.now() / 1000);

  const ossalt = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";
  const hash = crypto.createHash("md5").update(`salt=${ossalt}&t=${t}&r=${r}`);
  const result = `${t},${r},${hash.digest("hex")}`;
  return result;
}

type Data = {
  retcode: number;
  data: unknown;
  message: string;
} & {
  retcode: 0;
  data: Record<string, any>;
};

type TokenData = {
  tokens: {
    token_type: number;
    token: string;
  }[];
  user_info: {
    aid: string;
  };
};

export type TokenInfo = {
  ltuid: string;
  ltoken: string;
  data: { accountName: string; email: string };
};
type Account = { stoken: string; mid: string };
