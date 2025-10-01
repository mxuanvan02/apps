// pages/extensions/search.tsx
import { withAppBridge } from "@saleor/app-sdk/app-bridge/with-app-bridge";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch, SearchBox, Hits, Pagination } from "react-instantsearch-hooks-web";
import React from "react";

function HitItem({ hit }: any) {
  return <div style={{ padding: 8, borderBottom: "1px solid #eee" }}>{hit.name}</div>;
}

function SearchPage() {
  const [cfg, setCfg] = React.useState<any>(null);
  React.useEffect(() => { fetch("/api/algolia/secured-key").then(r=>r.json()).then(setCfg); }, []);
  if (!cfg) return null;
  const searchClient = algoliasearch(cfg.appId, cfg.apiKey);
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
