import { config } from "@/config";
import { EBAY_SCOPES } from "@/definitions";
import { featureFlags } from "@/lib/feature-flags";
import { formatExpiredDate } from "@/lib/utils";
import type { EbayTokenResponse } from "@/types/ebay/oauth/ebay-response-token";
import type { BaseUrlName, RequestOptions } from "@/types/request";
export class EbayService {
  readonly productionBaseUrl = "https://api.ebay.com";
  readonly developmentBaseUrl = "https://api.sandbox.ebay.com";
  readonly financeBaseUrl = "https://apiz.ebay.com";
  readonly identityBaseUrl = `${this.productionBaseUrl}/identity/v1/oauth2/token`;

  readonly apiVersionV1 = "v1";
  readonly apiVersionV2 = "v2";

  private getBaseUrl(name: BaseUrlName): string {
    switch (name) {
      case "finance":
        return this.financeBaseUrl;
      case "oauth":
        return this.identityBaseUrl;
      case "development":
        return this.developmentBaseUrl;
      case "commerce":
      case "analytics":
      case "default":
      default:
        return this.productionBaseUrl;
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

  env: "production" | "development" = "development";

  clientId = "";

  clientSecret = "";

  redirectUri = "";

  scope = "";

  accessToken: string | null = null;

  refreshToken: string | null = null;

  code: string | null = null;

  expiresIn: number | null = null;

  refreshTokenExpiresIn: number | null = null;

  tokenType: string | null = null;

  async request<T>({ productionBaseUrlName, path, method = "GET", headers = this.authorizeHeaders("json"), body }: RequestOptions): Promise<T> {
    const base = this.getBaseUrl(productionBaseUrlName);
    const url = path ? `${base}${path}` : base;

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
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
        productionBaseUrlName: "oauth",
        method: "POST",
        headers: this.authorizeHeaders("form"),
        body: this.form("authorizationCode"),
      });

      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.expiresIn = data.expires_in;
      this.refreshTokenExpiresIn = data.refresh_token_expires_in;
      this.tokenType = data.token_type;

      const accessTokenExpiresWithin = formatExpiredDate(data.expires_in);
      const refreshTokenExpiresWithin = formatExpiredDate(data.refresh_token_expires_in);

      return { data, refreshTokenExpiresWithin, accessTokenExpiresWithin };
    },

    updateUserAccessToken: async () => {
      return this.request<EbayTokenResponse>({
        productionBaseUrlName: "oauth",
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
          productionBaseUrlName: "default",
          path: "/commerce/translation/v1_beta/translate",
        }),
    },

    identity: {
      getUser: async () =>
        this.request({
          productionBaseUrlName: "commerce",
          path: "/commerce/identity/v1/user/",
        }),
    },

    taxonomy: {
      categoryTree: {
        get: async (categoryTreeId: string) =>
          this.request({
            productionBaseUrlName: "commerce",
            path: `/commerce/taxonomy/v1/category_tree/${encodeURIComponent(categoryTreeId)}`,
            method: "GET",
          }),

        getDefaultTreeId: async (marketplaceId: string) =>
          this.request({
            productionBaseUrlName: "commerce",
            path: `/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=${encodeURIComponent(marketplaceId)}`,
            method: "GET",
          }),

        getSuggestions: async (categoryTreeId: string, q: string) =>
          this.request({
            productionBaseUrlName: "commerce",
            path: `/commerce/taxonomy/v1/category_tree/${encodeURIComponent(categoryTreeId)}/get_category_suggestions?q=${encodeURIComponent(q)}`,
            method: "GET",
          }),

        getSubtree: async (categoryTreeId: string, categoryId: string) =>
          this.request({
            productionBaseUrlName: "commerce",
            path: `/commerce/taxonomy/v1/category_tree/${encodeURIComponent(
              categoryTreeId
            )}/get_category_subtree?category_id=${encodeURIComponent(categoryId)}`,
            method: "GET",
          }),

        getItemAspects: async (categoryTreeId: string, categoryId: string) =>
          this.request({
            productionBaseUrlName: "commerce",
            path: `/commerce/taxonomy/v1/category_tree/${encodeURIComponent(
              categoryTreeId
            )}/get_item_aspects_for_category?category_id=${encodeURIComponent(categoryId)}`,
            method: "GET",
          }),
      },
    },

