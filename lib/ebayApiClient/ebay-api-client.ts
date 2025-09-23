/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
/** biome-ignore-all lint/nursery/useMaxParams: <explanation> */
import { NextResponse } from "next/server";
import { type EbayTokenResponse, SCOPES } from "../definitions";

type BaseUrlName = "default" | "finance" | "commerce" | "analytics" | "oauth";

export class EbayService {
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
    Accept: "application/json",
  };

  accessToken: string | null = null;
  refreshToken: string | null = null;

  private getBaseUrl = (name: BaseUrlName) => {
    switch (name) {
      case "finance":
        return this.financeBaseUrl;
      case "commerce":
        return this.commerceBaseUrl;
      case "analytics":
        return this.analyticsBaseUrl;
      case "oauth":
        return this.identityBaseUrl;
      default:
        return this.baseUrl;
    }
  };

  async request<T>(
    baseUrlName: BaseUrlName,
    path = "",
    method = "GET",
    headers: Record<string, any> = {},
    body?: Record<string, any> | string | null
  ): Promise<T> {
    const baseUrl = this.getBaseUrl(baseUrlName);
    const url = path ? `${baseUrl}${path}` : baseUrl;

    const mergedHeaders: Record<string, string> = {
      ...this.headers,
      ...(headers as Record<string, string>),
    };

    if (
      !mergedHeaders.Authorization &&
      baseUrlName !== "oauth" &&
      this.accessToken
    ) {
      mergedHeaders.Authorization = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(url, {
      method,
      body: body
        ? typeof body === "string"
          ? body
          : JSON.stringify(body)
        : null,
      headers: mergedHeaders,
      cache: "no-store",
    });

    // Let the caller decide how to handle non-2xx
    const text = await res.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      // @ts-expect-error: return text if not JSON
      return text as T;
    }
  }

  auth = {
    generateClientCredentialToken: async () => {
      const form = new URLSearchParams({
        grant_type: "client_credentials",
        scope: this.scope,
      });

      const userAccessToken = await this.request<{
        access_token: string;
        expires_in: number;
        token_type: string;
        refresh_token: string;
        refresh_token_expires_in: string;
      }>(
        "oauth",
        "",
        "POST",
        {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
        },
        form.toString()
      );

      return userAccessToken;
    },

    generateUserAuthUrl: () => {
      const query = new URLSearchParams({
        client_id: this.clientId,
        response_type: "code",
        redirect_uri: this.redirectUri,
        scope: this.scope,
        prompt: "login",
        locale: "EBAY_US",
      });
      return `https://auth.ebay.com/oauth2/authorize?${query.toString()}`;
    },

    getUserAccessToken: async (code: string) => {
      let data: EbayTokenResponse;

      const form = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.redirectUri,
      });

      try {
        const response = await this.request<EbayTokenResponse>(
          "oauth",
          "",
          "POST",
          {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
          },
          form.toString()
        );

        data = response;
      } catch (error) {
        throw new Error(`Failed to get user access token: ${error}`);
      }

      this.accessToken = data.access_token || null;
      this.refreshToken = data.refresh_token || null;

      return data;
    },

    updateUserAccessToken: async (refreshToken: string) => {
      const form = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        scope: this.scope
      });

      const updatedUserAccessPayload = await this.request<EbayTokenResponse>(
        "oauth",
        "",
        "POST",
        {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
        },
        form.toString()
      );

      return updatedUserAccessPayload;
    },
  };

  endpoints = {
    translation: {
      translate: async () => {
        return this.request(
          "default",
          "/commerce/translation/v1_beta/translate"
        );
      },
    },

    identity: {
      getUser: async () => {
        return this.request("commerce", "/commerce/identity/v1/user/");
      },
    },

    taxonomy: {
      getCategoryTree: async () => {
        return this.request("commerce", "/commerce/taxonomy/v1/category_tree/");
      },
      getCategorySuggestion: async (q: string) => {
        return this.request(
          "commerce",
          `/commerce/taxonomy/v1/category_tree/0/get_category_suggestions?q=${encodeURIComponent(q)}`
        );
      },
      getCategorySubTree: async (categoryId: string) => {
        return this.request(
          "commerce",
          `/commerce/taxonomy/v1/category_tree/15/get_category_subtree?category_id=${encodeURIComponent(
            categoryId
          )}`
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
      searchItems: async (query: string, limit: number) =>
        this.request(
          "default",
          `/buy/browse/${this.apiVersionV1}/item_summary/search?q=${encodeURIComponent(query)}&limit=${limit}`
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
            {},
            bodyRequest
          );
        },

        bulkGetInventoryItems: async (bodyRequest: {
          requests: { sku: string }[];
        }) => {
          return this.request(
            "default",
            `/sell/inventory/${this.apiVersionV1}/bulk_get_inventory_item`,
            "POST",
            {},
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
          return this.request(
            "default",
            `/sell/inventory/${this.apiVersionV1}/inventory_item?limit=${limit}&offset=${offset}`
          );
        },

        deleteInventoryItems: async (sku: string) => {
          return this.request(
            "default",
            `/sell/inventory/${this.apiVersionV1}/inventory_item/${encodeURIComponent(sku)}`,
            "DELETE"
          );
        },
      },
    },

    metaData: {
      getSalesTax: async (countryCode: string, taxJurisdictionId: string) =>
        this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/sales_tax/${encodeURIComponent(
            countryCode
          )}/${encodeURIComponent(taxJurisdictionId)}`
        ),
    },

    analytics: {
      getCustomerServiceMetric: async (ebayMarketPlaceId: string) => {
        return this.request(
          "analytics",
          `/sell/analytics/${this.apiVersionV1}/customer_service_metric/CURRENT?evaluation_marketplace_id=${encodeURIComponent(
            ebayMarketPlaceId
          )}`
        );
      },

      getTrafficReport: async (
        marketplaceIds: string,
        dateRange: string,
        dimension: string,
        metrics: string
      ) => {
        return this.request(
          "analytics",
          `/sell/analytics/${this.apiVersionV1}/traffic_report?filter=marketplace_ids:${encodeURIComponent(
            marketplaceIds
          )},date_range:${encodeURIComponent(dateRange)}&dimension=${encodeURIComponent(
            dimension
          )}&metric=${encodeURIComponent(metrics)}`
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
      getFulfillmentPolicies: async (marketplaceId = "EBAY_US") =>
        this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/fulfillment_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`
        ),

      getSubscription: async () =>
        this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/subscription`
        ),

      getPaymentPolicies: async (marketplaceId = "EBAY_US") =>
        this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/payment_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`
        ),

      getReturnPolicies: async (marketplaceId = "EBAY_US") =>
        this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/return_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`
        ),

      getStore: async () =>
        this.request("default", `/sell/account/${this.apiVersionV1}/store`),

      getStoreCategories: async () =>
        this.request(
          "default",
          `/sell/account/${this.apiVersionV1}/store/categories`
        ),
    },
  };
}
