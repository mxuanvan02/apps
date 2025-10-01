/* eslint-disable simple-import-sort/imports, padding-line-between-statements, @typescript-eslint/no-explicit-any */

import React from "react";
import algoliasearch from "algoliasearch/lite";
import { withAppBridge } from "@saleor/app-sdk/app-bridge/with-app-bridge";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import {
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  SortBy,
} from "react-instantsearch-hooks-web";

type HitType = {
  objectID: string;
  productId?: string;
  variantId?: string;
  productName?: string;
  name?: string;
  thumbnail?: string;
  inStock?: boolean;
};

function HitItem({ hit }: { hit: HitType }) {
  const appBridge = useAppBridge();

  const goProduct = () => {
    if (hit.productId) {
      appBridge?.dispatch("redirect", { to: `/products/${hit.productId}` });
    }
  };

  return (
    <div
      onClick={goProduct}
      style={{
        cursor: "pointer",
        padding: 12,
        border: "1px solid #eee",
        borderRadius: 10,
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      {/* warning <img> không làm fail build; tối ưu sau bằng next/image */}
      {hit.thumbnail && (
        <img
          src={hit.thumbnail}
          alt=""
          width={48}
          height={48}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      )}
      <div>
        <div style={{ fontWeight: 700 }}>{hit.productName || hit.name}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{hit.variantId}</div>
      </div>
    </div>
  );
}

function SearchPageInner() {
  const [cfg, setCfg] = React.useState<{ appId: string; apiKey: string; indexName: string } | null>(null);

  React.useEffect(() => {
    fetch("/api/algolia/secured-key")
      .then((r) => r.json())
      .then(setCfg);
  }, []);

  if (!cfg) return <div style={{ padding: 16 }}>Loading…</div>;

  const searchClient = algoliasearch(cfg.appId, cfg.apiKey);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Algolia Search</h2>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
        <div>
          <SearchBox placeholder="Tìm theo tên sản phẩm, thuộc tính…" />
          <h4 style={{ marginTop: 16 }}>Danh mục</h4>
          <RefinementList attribute="categories.lvl1" />
          <h4 style={{ marginTop: 16 }}>Tình trạng</h4>
          <RefinementList attribute="inStock" />
        </div>

        <div>
          <SortBy
            items={[
              { label: "Liên quan", value: cfg.indexName },
              { label: "Giá tăng dần", value: `${cfg.indexName}_price_asc` },
              { label: "Giá giảm dần", value: `${cfg.indexName}_price_desc` },
            ]}
          />
          <InstantSearch searchClient={searchClient} indexName={cfg.indexName}>
            <Hits hitComponent={HitItem as any} />
            <Pagination />
          </InstantSearch>
        </div>
      </div>
    </div>
  );
}

export default withAppBridge(SearchPageInner);
