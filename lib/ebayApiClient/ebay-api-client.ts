import { type EbayTokenResponse, SCOPES } from "../definitions";

type BaseUrlName = "default" | "finance" | "commerce" | "analytics" | "oauth";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type RequestOptions = {
  baseUrlName: BaseUrlName;
  path?: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: BodyInit | null;
};

export class EbayService {
  readonly baseUrl = "https://api.ebay.com";
  readonly financeBaseUrl = "https://apiz.ebay.com";
  readonly identityBaseUrl = `${this.baseUrl}/identity/v1/oauth2/token`;

  readonly apiVersionV1 = "v1";
  readonly apiVersionV2 = "v2";

  private getBaseUrl(name: BaseUrlName): string {
    switch (name) {
      case "finance":
        return this.financeBaseUrl;
      case "oauth":
        return this.identityBaseUrl;
      case "commerce":
      case "analytics":
      case "default":
      default:
        return this.baseUrl;
    }
  }

  private form(grantType: "authorizationCode" | "refreshToken") {
    if (grantType === "authorizationCode" && this.code) {
      return new URLSearchParams({
        grant_type: "authorization_code",
        code: this.code,
        scope: this.scope,
        redirect_uri: this.redirectUri,
      });
    }
    if (grantType === "refreshToken" && this.refreshToken) {
      return new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        scope: this.scope,
        redirect_uri: this.redirectUri,
      });
    }
    return new URLSearchParams();
  }

  authorizeHeaders(type: "json" | "form") {
    const contentType = type === "json" ? "application/json" : "application/x-www-form-urlencoded";

    return {
      "Content-Type": contentType,
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
    };
  }

  env = "PRODUCTION";
  clientId = process?.env?.CLIENT_ID_PROD || "";
  clientSecret = process?.env?.CLIENT_SECRET_ID_PROD || "";
  redirectUri = process?.env?.REDIRECT_URI_PROD || "";
  scope = SCOPES.join(" ");

  accessToken: string | null = null;
  refreshToken: string | null = null;
  code: string | null = null;
  expiresIn: number | null = null;
  refreshTokenExpiresIn: number | null = null;
  tokenType: string | null = null;

  formatExpiredDate(seconds: number) {
    const expireTime = Date.now() + seconds * 1000;
    let diff = expireTime - Date.now();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff %= 1000 * 60 * 60 * 24;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff %= 1000 * 60 * 60;

    const minutes = Math.floor(diff / (1000 * 60));
    diff %= 1000 * 60;

    const secs = Math.floor(diff / 1000);

    return { days, hours, minutes, seconds: secs };
  }

  async request<T>({ baseUrlName, path, method = "GET", headers = this.authorizeHeaders("json"), body }: RequestOptions): Promise<T> {
    const base = this.getBaseUrl(baseUrlName);
    const url = path ? `${base}${path}` : base;

    const res = await fetch(url, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    return res.json();
  }

  auth = {
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

    getUserAccessTokenPayload: async () => {
      const data = await this.request<EbayTokenResponse>({
        baseUrlName: "oauth",
        method: "POST",
        headers: this.authorizeHeaders("form"),
        body: this.form("authorizationCode"),
      });

      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.expiresIn = data.expires_in;
      this.refreshTokenExpiresIn = data.refresh_token_expires_in;
      this.tokenType = data.token_type;

      const accessTokenExpiresWithin = this.formatExpiredDate(data.expires_in);
      const refreshTokenExpiresWithin = this.formatExpiredDate(data.refresh_token_expires_in);

      return { data, refreshTokenExpiresWithin, accessTokenExpiresWithin };
    },

    updateUserAccessToken: async () => {
      return this.request<EbayTokenResponse>({
        baseUrlName: "oauth",
        method: "POST",
        headers: this.authorizeHeaders("form"),
        body: this.form("refreshToken"),
      });
    },
  };

  endpoints = {
    translation: {
      translate: async () =>
        this.request({
          baseUrlName: "default",
          path: "/commerce/translation/v1_beta/translate",
        }),
    },

    identity: {
      getUser: async () =>
        this.request({
          baseUrlName: "commerce",
          path: "/commerce/identity/v1/user/",
        }),
    },

    taxonomy: {
      getCategoryTree: async () =>
        this.request({
          baseUrlName: "commerce",
          path: "/commerce/taxonomy/v1/category_tree/",
        }),

      getCategorySuggestion: async (q: string) =>
        this.request({
          baseUrlName: "commerce",
          path: `/commerce/taxonomy/v1/category_tree/0/get_category_suggestions?q=${encodeURIComponent(q)}`,
        }),

      getCategorySubTree: async (categoryId: string) =>
        this.request({
          baseUrlName: "commerce",
          path: `/commerce/taxonomy/v1/category_tree/15/get_category_subtree?category_id=${encodeURIComponent(categoryId)}`,
        }),
    },

    fulfillment: {
      getOrders: async () =>
        this.request({
          baseUrlName: "default",
          path: `/sell/fulfillment/${this.apiVersionV1}/order`,
        }),

      getOrder: async (orderId: string) =>
        this.request({
          baseUrlName: "default",
          path: `/sell/fulfillment/${this.apiVersionV1}/order/${orderId}`,
        }),
    },

    buy: {
      searchItems: async (query: string, limit: number) =>
        this.request({
          baseUrlName: "default",
          path: `/buy/browse/${this.apiVersionV1}/item_summary/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        }),
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
        }) =>
          this.request({
            baseUrlName: "default",
            path: `/sell/inventory/${this.apiVersionV1}/bulk_update_price_quantity`,
            method: "POST",
            body: bodyRequest,
          }),

        bulkGetInventoryItems: async (bodyRequest: { requests: { sku: string }[] }) =>
          this.request({
            baseUrlName: "default",
            path: `/sell/inventory/${this.apiVersionV1}/bulk_get_inventory_item`,
            method: "POST",
            body: bodyRequest,
          }),

        getListingsFee: async () =>
          this.request({
            baseUrlName: "default",
            path: `/sell/inventory/${this.apiVersionV1}/offer/get_listing_fees`,
          }),

        getInventoryItems: async (limit: number, offset: number) =>
          this.request({
            baseUrlName: "default",
            path: `/sell/inventory/${this.apiVersionV1}/inventory_item?limit=${limit}&offset=${offset}`,
          }),

        deleteInventoryItems: async (sku: string) =>
          this.request({
            baseUrlName: "default",
            path: `/sell/inventory/${this.apiVersionV1}/inventory_item/${encodeURIComponent(sku)}`,
            method: "DELETE",
          }),
      },
    },

    metaData: {
      getSalesTax: async (countryCode: string, taxJurisdictionId: string) =>
        this.request({
          baseUrlName: "default",
          path: `/sell/account/${this.apiVersionV1}/sales_tax/${encodeURIComponent(countryCode)}/${encodeURIComponent(taxJurisdictionId)}`,
        }),
    },

    analytics: {
      getCustomerServiceMetric: async (ebayMarketPlaceId: string) =>
        this.request({
          baseUrlName: "analytics",
          path: `/sell/analytics/${this.apiVersionV1}/customer_service_metric/CURRENT?evaluation_marketplace_id=${encodeURIComponent(ebayMarketPlaceId)}`,
        }),

      getTrafficReport: async (marketplaceIds: string, dateRange: string, dimension: string, metrics: string) =>
        this.request({
          baseUrlName: "analytics",
          path: `/sell/analytics/${this.apiVersionV1}/traffic_report?filter=marketplace_ids:${encodeURIComponent(
            marketplaceIds
          )},date_range:${encodeURIComponent(dateRange)}&dimension=${encodeURIComponent(dimension)}&metric=${encodeURIComponent(metrics)}`,
        }),
    },

    finance: {
      getPayoutsSummary: async () =>
        this.request({
          baseUrlName: "finance",
          path: `/sell/finances/${this.apiVersionV1}/payout_summary`,
        }),

      getSellerFundsSummary: async () =>
        this.request({
          baseUrlName: "finance",
          path: `/sell/finances/${this.apiVersionV1}/seller_funds_summary`,
        }),

      getPayouts: async () =>
        this.request({
          baseUrlName: "finance",
          path: `/sell/finances/${this.apiVersionV1}/payouts`,
        }),

      getTransactions: async () =>
        this.request({
          baseUrlName: "finance",
          path: `/sell/finances/${this.apiVersionV1}/transaction`,
        }),
    },

    accountV2: {
      getPayoutSettings: async () =>
        this.request({
          baseUrlName: "default",
          path: `/sell/account/${this.apiVersionV2}/payout_settings`,
        }),
    },

    accountV1: {
      getFulfillmentPolicies: async (marketplaceId = "EBAY_US") =>
        this.request({
          baseUrlName: "default",
          path: `/sell/account/${this.apiVersionV1}/fulfillment_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`,
        }),

      getSubscription: async () =>
        this.request({
          baseUrlName: "default",
          path: `/sell/account/${this.apiVersionV1}/subscription`,
        }),

      getPaymentPolicies: async (marketplaceId = "EBAY_US") =>
        this.request({
          baseUrlName: "default",
          path: `/sell/account/${this.apiVersionV1}/payment_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`,
        }),

      getReturnPolicies: async (marketplaceId = "EBAY_US") =>
        this.request({
          baseUrlName: "default",
          path: `/sell/account/${this.apiVersionV1}/return_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`,
        }),

      getStore: async () =>
        this.request({
          baseUrlName: "default",
          path: `/sell/account/${this.apiVersionV1}/store`,
        }),

      getStoreCategories: async () =>
        this.request({
          baseUrlName: "default",
          path: `/sell/account/${this.apiVersionV1}/store/categories`,
        }),
    },
  };
}
