import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import algoliasearch from "algoliasearch/lite";
import React from "react";
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
  /** Product ID in Saleor */
  productId?: string;
  variantId?: string;
  productName?: string;
  name?: string;
  thumbnail?: string;
  inStock?: boolean;
};

const HitItem: React.FC<{ hit: HitType }> = ({ hit }) => {
  // Get instance from hook
  const { appBridge } = useAppBridge();

  const goProduct = () => {
    if (!hit.productId) return;

    appBridge?.dispatch({
      type: "redirect",
      payload: {
        actionId: crypto.randomUUID(),
        to: `/products/${hit.productId}`,
      },
    });

    // Fallback for usage outside Dashboard (no AppBridge)
    if (!appBridge) {
      window.open(`/dashboard/products/${hit.productId}`, "_blank");
    }
  };

  return (
    <div
      onClick={goProduct}
      style={{
        cursor: hit.productId ? "pointer" : "default",
        padding: 12,
        border: "1px solid #eee",
        borderRadius: 10,
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      {/* Note: <img> warning can be addressed by switching to next/image later */}
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
        {hit.variantId && <div style={{ fontSize: 12, opacity: 0.7 }}>{hit.variantId}</div>}
      </div>
    </div>
  );
};

export default function SearchPage(): JSX.Element {
  const [cfg, setCfg] = React.useState<{ appId: string; apiKey: string; indexName: string } | null>(
    null,
  );

  React.useEffect(() => {
    fetch("/api/algolia/secured-key")
      .then((r) => r.json())
      .then(setCfg)
      .catch(() => setCfg(null));
  }, []);

  if (!cfg) {
    return <div style={{ padding: 16 }}>Loading…</div>;
  }

  const searchClient = algoliasearch(cfg.appId, cfg.apiKey);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Algolia Search</h2>

      <InstantSearch searchClient={searchClient} indexName={cfg.indexName}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Sidebar: lọc */}
          <div>
            <SearchBox placeholder="Tìm theo tên sản phẩm, thuộc tính…" />

            <h4 style={{ marginTop: 16 }}>Danh mục</h4>
            <RefinementList attribute="categories.lvl1" />

            <h4 style={{ marginTop: 16 }}>Tình trạng</h4>
            <RefinementList attribute="inStock" />
          </div>

          {/* Kết quả + sắp xếp */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <SortBy
                items={[
                  { label: "Liên quan", value: cfg.indexName },
                  { label: "Giá tăng dần", value: `${cfg.indexName}_price_asc` },
                  { label: "Giá giảm dần", value: `${cfg.indexName}_price_desc` },
                ]}
              />
            </div>

            <Hits<HitType> hitComponent={HitItem} />

            <div style={{ marginTop: 12 }}>
              <Pagination />
            </div>
          </div>
        </div>
      </InstantSearch>
    </div>
  );
}
