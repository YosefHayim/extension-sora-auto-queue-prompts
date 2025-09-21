// lib/ebay/ebayClass.ts
import { randomBytes } from "node:crypto";
import EbayAuthToken from "ebay-oauth-nodejs-client";
import { SCOPES } from "../definitions";

type Json = Record<string, unknown>;

export class Ebay {
  private readonly baseUrl = "https://api.ebay.com";
  private readonly financeBaseUrl = "https://apiz.ebay.com";
  private readonly analyticsBaseUrl = "https://api.ebay.com";
  private readonly commerceBaseUrl = "https://api.ebay.com";
  private readonly apiVersionV1 = "v1";
  private readonly apiVersionV2 = "v2";
  private readonly headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  private async request<T = Json>(
    base: "default" | "finance" | "analytics" | "commerce",
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: unknown
  ): Promise<T> {
    const baseUrl =
      base === "finance"
        ? this.financeBaseUrl
        : base === "commerce"
          ? this.commerceBaseUrl
          : base === "analytics"
            ? this.analyticsBaseUrl
            : this.baseUrl;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: this.headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`eBay API error ${res.status}: ${text}`);
    }
    // Some endpoints legitimately return 204
    if (res.status === 204) {
      return {} as T;
    }
    return (await res.json()) as T;
  }

  // ---- Auth ----
  auth = {
    instance: async (): Promise<EbayAuthToken> =>
      new EbayAuthToken({
        clientId: process.env.APP_ID_PROD || "",
        clientSecret: process.env.CERT_ID_PROD || "",
        redirectUri: process.env.REDIRECT_URI_PROD || "",
        scope: SCOPES,
        baseUrl: this.baseUrl,
      }),

    generateClientCredentialToken: async () => {
      const ebay = await this.auth.instance();
      return ebay.getApplicationToken("PRODUCTION");
    },

    generateUserAuthUrl: async () => {
      const state = randomBytes(16).toString("hex");
      const ebay = await this.auth.instance();
      return ebay.generateUserAuthorizationUrl("PRODUCTION", SCOPES.join(" "), {
        state,
        prompt: "consent",
      });
    },

    getUserAccessToken: async (code: string) => {
      const ebay = await this.auth.instance();
      return ebay.exchangeCodeForAccessToken("PRODUCTION", code);
    },

    updateUserAccessToken: async (refreshToken: string) => {
      const ebay = await this.auth.instance();
      return ebay.getAccessToken("PRODUCTION", refreshToken, SCOPES);
    },
  };

  // ---- Endpoints ----
  endpoints = {
    translation: {
      translate: async (body: Json) => {
        return this.request(
          "default",
          "/commerce/translation/v1_beta/translate",
          "POST",
          body
        );
      },
    },

    identity: {
      getUser: async () => {
        return this.request("default", "/commerce/identity/v1/identity/user/");
      },
    },

    taxonomy: {
      getCategoryTree: async () => {
        return this.request("default", "/commerce/taxonomy/v1/category_tree/");
      },
      getCategorySuggestion: async (q: string) => {
        const qs = new URLSearchParams({ q }).toString();
        return this.request(
          "default",
          `/commerce/taxonomy/v1/category_tree/0/get_category_suggestion?${qs}`
        );
      },
      getCategorySubTree: async (categoryId: string) => {
        const qs = new URLSearchParams({ category_id: categoryId }).toString();
        return this.request(
          "default",
          `/commerce/taxonomy/v1/category_tree/15/get_category_subtree?${qs}`
        );
      },
    },

    fulfillment: {
      getOrders: async () => {
        return this.request(
          "default",
          `/sell/fulfillment/${this.apiVersionV1}/order`
        );
      },
      getOrder: async (orderId: string) => {
        return this.request(
          "default",
          `/sell/fulfillment/${this.apiVersionV1}/order/${orderId}`
        );
      },
    },

    buy: {
      searchItems: async (query: string, limit: number) => {
        const qs = new URLSearchParams({
          q: query,
          limit: String(limit),
        }).toString();
        return this.request(
          "default",
          `/buy/browse/${this.apiVersionV1}/item_summary/search?${qs}`
        );
      },
    },

    sell: {
      inventory: {
        bulkUpdatePriceQuantity: async (bodyRequest: {
          requests: Array<{
            sku?: string;
            shipToLocationAvailability?: { quantity?: number };
            offers: Array<{
              availableQuantity?: number;
              offerId: string;
              price?: { currency: string; value: string };
            }>;
          }>;
        }) => {
          return this.request(
            "default",
            `/sell/inventory/${this.apiVersionV1}/bulk_update_price_quantity`,
            "POST",
            bodyRequest
          );
        },

        bulkGetInventoryItems: async (bodyRequest: {
          requests: Array<{ sku: string }>;
        }) => {
          return this.request(
            "default",
            `/sell/inventory/${this.apiVersionV1}/bulk_get_inventory_item`,
            "POST",
            bodyRequest
          );
        },

        getListingsFee: async () => {
          return this.request(
            "default",
            `/sell/inventory/${this.apiVersionV1}/offer/get_listing_fees`
          );
        },

        getInventoryItems: async (limit: number, offset: number) => {
          const qs = new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
          }).toString();
          return this.request(
            "default",
            `/sell/inventory/${this.apiVersionV1}/inventory_item?${qs}`
          );
        },

        deleteInventoryItem: async (sku: string) => {
          return this.request(
            "default",
            `/sell/inventory/${this.apiVersionV1}/inventory_item/${encodeURIComponent(sku)}`,
            "DELETE"
          );
        },
      },
    },

    metaData: {
      getSalesTax: async (countryCode: string, taxJurisdictionId: string) => {
        return this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/sales_tax/${countryCode}/${taxJurisdictionId}`
        );
      },
    },

    analytics: {
      getCustomerServiceMetric: async (ebayMarketPlaceId: string) => {
        const qs = new URLSearchParams({
          evaluation_marketplace_id: ebayMarketPlaceId,
        }).toString();
        return this.request(
          "analytics",
          `/sell/analytics/${this.apiVersionV1}/customer_service_metric/CURRENT?${qs}`
        );
      },

      getTrafficReport: async (
        marketplaceIds: string,
        dateRange: string,
        dimension: string,
        metrics: string
      ) => {
        // eBay expects a CSV-style filter string
        const qs = new URLSearchParams({
          filter: `marketplace_ids:${marketplaceIds},date_range:${dateRange}`,
          dimension,
          metric: metrics,
        }).toString();
        return this.request(
          "analytics",
          `/sell/analytics/${this.apiVersionV1}/traffic_report?${qs}`
        );
      },
    },

    finance: {
      getPayoutsSummary: async () => {
        return this.request(
          "finance",
          `/sell/finances/${this.apiVersionV1}/payout_summary`
        );
      },
      getSellerFundsSummary: async () => {
        return this.request(
          "finance",
          `/sell/finances/${this.apiVersionV1}/seller_funds_summary`
        );
      },
      getPayouts: async () => {
        return this.request(
          "finance",
          `/sell/finances/${this.apiVersionV1}/payouts`
        );
      },
      getTransactions: async () => {
        return this.request(
          "finance",
          `/sell/finances/${this.apiVersionV1}/transaction`
        );
      },
    },

    accountV2: {
      getPayoutSettings: async () => {
        return this.request(
          "default",
          `/sell/account/${this.apiVersionV2}/payout_settings`
        );
      },
    },

    accountV1: {
      getFulfillmentPolicies: async (marketplaceId = "EBAY_US") => {
        const qs = new URLSearchParams({
          marketplace_id: marketplaceId,
        }).toString();
        return this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/fulfillment_policy?${qs}`
        );
      },

      getSubscription: async () => {
        return this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/subscription`
        );
      },

      getPaymentPolicies: async (marketplaceId = "EBAY_US") => {
        const qs = new URLSearchParams({
          marketplace_id: marketplaceId,
        }).toString();
        return this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/payment_policy?${qs}`
        );
      },

      getReturnPolicies: async (marketplaceId = "EBAY_US") => {
        const qs = new URLSearchParams({
          marketplace_id: marketplaceId,
        }).toString();
        return this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/return_policy?${qs}`
        );
      },

      getStore: async () => {
        return this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/store`
        );
      },

      getStoreCategories: async () => {
        return this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/store/categories`
        );
      },
    },
  };
}