    fulfillment: {
      orders: {
        list: async (params?: string) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/order${params ? `?${params}` : ""}`,
            method: "GET",
          }),

        get: async (orderId: string) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/order/${orderId}`,
            method: "GET",
          }),
      },

      shippingFulfillments: {
        create: async (orderId: string, body: Record<string, unknown>) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/order/${orderId}/shipping_fulfillment`,
            method: "POST",
            body,
          }),

        list: async (orderId: string) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/order/${orderId}/shipping_fulfillment`,
            method: "GET",
          }),

        get: async (orderId: string, fulfillmentId: string) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/order/${orderId}/shipping_fulfillment/${fulfillmentId}`,
            method: "GET",
          }),
      },

      refunds: {
        issue: async (orderId: string, body: Record<string, unknown>) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/order/${orderId}/issue_refund`,
            method: "POST",
            body,
          }),
      },

      paymentDisputes: {
        list: async (params?: string) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/payment_dispute_summary${params ? `?${params}` : ""}`,
            method: "GET",
          }),

        get: async (paymentDisputeId: string) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/payment_dispute/${paymentDisputeId}`,
            method: "GET",
          }),

        getActivities: async (paymentDisputeId: string) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/payment_dispute/${paymentDisputeId}/activity`,
            method: "GET",
          }),

        fetchEvidenceContent: async (paymentDisputeId: string) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/payment_dispute/${paymentDisputeId}/fetch_evidence_content`,
            method: "GET",
          }),

        contest: async (paymentDisputeId: string, body: Record<string, unknown>) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/payment_dispute/${paymentDisputeId}/contest`,
            method: "POST",
            body,
          }),

        accept: async (paymentDisputeId: string, body: Record<string, unknown>) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/payment_dispute/${paymentDisputeId}/accept`,
            method: "POST",
            body,
          }),

        uploadEvidenceFile: async (paymentDisputeId: string, body: Record<string, unknown>) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/payment_dispute/${paymentDisputeId}/upload_evidence_file`,
            method: "POST",
            body,
          }),

        addEvidence: async (paymentDisputeId: string, body: Record<string, unknown>) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/payment_dispute/${paymentDisputeId}/add_evidence`,
            method: "POST",
            body,
          }),

        updateEvidence: async (paymentDisputeId: string, body: Record<string, unknown>) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/fulfillment/v1/payment_dispute/${paymentDisputeId}/update_evidence`,
            method: "POST",
            body,
          }),
      },
    },

    buy: {
      searchItems: async (query: string, limit: number) =>
        this.request({
          productionBaseUrlName: "default",
          path: `/buy/browse/${this.apiVersionV1}/item_summary/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        }),
    },

    sell: {
      inventory: {
        items: {
          list: async (params?: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/inventory_item${params ? `?${params}` : ""}`,
              method: "GET",
            }),
          get: async (sku: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
              method: "GET",
            }),
          createOrReplace: async (sku: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
              method: "PUT",
              body,
            }),
          delete: async (sku: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
              method: "DELETE",
            }),

          // bulk ops
          bulkUpdatePriceQuantity: async (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/inventory/v1/bulk_update_price_quantity",
              method: "POST",
              body,
            }),
          bulkCreateOrReplace: async (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/inventory/v1/bulk_create_or_replace_inventory_item",
              method: "POST",
              body,
            }),
          bulkGet: async (body: { requests: { sku: string }[] }) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/inventory/v1/bulk_get_inventory_item",
              method: "POST",
              body,
            }),
        },

        productCompatibility: {
          createOrReplace: async (sku: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}/product_compatibility`,
              method: "PUT",
              body,
            }),
          get: async (sku: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}/product_compatibility`,
              method: "GET",
            }),
          delete: async (sku: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}/product_compatibility`,
              method: "DELETE",
            }),
        },

        offers: {
          create: async (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/inventory/v1/offer",
              method: "POST",
              body,
            }),
          update: async (offerId: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/offer/${encodeURIComponent(offerId)}`,
              method: "PUT",
              body,
            }),
          list: async (params?: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/offer${params ? `?${params}` : ""}`,
              method: "GET",
            }),
          get: async (offerId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/offer/${encodeURIComponent(offerId)}`,
              method: "GET",
            }),
          delete: async (offerId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/offer/${encodeURIComponent(offerId)}`,
              method: "DELETE",
            }),
          publish: async (offerId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/offer/${encodeURIComponent(offerId)}/publish`,
              method: "POST",
            }),
          withdraw: async (offerId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/offer/${encodeURIComponent(offerId)}/withdraw`,
              method: "POST",
            }),
          getListingFees: async (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/inventory/v1/offer/get_listing_fees",
              method: "POST",
              body,
            }),
          publishByInventoryItemGroup: async (body: { inventoryItemGroupKey: string; marketplaceId: string }) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/inventory/v1/offer/publish_by_inventory_item_group",
              method: "POST",
              body,
            }),
          withdrawByInventoryItemGroup: async (body: { inventoryItemGroupKey: string }) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/inventory/v1/offer/withdraw_by_inventory_item_group",
              method: "POST",
              body,
            }),

          // bulk offer ops
          bulkCreate: async (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/inventory/v1/bulk_create_offer",
              method: "POST",
              body,
            }),
          bulkPublish: async (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/inventory/v1/bulk_publish_offer",
              method: "POST",
              body,
            }),
        },

        itemGroups: {
          createOrReplace: async (inventoryItemGroupKey: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/inventory_item_group/${encodeURIComponent(inventoryItemGroupKey)}`,
              method: "PUT",
              body,
            }),
          get: async (inventoryItemGroupKey: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/inventory_item_group/${encodeURIComponent(inventoryItemGroupKey)}`,
              method: "GET",
            }),
          delete: async (inventoryItemGroupKey: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/inventory_item_group/${encodeURIComponent(inventoryItemGroupKey)}`,
              method: "DELETE",
            }),
        },

        // Merchant Locations (Inventory API)
        locations: {
          create: async (merchantLocationKey: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/location/${encodeURIComponent(merchantLocationKey)}`,
              method: "POST",
              body,
            }),
          delete: async (merchantLocationKey: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/location/${encodeURIComponent(merchantLocationKey)}`,
              method: "DELETE",
            }),
          disable: async (merchantLocationKey: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/location/${encodeURIComponent(merchantLocationKey)}/disable`,
              method: "POST",
            }),
          enable: async (merchantLocationKey: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/location/${encodeURIComponent(merchantLocationKey)}/enable`,
              method: "POST",
            }),
          get: async (merchantLocationKey: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/location/${encodeURIComponent(merchantLocationKey)}`,
              method: "GET",
            }),
          list: async (params?: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/location${params ? `?${params}` : ""}`,
              method: "GET",
            }),
          updateDetails: async (merchantLocationKey: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/location/${encodeURIComponent(merchantLocationKey)}/update_location_details`,
              method: "POST",
              body,
            }),
        },

        // Listing helpers
        listing: {
          bulkMigrate: async (body: { requests: Array<{ listingId: string }> }) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/inventory/v1/bulk_migrate_listing",
              method: "POST",
              body,
            }),
          createOrReplaceSkuLocationMapping: async (listingId: string, sku: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/listing/${encodeURIComponent(listingId)}/sku/${encodeURIComponent(sku)}/locations`,
              method: "PUT",
              body,
            }),
          deleteSkuLocationMapping: async (listingId: string, sku: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/listing/${encodeURIComponent(listingId)}/sku/${encodeURIComponent(sku)}/locations`,
              method: "DELETE",
            }),
          getSkuLocationMapping: async (listingId: string, sku: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/listing/${encodeURIComponent(listingId)}/sku/${encodeURIComponent(sku)}/locations`,
              method: "GET",
            }),
        },

        // Inventory summaries
        summaries: {
          list: async (params?: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/inventory/v1/inventory_summary${params ? `?${params}` : ""}`,
              method: "GET",
            }),
        },
      },

      metaData: {
        getSalesTax: async (countryCode: string, taxJurisdictionId: string) =>
          this.request({
            productionBaseUrlName: "default",
            path: `/sell/account/${this.apiVersionV1}/sales_tax/${encodeURIComponent(countryCode)}/${encodeURIComponent(taxJurisdictionId)}`,
          }),
      },

      analytics: {
        getCustomerServiceMetric: async (marketplaceId: string) =>
          this.request({
            productionBaseUrlName: "analytics",
            path: `/sell/analytics/${this.apiVersionV1}/customer_service_metric/CURRENT?evaluation_marketplace_id=${encodeURIComponent(marketplaceId)}`,
          }),

        getTrafficReport: async (marketplaceIds: string, dateRange: string, dimension: string, metrics: string) =>
          this.request({
            productionBaseUrlName: "analytics",
            path: `/sell/analytics/${this.apiVersionV1}/traffic_report?filter=marketplace_ids:${encodeURIComponent(
              marketplaceIds
            )},date_range:${encodeURIComponent(dateRange)}&dimension=${encodeURIComponent(dimension)}&metric=${encodeURIComponent(metrics)}`,
          }),
      },

      finance: {
        payouts: {
          list: async (params?: string) =>
            this.request({
              productionBaseUrlName: "finance",
              path: `/sell/finances/v1/payouts${params ? `?${params}` : ""}`,
              method: "GET",
            }),
          get: async (payoutId: string) =>
            this.request({
              productionBaseUrlName: "finance",
              path: `/sell/finances/v1/payout/${encodeURIComponent(payoutId)}`,
              method: "GET",
            }),
          summary: async (params?: string) =>
            this.request({
              productionBaseUrlName: "finance",
              path: `/sell/finances/v1/payout_summary${params ? `?${params}` : ""}`,
              method: "GET",
            }),
          sellerFundsSummary: async (params?: string) =>
            this.request({
              productionBaseUrlName: "finance",
              path: `/sell/finances/v1/seller_funds_summary${params ? `?${params}` : ""}`,
              method: "GET",
            }),
        },

        transactions: {
          list: async (params?: string) =>
            this.request({
              productionBaseUrlName: "finance",
              path: `/sell/finances/v1/transaction${params ? `?${params}` : ""}`,
              method: "GET",
            }),
          summary: async (params?: string) =>
            this.request({
              productionBaseUrlName: "finance",
              path: `/sell/finances/v1/transaction_summary${params ? `?${params}` : ""}`,
              method: "GET",
            }),
        },

        transfers: {
          get: async (transferId: string) =>
            this.request({
              productionBaseUrlName: "finance",
              path: `/sell/finances/v1/transfer/${encodeURIComponent(transferId)}`,
              method: "GET",
            }),
        },
      },

      accountV2: {
        payoutSettings: {
          get: async () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v2/payout_settings",
              method: "GET",
            }),
          updatePercentage: async (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v2/payout_settings/update_percentage",
              method: "POST",
              body,
            }),
        },

        rateTable: {
          get: async (rateTableId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v2/rate_table/${encodeURIComponent(rateTableId)}`,
              method: "GET",
            }),
          updateShippingCost: async (rateTableId: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v2/rate_table/${encodeURIComponent(rateTableId)}/update_shipping_cost`,
              method: "POST",
              body,
            }),
        },
      },

      accountV1: {
        fulfillmentPolicies: {
          list: (marketplaceId = "EBAY_US") =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/fulfillment_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`,
              method: "GET",
            }),
          listByMarketplace: (marketplaceId = "EBAY_US") =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/fulfillment_policy/get_by_marketplace?marketplace_id=${encodeURIComponent(marketplaceId)}
`,
              method: "GET",
            }),
          get: (fulfillmentPolicyId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/fulfillment_policy/${fulfillmentPolicyId}`,
              method: "GET",
            }),
          create: (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/fulfillment_policy",
              method: "POST",
              body,
            }),
          update: (fulfillmentPolicyId: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/fulfillment_policy/${fulfillmentPolicyId}`,
              method: "PUT",
              body,
            }),
          delete: (fulfillmentPolicyId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/fulfillment_policy/${fulfillmentPolicyId}`,
              method: "DELETE",
            }),
        },

        paymentPolicies: {
          list: (marketplaceId = "EBAY_US") =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/payment_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`,
              method: "GET",
            }),
          listByMarketplace: (marketplaceId = "EBAY_US") =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/payment_policy/get_by_marketplace?marketplace_id=${encodeURIComponent(marketplaceId)}`,
              method: "GET",
            }),
          get: (paymentPolicyId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/payment_policy/${paymentPolicyId}`,
              method: "GET",
            }),
          create: (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/payment_policy",
              method: "POST",
              body,
            }),
          update: (paymentPolicyId: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/payment_policy/${paymentPolicyId}`,
              method: "PUT",
              body,
            }),
          delete: (paymentPolicyId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/payment_policy/${paymentPolicyId}`,
              method: "DELETE",
            }),
        },

        returnPolicies: {
          list: (marketplaceId = "EBAY_US") =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/return_policy?marketplace_id=${encodeURIComponent(marketplaceId)}`,
              method: "GET",
            }),
          listByMarketplace: (marketplaceId = "EBAY_US") =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/return_policy/get_by_marketplace?marketplace_id=${encodeURIComponent(marketplaceId)}`,
              method: "GET",
            }),
          get: (returnPolicyId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/return_policy/${returnPolicyId}`,
              method: "GET",
            }),
          create: (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/return_policy",
              method: "POST",
              body,
            }),
          update: (returnPolicyId: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/return_policy/${returnPolicyId}`,
              method: "PUT",
              body,
            }),
          delete: (returnPolicyId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/return_policy/${returnPolicyId}`,
              method: "DELETE",
            }),
        },

        customPolicies: {
          list: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/custom_policy",
              method: "GET",
            }),
          get: (customPolicyId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/custom_policy/${customPolicyId}`,
              method: "GET",
            }),
          create: (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/custom_policy",
              method: "POST",
              body,
            }),
          update: (customPolicyId: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/custom_policy/${customPolicyId}`,
              method: "PUT",
              body,
            }),
          delete: (customPolicyId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/custom_policy/${customPolicyId}`,
              method: "DELETE",
            }),
        },

        salesTax: {
          list: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/sales_tax",
              method: "GET",
            }),
          get: (countryCode: string, jurisdictionId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/sales_tax/${encodeURIComponent(countryCode)}/${encodeURIComponent(jurisdictionId)}`,
              method: "GET",
            }),
          createOrReplace: (countryCode: string, jurisdictionId: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/sales_tax/${encodeURIComponent(countryCode)}/${encodeURIComponent(jurisdictionId)}`,
              method: "PUT",
              body,
            }),
          delete: (countryCode: string, jurisdictionId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/sales_tax/${encodeURIComponent(countryCode)}/${encodeURIComponent(jurisdictionId)}`,
              method: "DELETE",
            }),
        },

        programs: {
          list: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/program",
              method: "GET",
            }),
          eligibility: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/program/eligibility",
              method: "GET",
            }),
          optedIn: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/program/get_opted_in_programs",
              method: "GET",
            }),
          optedOut: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/program/get_opted_out_programs",
              method: "GET",
            }),
          optIn: (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/program/opt_in",
              method: "POST",
              body,
            }),
          optOut: (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/program/opt_out",
              method: "POST",
              body,
            }),
        },

        subscription: {
          get: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/subscription",
              method: "GET",
            }),
        },

        store: {
          get: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/store",
              method: "GET",
            }),
          categories: {
            get: () =>
              this.request({
                productionBaseUrlName: "default",
                path: "/sell/account/v1/store/categories",
                method: "GET",
              }),
          },
        },

        rateTables: {
          get: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/rate_table",
              method: "GET",
            }),
        },

        privileges: {
          get: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/privilege",
              method: "GET",
            }),
        },

        paymentsProgram: {
          get: (marketplaceId: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/payments_program/${marketplaceId}/EBAY_PAYMENTS/onboarding`,
              method: "GET",
            }),
        },

        advertisingEligibility: {
          get: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/advertising_eligibility",
              method: "GET",
            }),
        },

        kyc: {
          get: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/kyc",
              method: "GET",
            }),
        },

        locations: {
          list: () =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/location",
              method: "GET",
            }),
          get: (merchantLocationKey: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/location/${merchantLocationKey}`,
              method: "GET",
            }),
          create: (body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: "/sell/account/v1/location",
              method: "POST",
              body,
            }),
          update: (merchantLocationKey: string, body: Record<string, unknown>) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/location/${merchantLocationKey}`,
              method: "PUT",
              body,
            }),
          delete: (merchantLocationKey: string) =>
            this.request({
              productionBaseUrlName: "default",
              path: `/sell/account/v1/location/${merchantLocationKey}`,
              method: "DELETE",
            }),
        },
      },
    },
  };
}

const ebayService = new EbayService();

ebayService.env = featureFlags.currentEnv;
ebayService.clientId = config.ebay.clientId || "";
ebayService.clientSecret = config.ebay.clientSecret || "";
ebayService.redirectUri = config.ebay.redirectUri || "";
ebayService.scope = EBAY_SCOPES.join(" ");

export default ebayService;
