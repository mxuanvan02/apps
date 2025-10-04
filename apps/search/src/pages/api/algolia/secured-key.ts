import algoliasearch from "algoliasearch";
import type { NextApiRequest, NextApiResponse } from "next";

type SecuredKeyResponse = {
  appId: string;
  apiKey: string;
  indexName: string;
} | {
  error: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<SecuredKeyResponse>) {
  const {
    ALGOLIA_APP_ID,
    ALGOLIA_SEARCH_API_KEY,
    ALGOLIA_INDEX_NAME,
  } = process.env;

  if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_API_KEY || !ALGOLIA_INDEX_NAME) {
    console.error("Missing required env var(s)", {
      ALGOLIA_APP_ID,
      ALGOLIA_SEARCH_API_KEY,
      ALGOLIA_INDEX_NAME,
    });
    return res.status(500).json({ error: "Server misconfiguration: missing env var(s)" });
  }

  const indexName = ALGOLIA_INDEX_NAME;

  try {
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

    // Dùng parentKey = ALGOLIA_SEARCH_API_KEY để tạo secured key
    const parentKey = ALGOLIA_SEARCH_API_KEY;

    const securedKey = client.generateSecuredApiKey(parentKey, {
      restrictIndices: indexName,  // sử dụng string tên index
      validUntil: Math.floor(Date.now() / 1000) + 3600,  // key hợp lệ trong 1 giờ
    });

    return res.status(200).json({
      appId: ALGOLIA_APP_ID,
      apiKey: securedKey,
      indexName,
    });
  } catch (err: any) {
    console.error("Error generating secured key:", err.message || err, err.stack);
    return res.status(500).json({ error: "Internal error generating secured key" });
  }
}
