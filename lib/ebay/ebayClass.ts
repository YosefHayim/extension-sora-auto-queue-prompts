import crypto from "node:crypto";
import EbayAuthToken from "ebay-oauth-nodejs-client";
import { SCOPES } from "../definitions";

export class Ebay {
  private readonly baseUrl = "https://api.ebay.com";
  private readonly apiVersion = "v1";
  private readonly headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // ---- Core HTTP ----
  private async request<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
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
        redirectUri:
          "https://main.d2ei06gwwpqof9.amplifyapp.com/api/ebay/callback",
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

  // ---- Endpoints (nested) ----
  endpoints = {
    // Buy APIs
    buy: {
      searchItems: async (query: string, limit: number) =>
        this.request(
          `/buy/browse/v1/item_summary/search?q=${query}&limit=${limit}`
        ),
    },

    // Sell Account APIs
    sell: {
      account: {
        getFulfillmentPolicies: async (marketplaceId = "EBAY_US") =>
          this.request(
            `/sell/account/${this.apiVersion}/fulfillment_policy?marketplace_id=${marketplaceId}`
          ),

        getSubscription: async () =>
          this.request(`/sell/account/${this.apiVersion}/subscription`),

        getPaymentPolicies: async (marketplaceId = "EBAY_US") =>
          this.request(
            `/sell/account/${this.apiVersion}/payment_policy?marketplace_id=${marketplaceId}`
          ),

        getReturnPolicies: async (marketplaceId = "EBAY_US") =>
          this.request(
            `/sell/account/${this.apiVersion}/return_policy?marketplace_id=${marketplaceId}`
          ),

        getStore: async () =>
          this.request(`/sell/account/${this.apiVersion}/store`),

        getStoreCategories: async () =>
          this.request(`/sell/account/${this.apiVersion}/store/categories`),
      },
    },
  };
}
