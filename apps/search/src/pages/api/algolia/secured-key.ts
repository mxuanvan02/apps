import algoliasearch from "algoliasearch";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  const appId = process.env.ALGOLIA_APP_ID!;
  const searchOnlyKey = process.env.ALGOLIA_SEARCH_ONLY_KEY!;
  const prefix = process.env.ALGOLIA_INDEX_PREFIX!;
  const channel = process.env.CHANNEL_SLUG!;
  const currency = process.env.CURRENCY!;

  const indexName = `${prefix}.${channel}.${currency}.products`;

  const client = algoliasearch(appId, searchOnlyKey);
  const securedKey = client.generateSecuredApiKey(searchOnlyKey, {
    restrictIndices: [indexName],
    validUntil: Math.floor(Date.now() / 1000) + 3600
  });

  res.status(200).json({ appId, apiKey: securedKey, indexName });
}
