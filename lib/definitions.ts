export enum EbayMarketplaceId {
  AT = "EBAY_AT",
  AU = "EBAY_AU",
  BE = "EBAY_BE",
  CA = "EBAY_CA",
  CH = "EBAY_CH",
  CN = "EBAY_CN", // Reserved for future use
  CZ = "EBAY_CZ", // Reserved for future use
  DE = "EBAY_DE",
  DK = "EBAY_DK", // Reserved for future use
  ES = "EBAY_ES",
  FI = "EBAY_FI", // Reserved for future use
  FR = "EBAY_FR",
  GB = "EBAY_GB",
  GR = "EBAY_GR", // Reserved for future use
  HK = "EBAY_HK",
  HU = "EBAY_HU", // Reserved for future use
  ID = "EBAY_ID", // Reserved for future use
  IE = "EBAY_IE",
  IL = "EBAY_IL", // Reserved for future use
  IN = "EBAY_IN", // Reserved for future use
  IT = "EBAY_IT",
  JP = "EBAY_JP", // Reserved for future use
  MY = "EBAY_MY",
  NL = "EBAY_NL",
  US = "EBAY_US",
}

export type BaseUrlName = "default" | "finance" | "commerce" | "analytics" | "oauth" | 'development'
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestOptions = {
  productionBaseUrlName: BaseUrlName;
  path?: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: BodyInit | null;
};


export enum ResponseStatus {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  INTERNAL_ERROR = 500,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
}

export type EbayMarketplace = typeof EbayMarketplaceId;

export type EbayTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  token_type: string;
};

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]

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
];
