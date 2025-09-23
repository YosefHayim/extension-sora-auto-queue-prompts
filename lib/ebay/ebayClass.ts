/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
/** biome-ignore-all lint/nursery/useMaxParams: <explanation> */

import { randomBytes } from "node:crypto";
import { SCOPES } from "../definitions";
export class Ebay {
  readonly env = "PRODUCTION";
  readonly clientId = process?.env?.CLIENT_ID_PROD || "";
  readonly clientSecret = process?.env?.CLIENT_SECRET_ID_PROD || "";
  readonly redirectUri = process?.env?.REDIRECT_URI_PROD || "";
  readonly scope = SCOPES.join(" ");

  readonly baseUrl = "https://api.ebay.com";
  readonly financeBaseUrl = "https://apiz.ebay.com";
  readonly analyticsBaseUrl = "https://api.ebay.com/sell/analytics";
  readonly identityBaseUrl = `${this.baseUrl}/identity/v1/oauth2/token`;
  readonly commerceBaseUrl = "https://api.ebay.com/commerce";

  readonly apiVersionV1 = "v1";
  readonly apiVersionV2 = "v2";

  readonly headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  async request<T>(
    baseUrlName: string,
    path?: string | null,
    method = "GET",
    headers: Record<string, any | null> = {},
    body?: Record<string, any | null>
  ): Promise<T> {
    let baseUrl: string;
    switch (baseUrlName) {
      case "finance":
        baseUrl = this.financeBaseUrl;
        break;

      case "commerce":
        baseUrl = this.commerceBaseUrl;
        break;

      case "analytics":
        baseUrl = this.analyticsBaseUrl;
        break;

      case "oauth":
        baseUrl = this.identityBaseUrl;
        break;
      default:
        baseUrl = this.baseUrl;
        break;
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      body: body ? JSON.stringify(body) : null,
      headers: headers ?? this.headers,
      cache: "no-store",
    });

