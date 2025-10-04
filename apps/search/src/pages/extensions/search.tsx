import { actions, AppBridgeProvider, useAppBridge } from "@saleor/app-sdk/app-bridge";
import algoliasearch from "algoliasearch/lite";
import type { Hit as AlgoliaHit } from "instantsearch.js";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import {
  Highlight,
  Hits,
  HitsPerPage,
  InstantSearch,
  Pagination,
  SearchBox,
} from "react-instantsearch-hooks-web";

// ---- Types ----
type ProductAttributes = {
  name?: string;
  slug?: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  currency?: string;
};

type ProductHit = AlgoliaHit<ProductAttributes>;

type SecuredKeyResponse = {
  appId: string;
  apiKey: string;
  indexName: string;
};

// ---- AppBridge Ready Notifier ----
const ReadyNotifier = () => {
  const { appBridge } = useAppBridge();

  useEffect(() => {
    if (appBridge) {
      void appBridge.dispatch(actions.NotifyReady());
    }
  }, [appBridge]);

  return null;
};

// ---- Hit card ----
const HitCard = ({ hit }: { hit: ProductHit }) => {
  return (
    <article className="rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start gap-4">
        {hit.thumbnailUrl ? (
          <img
            src={hit.thumbnailUrl}
            alt={hit.name ?? "product"}
            width={64}
            height={64}
            className="h-16 w-16 rounded-lg object-cover"
          />
        ) : null}

        <div className="min-w-0">
          <h3 className="text-sm font-semibold">
            <Highlight attribute="name" hit={hit} />
          </h3>

          {hit.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-gray-600">
              <Highlight attribute="description" hit={hit} />
            </p>
          ) : null}

          {hit.price != null && hit.currency ? (
            <p className="mt-1 text-xs text-gray-700">
              {hit.price} {hit.currency}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
};

// ---- Search UI ----
const SearchUI = () => {
  const [cfg, setCfg] = useState<SecuredKeyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setError(null);
        const res = await fetch("/api/algolia/secured-key", {
          method: "GET",
          headers: { "content-type": "application/json" },
        });

        if (!res.ok) {
          setError("Không lấy được secured key");

          return;
        }
        const data: SecuredKeyResponse = await res.json();

        if (!cancelled) {
          setCfg(data);
        }
      } catch {
        if (!cancelled) setError("Có lỗi mạng khi gọi secured-key");
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const searchClient = useMemo(() => {
    if (!cfg) return null;

    return algoliasearch(cfg.appId, cfg.apiKey);
  }, [cfg]);

  if (error) {
    return (
      <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!cfg || !searchClient) {
    return <div className="mt-6 text-sm text-gray-600">Đang khởi tạo tìm kiếm…</div>;
  }

  return (
    <InstantSearch searchClient={searchClient} indexName={cfg.indexName}>
      <div className="mx-auto max-w-4xl space-y-4 p-4">
        <SearchBox placeholder="Tìm sản phẩm…" autoFocus />

        <HitsPerPage
          items={[
            { label: "12 / trang", value: 12, default: true },
            { label: "24 / trang", value: 24 },
            { label: "48 / trang", value: 48 },
          ]}
        />

        <Hits<ProductHit> hitComponent={HitCard} />
        <Pagination />
      </div>
    </InstantSearch>
  );
};

// ---- Page wrapper ----
const SearchExtensionPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Search Extension</title>
      </Head>

      <AppBridgeProvider>
        <ReadyNotifier />
        <SearchUI />
      </AppBridgeProvider>
    </>
  );
};

export default SearchExtensionPage;
