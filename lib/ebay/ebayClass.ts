class Ebay {
  baseUrl = "https://api.ebay.com";

  headers = {
    Authorization: `Bearer ${process.env.OAUTH_USER_TOKEN_ME}`,
  };

  async getFulfillmentPolicies() {
    try {
      const r = await fetch(`${this.baseUrl}/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_US`)
    }
  }
}