    return (await res.json()) as T;
  }

  auth = {
    generateClientCredentialToken: async () => {
      console.log("to implement");
    },

    generateUserAuthUrl: async () => {
      const query = new URLSearchParams({
        client_id: this.clientId || "",
        locale: "EBAY_US",
        prompt: "login",
        redirect_uri: this.redirectUri || "",
        response_type: "code",
        scope: this.scope,
        state: randomBytes(16).toString("hex"),
      });

      const url = `https://auth.ebay.com/oauth2/authorize?${query.toString()}`;
      return url;
    },

    getUserAccessToken: async (code: string) => {
      console.log("to implement", code);
    },

    updateUserAccessToken: async (refreshToken: string) => {
      console.log("to implement", refreshToken);
    },
  };

  endpoints = {
    translation: {
      translate: async () => {
        this.request("default", "/commerce/translation/v1_beta/translate");
      },
    },

    identity: {
      getUser: async () => {
        this.request("finance", "commerce/identity/v1/identity/user/");
      },
    },

    taxonomy: {
      getCategoryTree: async () => {
        this.request("commerce", "/commerce/taxamony/v1/category_tree/");
      },
      getCategorySuggestion: async (q: string) => {
        this.request(
          "commerce",
          `/commerce/taxamony/v1/category_tree/0/get_category_suggestion?q=${q}`
        );
      },
      getCategorySubTree: async (categoryId: string) => {
        this.request(
          "commerce",
          `/commerce/taxamony/v1/category_tree/15/get_category_subtree?category_id=${categoryId}`
        );
      },
    },

    fulfillment: {
      getOrders: async () => {
        this.request("default", `/sell/fulfillment/${this.apiVersionV1}/order`);
      },
      getOrder: async (orderId: string) => {
        this.request(
          "default",
          `/sell/fulfillment/${this.apiVersionV1}/order/${orderId}`
        );
      },
    },

    buy: {
      searchItems: async (query: string, limit: number) =>
        this.request(
          "default",
          `/ buy / browse / ${this.apiVersionV1} / item_summary / search ? q = ${query} & limit=${limit}`
        ),
    },

    sell: {
      inventory: {
        bulkUpdatePriceQuantity: async (bodyRequest: {
          requests: {
            sku?: string;
            shipToLocationAvailability?: { quantity?: number };
            offers: [
              {
                availableQuantity?: number;
                offerId: string;
                price?: { currency: string; value: string };
              },
            ];
          }[];
        }) => {
          return this.request(
            "default",
            `/sell/inventory/${this.apiVersionV1}/bulk_update_price_quantity`,
            "POST",
            null,
            bodyRequest
          );
        },
      },
      bulkGetInventoryItems: async (bodyRequest: {
        requests: [{ sku: string }];
      }) => {
        this.request(
          "default",
          `/ sell / inventory / ${this.apiVersionV1} /bulk_get_inventory_item`,
          "POST",
          null,
          bodyRequest.requests
        );
      },
      getListingsFee: async () => {
        this.request(
          "default",
          `sell/inventory/${this.apiVersionV1}/offer/get_listing_fees`
        );
      },
      getInventoryItems: async (limit: number, offset: number) => {
        this.request(
          "default",
          `/ sell / inventory / ${this.apiVersionV1} / inventory_item?limit=${limit}offest=${offset}`
        );
      },
      deleteInventoryItems: async (sku: string) => {
        this.request(
          "default",
          `/ sell / inventory / ${this.apiVersionV1} / inventory_item/${sku}`
        );
      },
    },
    metaData: {
      getSalesTax: async (countryCode: string, taxJurisdictionId: string) =>
        this.request(
          "default",
          `/ sell / account / ${this.apiVersionV1} / sales_tax / ${countryCode} / ${taxJurisdictionId}`
        ),
    },

    analytics: {
      getCustomerServiceMetric: async (ebayMarketPlaceId: string) => {
        this.request(
          "analytics",
          ` / sell / analytics / ${this.apiVersionV1} / customer_service_metric / CURRENT ? evaluation_marketplace_id = ${ebayMarketPlaceId}`
        );
      },
      getTrafficReport: async (
        marketplaceIds: string,
        dateRange: string,
        dimension: string,
        metrics: string
      ) => {
        this.request(
          "analytics",
          ` / sell / analytics / ${this.apiVersionV1} / traffic_report ? filter = marketplace_ids : ${marketplaceIds}, date_range: ${dateRange} & dimension=${dimension} & metric=${metrics}`
        );
      },
    },

    finance: {
      getPayoutsSummary: async () => {
        this.request(
          "finance",
          ` / sell / finances / ${this.apiVersionV1} / payout_summary`
        );
      },
      getSellerFundsSummary: async () => {
        this.request(
          "finance",
          `/ sell / finances / ${this.apiVersionV1} / seller_funds_summary`
        );
      },
      getPayouts: async () => {
        this.request(
          "finance",
          `/ sell / finances / ${this.apiVersionV1} / payouts`
        );
      },
      getTransactions: async () => {
        this.request(
          "finance",
          `/ sell / finances / ${this.apiVersionV1} / transaction`
        );
      },
    },

    accountV2: {
      getPayoutSettings: async () => {
        this.request(
          "default",
          `/sell/account/${this.apiVersionV2}/payout_settings`
        );
      },
    },

    accountV1: {
      getFulfillmentPolicies: async (marketplaceId = "EBAY_US") =>
        this.request(
          "default",
          `/ sell / account / ${this.apiVersionV1} / fulfillment_policy ? marketplace_id = ${marketplaceId}`
        ),

      getSubscription: async () =>
        this.request(
          "default",
          `/ sell / account / ${this.apiVersionV1} / subscription`
        ),

      getPaymentPolicies: async (marketplaceId = "EBAY_US") =>
        this.request(
          "default",
          `/ sell / account / ${this.apiVersionV1} / payment_policy ? marketplace_id = ${marketplaceId}`
        ),

      getReturnPolicies: async (marketplaceId = "EBAY_US") =>
        this.request(
          "default",
          `/ sell / account / ${this.apiVersionV1} / return_policy ? marketplace_id = ${marketplaceId}`
        ),

      getStore: async () =>
        this.request(
          "default",
          `/ sell / account / ${this.apiVersionV1} / store`
        ),

      getStoreCategories: async () =>
        this.request(
          "default",
          `/ sell / account / ${this.apiVersionV1} / store / categories`
        ),
    },
  };
}
