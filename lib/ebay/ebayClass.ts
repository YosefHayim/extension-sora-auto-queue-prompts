import EbayAuthToken from "ebay-oauth-nodejs-client";
import { SCOPES } from "../definitions";

export class Ebay {
  private readonly baseUrl = "https://api.ebay.com";
  private readonly apiVersion = "v1";
  private readonly headers = {
    "Content-Type": "application/json",
  };

  async ebayAuthTokenInstance() {
    const ebayAuthToken = new EbayAuthToken({
      clientId: process?.env?.APP_ID_PROD || "",
      clientSecret: process?.env?.CERT_ID_PROD || "",
      redirectUri: encodeURIComponent(process?.env?.REDIRECT_URI_PROD || ""),
      scope: SCOPES,
      baseUrl: "https://api.ebay.com",
    });
    return ebayAuthToken;
  }

  async generateClientCredentialToken() {
    const getAppToken = (
      await this.ebayAuthTokenInstance()
    ).getApplicationToken("PRODUCTION");
    return getAppToken;
  }

  async generateUserAuthUrl() {
    const state = crypto.getRandomValues(new Uint8Array(16)).toString();

    const ebayAuthToken = await this.ebayAuthTokenInstance();
    const userAuthUrl = ebayAuthToken.generateUserAuthorizationUrl(
      "PRODUCTION",
      SCOPES.join(" "),
      { state, prompt: "consent" }
    );
    return userAuthUrl;
  }

  async getUserAccessToken(code: string) {
    const accessToken = (
      await this.ebayAuthTokenInstance()
    ).exchangeCodeForAccessToken("PRODUCTION", code);
    return accessToken;
  }

  async updateUserAccessToken() {
    const updateAccessToken = (
      await this.ebayAuthTokenInstance()
    ).getAccessToken("PRODUCTION");
    return updateAccessToken;
  }

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

  async searchItemsOnEbay(query: string, limit: number) {
    return this.request(
      `/buy/browse/v1/item_summary/search?q=${query}&limit=${limit}`
    );
  }

  /**
   * Retrieves fulfillment policies.
   */
  async getFulfillmentPolicies(marketplaceId = "EBAY_US") {
    return this.request(
      `/sell/account/${this.apiVersion}/fulfillment_policy?marketplace_id=${marketplaceId}`
    );
  }

  /**
   * Retrieves seller subscription info.
   */
  async getSubscription() {
    return this.request(`/sell/account/${this.apiVersion}/subscription`);
  }

  /**
   * Retrieves payment policies.
   */
  async getPaymentPolicies(marketplaceId = "EBAY_US") {
    return this.request(
      `/sell/account/${this.apiVersion}/payment_policy?marketplace_id=${marketplaceId}`
    );
  }

  /**
   * Retrieves return policies.
   */
  async getReturnPolicies(marketplaceId = "EBAY_US") {
    return this.request(
      `/sell/account/${this.apiVersion}/return_policy?marketplace_id=${marketplaceId}`
    );
  }

  /**
   * Retrieves store subscription.
   */
  async getStore() {
    return this.request(`/sell/account/${this.apiVersion}/store`);
  }

  /**
   * Retrieves get store categories.
   */
  async getStoreCategories() {
    return this.request(`/sell/account/${this.apiVersion}/store/categories`);
  }
}
