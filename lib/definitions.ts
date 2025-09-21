import { defineFunction } from "@aws-amplify/backend";
import { config } from "./config";

export const EbayMarketplaces = {
  AT: {
    id: "EBAY_AT",
    description: "Austria",
  },
  AU: {
    id: "EBAY_AU",
    description: "Australia",
  },
  BE: {
    id: "EBAY_BE",
    description: "Belgium",
  },
  CA: {
    id: "EBAY_CA",
    description: "Canada",
  },
  CH: {
    id: "EBAY_CH",
    description: "Switzerland",
  },
  CN: {
    id: "EBAY_CN",
    description: "Reserved for future use",
  },
  CZ: {
    id: "EBAY_CZ",
    description: "Reserved for future use",
  },
  DE: {
    id: "EBAY_DE",
    description: "Germany",
  },
  DK: {
    id: "EBAY_DK",
    description: "Reserved for future use",
  },
  ES: {
    id: "EBAY_ES",
    description: "Spain",
  },
  FI: {
    id: "EBAY_FI",
    description: "Reserved for future use",
  },
  FR: {
    id: "EBAY_FR",
    description: "France",
  },
  GB: {
    id: "EBAY_GB",
    description: "United Kingdom",
  },
  GR: {
    id: "EBAY_GR",
    description: "Reserved for future use",
  },
  HK: {
    id: "EBAY_HK",
    description: "Hong Kong",
  },
  HU: {
    id: "EBAY_HU",
    description: "Reserved for future use",
  },
  ID: {
    id: "EBAY_ID",
    description: "Reserved for future use",
  },
  IE: {
    id: "EBAY_IE",
    description: "Ireland",
  },
  IL: {
    id: "EBAY_IL",
    description: "Reserved for future use",
  },
  IN: {
    id: "EBAY_IN",
    description: "Reserved for future use",
  },
  IT: {
    id: "EBAY_IT",
    description: "Italy",
  },
  JP: {
    id: "EBAY_JP",
    description: "Reserved for future use",
  },
  MY: {
    id: "EBAY_MY",
    description: "Malaysia",
  },
  NL: {
    id: "EBAY_NL",
    description: "Netherlands",
  },
  US: {
    id: "EBAY_US",
    description: "United States",
  },
} as const;

export const SCOPES = [
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

export const myFn = defineFunction({
  entry: "./lib/definitions.ts",
  environment: {
    APP_ID_PROD: config.appIdProd,
    DEV_ID_PROD: config.devIdProd,
    CERT_ID_PROD: config.certIdProd,
    DOPPLER_CONFIG: config.dopplerConfig,
    DOPPLER_ENVIRONMENT: config.dopplerEnvironment,
    REDIRECT_URI_PROD: config.redirectUriProd,
    DOPPLER_PROJECT: config.dopplerProject,
  },
});
