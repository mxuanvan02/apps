// src/pages/extensions/search.tsx
import { withAppBridge } from "@saleor/app-sdk/app-bridge/with-app-bridge";
import algoliasearch from "algoliasearch/lite";
import React from "react";
import { Hits, InstantSearch, Pagination, SearchBox } from "react-instantsearch-hooks-web";

type SecuredKeyResponse = {
  appId: string;
  apiKey: string;
  indexName: string;
};

type ProductHit = {
  name?: string;
};

function HitItem({ hit }: { hit: ProductHit }) {
  return (
    <div style={{ padding: 8, borderBottom: "1px solid #eee" }}>
      {hit.name ?? "(no name)"}
    </div>
  );
}

function SearchPage() {
  const [cfg, setCfg] = React.useState<SecuredKeyResponse | null>(null);

  React.useEffect(() => {
    fetch("/api/algolia/secured-key")
      .then((r) => r.json())
      .then((data: SecuredKeyResponse) => setCfg(data))
      .catch(() => setCfg(null));
  }, []);

  // (giữ dòng trống theo rule padding-line-between-statements)
  if (!cfg) {
    return null;
  }

  const searchClient = algoliasearch(cfg.appId, cfg.apiKey);

  // (giữ dòng trống theo rule padding-line-between-statements)
  return (
    <div style={{ padding: 16 }}>
      <h2>Search (Algolia)</h2>
      <InstantSearch searchClient={searchClient} indexName={cfg.indexName}>
        <SearchBox placeholder="Nhập từ khóa..." />
        <Hits hitComponent={HitItem} />
        <Pagination />
      </InstantSearch>
    </div>
  );
}

export default withAppBridge(SearchPage);
