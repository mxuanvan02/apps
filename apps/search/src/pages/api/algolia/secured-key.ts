// pages/api/algolia/secured-key.ts
import algoliasearch from "algoliasearch";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = { appId: string; apiKey: string; indexName: string } | { error: string };

export default function handler(_req: NextApiRequest, res: NextApiResponse<Data>) {
  const { ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY, ALGOLIA_INDEX_NAME } = process.env;

  if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_API_KEY || !ALGOLIA_INDEX_NAME) {
    /* eslint-disable-next-line no-console */
    console.error("Missing required env var", {
      ALGOLIA_APP_ID,
      ALGOLIA_SEARCH_API_KEY,
      ALGOLIA_INDEX_NAME,
    });

    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);
    const parentKey = ALGOLIA_SEARCH_API_KEY;

    const securedKey = client.generateSecuredApiKey(parentKey, {
      restrictIndices: ALGOLIA_INDEX_NAME,
      validUntil: Math.floor(Date.now() / 1000) + 3600,
    });

    return res.status(200).json({
      appId: ALGOLIA_APP_ID,
      apiKey: securedKey,
      indexName: ALGOLIA_INDEX_NAME,
    });
  } catch (err) {
    const e = err as Error;

    /* eslint-disable-next-line no-console */
    console.error("Error generating secured key:", e.message);

    return res.status(500).json({ error: "Internal error generating key" });
  }
}
