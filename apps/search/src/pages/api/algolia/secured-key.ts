import algoliasearch from "algoliasearch";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  const {
    ALGOLIA_APP_ID,
    ALGOLIA_SEARCH_ONLY_KEY,
    ALGOLIA_INDEX_PREFIX,
    CHANNEL_SLUG,
    CURRENCY,
  } = process.env;

  if (
    !ALGOLIA_APP_ID ||
    !ALGOLIA_SEARCH_ONLY_KEY ||
    !ALGOLIA_INDEX_PREFIX ||
    !CHANNEL_SLUG ||
    !CURRENCY
  ) {
    console.error("Missing env var(s)", {
      ALGOLIA_APP_ID,
      ALGOLIA_SEARCH_ONLY_KEY,
      ALGOLIA_INDEX_PREFIX,
      CHANNEL_SLUG,
      CURRENCY,
    });
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const indexName = `${ALGOLIA_INDEX_PREFIX}.${CHANNEL_SLUG}.${CURRENCY}.products`;

  try {
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_ONLY_KEY);
    const securedKey = client.generateSecuredApiKey(ALGOLIA_SEARCH_ONLY_KEY, {
      restrictIndices: indexName,  // thử string thay vì mảng nếu client yêu cầu
      validUntil: Math.floor(Date.now() / 1000) + 3600,
    });

    return res.status(200).json({ appId: ALGOLIA_APP_ID, apiKey: securedKey, indexName });
  } catch (err) {
    console.error("Error generating securedKey:", err);
    return res.status(500).json({ error: "Internal error generating key" });
  }
}
