export const EBAY_SCOPES = [
  "https://api.ebay.com/oauth/api_scope",
  "https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
  "https://api.ebay.com/oauth/api_scope/sell.marketing",
  "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
  "https://api.ebay.com/oauth/api_scope/sell.inventory",
  "https://api.ebay.com/oauth/api_scope/sell.account.readonly",
  "https://api.ebay.com/oauth/api_scope/sell.account",
  "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
  "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
  "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
  "https://api.ebay.com/oauth/api_scope/sell.finances",
  "https://api.ebay.com/oauth/api_scope/sell.payment.dispute",
  "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
  "https://api.ebay.com/oauth/api_scope/sell.reputation",
  "https://api.ebay.com/oauth/api_scope/sell.reputation.readonly",
  "https://api.ebay.com/oauth/api_scope/commerce.notification.subscription",
  "https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly",
  "https://api.ebay.com/oauth/api_scope/sell.stores",
  "https://api.ebay.com/oauth/api_scope/sell.stores.readonly",
  "https://api.ebay.com/oauth/scope/sell.edelivery",
  "https://api.ebay.com/oauth/api_scope/commerce.vero",
] as const;

export type ClientFeatureFlags = {
  reactFormHooksMode: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all" | undefined
}

export type FeatureFlagsServer = {
  currentEnv: string | undefined;
  authWGoogle: boolean;
  authWEbay: boolean;
};
