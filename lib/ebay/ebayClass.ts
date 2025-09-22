import crypto from "node:crypto";
import EbayAuthToken from "ebay-oauth-nodejs-client";
import { SCOPES } from "../definitions";

export class Ebay {
  private readonly baseUrl = "https://api.ebay.com";
  private readonly financeBaseUrl = "https://apiz.ebay.com";
  private readonly analyticsBaseUrl = "https://api.ebay.com/sell/analytics";
  private readonly commerceBaseUrl = "https://api.ebay.com/commerce";
  private readonly apiVersionV1 = "v1";
  private readonly apiVersionV2 = "v2";
  private readonly headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  private async request<T>(
    baseUrlName: string,
    path: string,
    method = "GET",
    body?: Record<string, any>
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
      default:
        baseUrl = this.baseUrl;
        break;
    }
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      body: JSON.stringify(body),
      headers: this.headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`eBay API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  // ---- Auth (nested) ----
  auth = {
    instance: async (): Promise<EbayAuthToken> =>
      new EbayAuthToken({
        clientId: process?.env?.APP_ID_PROD || "",
        clientSecret: process?.env?.CERT_ID_PROD || "",
        redirectUri: process?.env?.REDIRECT_URI_PROD || "",
        scope: SCOPES,
        baseUrl: this.baseUrl,
      }),

    generateClientCredentialToken: async () => {
      const ebay = await this.auth.instance();
      return ebay.getApplicationToken("PRODUCTION");
    },

    generateUserAuthUrl: async () => {
      const state = crypto.getRandomValues(new Uint8Array(16)).toString();
      const ebay = await this.auth.instance();
      const url = ebay.generateUserAuthorizationUrl(
        "PRODUCTION",
        SCOPES.join(" "),
        { state, prompt: "consent" }
      );
      return url?.toString();
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
    taxamony: {
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
