export class Ebay {
  private readonly baseUrl = "https://api.ebay.com";
  private readonly apiVersion = "v1";

  private get headers() {
    return {
      Authorization: `Bearer ${process.env.OAUTH_USER_TOKEN_ME}`,
      "Content-Type": "application/json",
      "Accept-Encoding": "identity",
    };
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
