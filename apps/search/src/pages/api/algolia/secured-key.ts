import algoliasearch from "algoliasearch";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    ALGOLIA_APP_ID,
    ALGOLIA_SEARCH_ONLY_KEY,
    ALGOLIA_INDEX_PREFIX,
    CHANNEL_SLUG,
    CURRENCY,
  } = process.env;

  // Kiểm tra biến môi trường
  if (
    !ALGOLIA_APP_ID ||
    !ALGOLIA_SEARCH_ONLY_KEY ||
    !ALGOLIA_INDEX_PREFIX ||
    !CHANNEL_SLUG ||
    !CURRENCY
  ) {
    console.error("Missing env var(s)", {
      ALGOLIA_APP_id: ALGOLIA_APP_ID,
      ALGOLIA_SEARCH_ONLY_KEY,
      ALGOLIA_INDEX_PREFIX,
      CHANNEL_SLUG,
      CURRENCY,
    });
    return res.status(500).json({ error: "Server misconfiguration: missing env var" });
  }

  const indexName = `${ALGOLIA_INDEX_PREFIX}.${CHANNEL_SLUG}.${CURRENCY}.products`;

  try {
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_ONLY_KEY);
    const parentKey = ALGOLIA_SEARCH_ONLY_KEY; // parent must be search-only key, không dùng admin

    // Chú ý: restrictIndices có thể là string (tên index) thay vì mảng nếu client không hỗ trợ mảng
    const securedKey = client.generateSecuredApiKey(parentKey, {
      restrictIndices: indexName,
      validUntil: Math.floor(Date.now() / 1000) + 3600,  // 1 giờ
    });

    return res.status(200).json({
      appId: ALGOLIA_APP_ID,
      apiKey: securedKey,
      indexName,
    });
  } catch (err: any) {
    console.error("Error generating securedKey:", err.message ?? err, err.stack);
    return res.status(500).json({ error: "Internal error generating key" });
  }
}
