import { fireBaseAdminDb } from "./lib/server/server-config";

const now = Date.now();

async function main() {
  const batch = fireBaseAdminDb.batch();

  // Organizations
  batch.set(fireBaseAdminDb.collection("organizations").doc("orgId"), {
    name: "Org Name",
    plan: "free",
    settings: {
      baseCurrency: "USD",
      repricer: { minMarginPct: 10 },
    },
    members: [{ userId: "userId", role: "owner", status: "active" }],
    createdAt: now,
    updatedAt: now,
  });

  // Users
  batch.set(fireBaseAdminDb.collection("users").doc("userId"), {
    email: "user@example.com",
    displayName: "John Doe",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  // EbayPolicies
  batch.set(fireBaseAdminDb.collection("ebayPolicies").doc("policyId"), {
    orgId: "orgId",
    ebayAccountId: "accountId",
    type: "shipping",
    name: "Default Shipping",
    policyExternalId: "ext123",
    data: {},
    lastSyncedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  // EbayAccounts
  batch.set(fireBaseAdminDb.collection("ebayAccounts").doc("ebayAccountId"), {
    orgId: "orgId",
    siteId: "siteId",
    oauth: {
      accessToken: "token",
      refreshToken: "rtoken",
      expiresAt: now,
    },
    policyRefs: {},
    settings: { currency: "USD", timeZone: "UTC", defaultHandlingDays: 2 },
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  // SourceItems
  batch.set(fireBaseAdminDb.collection("sourceItems").doc("ASIN123"), {
    orgId: "orgId",
    asin: "ASIN123",
    baseCost: 10,
    shipping: { primeEligible: true, estDays: 2 },
    availability: "in_stock",
    priceChecks: [],
    images_url: [],
    main_image_url: "",
    createdAt: now,
    updatedAt: now,
  });

  // Listings
  batch.set(fireBaseAdminDb.collection("listings").doc("listingId"), {
    orgId: "orgId",
    ebayAccountId: "accountId",
    sku: "SKU123",
    asin: "ASIN123",
    title: "Product Title",
    price: 20,
    qtyPolicy: "fixed",
    qty: 5,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  });

  // Orders
  batch.set(fireBaseAdminDb.collection("orders").doc("orderId"), {
    orgId: "orgId",
    ebayAccountId: "accountId",
    ebayOrderId: "ebayOrder123",
    buyer: {
      name: "Buyer Name",
      address: {
        line1: "Street",
        city: "City",
        state: "ST",
        postalCode: "12345",
        country: "US",
      },
    },
    totals: { items: 50, tax: 5, shipping: 0, fees: 5, grand: 60 },
    status: "created",
    line_items: [],
    fulfillments: [],
    placedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  // Jobs
  batch.set(fireBaseAdminDb.collection("jobs").doc("jobId"), {
    orgId: "orgId",
    kind: "repricer",
    state: "queued",
    attempts: 0,
    payload: {},
    createdAt: now,
    updatedAt: now,
  });

  // IdempotencyKeys
  batch.set(fireBaseAdminDb.collection("idempotency_keys").doc("key"), {
    scope: "webhook",
    hash: "hash123",
    status: "used",
    createdAt: now,
    updatedAt: now,
  });

  // Uniques
  batch.set(fireBaseAdminDb.collection("uniques").doc("key"), {
    purpose: "sku",
    createdAt: now,
    updatedAt: now,
  });

  // sales_daily
  batch.set(fireBaseAdminDb.collection("sales_daily").doc("orgId_20250101"), {
    orgId: "orgId",
    date: "2025-01-01",
    orders: 10,
    units: 20,
    revenue: 200,
    fees: 20,
    profit: 50,
    createdAt: now,
    updatedAt: now,
  });

  // listing_metrics
  batch.set(fireBaseAdminDb.collection("listing_metrics").doc("listingId"), {
    orgId: "orgId",
    listingId: "listingId",
    createdAt: now,
    updatedAt: now,
  });

  // price_snapshots
  batch.set(fireBaseAdminDb.collection("price_snapshots").doc("ASIN123_20250101"), {
    orgId: "orgId",
    asin: "ASIN123",
    date: "2025-01-01",
    min: 10,
    max: 20,
    avg: 15,
    samples: 5,
    createdAt: now,
    updatedAt: now,
  });

  await batch.commit();
  console.log("Seed complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
