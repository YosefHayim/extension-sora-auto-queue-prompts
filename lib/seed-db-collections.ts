import { doc, writeBatch } from "firebase/firestore";
import { fireBaseDb } from "@/config";

async function main() {
  const orgId = "org_demo";
  const userId = "user_demo";
  const ebayAccountId = "ebayacct_demo";
  const policyPaymentId = "policy_payment_demo";
  const asin = "ASINDEMO123";
  const listingId = "listing_demo";
  const orderId = "order_demo";
  const jobId = "job_demo";
  const idemKey = "idem_demo";
  const uniqueKey = `${orgId}_sku_DEMOSKU`;
  const salesDailyId = `${orgId}_20250101`;
  const priceSnapId = `${asin}_20250101`;

  const b = writeBatch(fireBaseDb);

  // organizations/{orgId}
  b.set(doc(fireBaseDb, "organizations", orgId), {
    name: null,
    plan: null,
    settings: null,
    members: null,
    createdAt: null,
    updatedAt: null,
  });

  // users/{userId}
  b.set(doc(fireBaseDb, "users", userId), {
    email: null,
    displayName: null,
    status: null,
    createdAt: null,
    updatedAt: null,
  });

  // ebayPolicies/{policyId}
  b.set(doc(fireBaseDb, "ebayPolicies", policyPaymentId), {
    orgId: null,
    ebayAccountId: null,
    type: null,
    name: null,
    policyExternalId: null,
    data: null,
    lastSyncedAt: null,
    createdAt: null,
    updatedAt: null,
  });

  // ebayAccounts/{ebayAccountId}
  b.set(doc(fireBaseDb, "ebayAccounts", ebayAccountId), {
    orgId: null,
    siteId: null,
    oauth: null,
    policyRefs: null,
    settings: null,
    status: null,
    lastPolicySyncAt: null,
    createdAt: null,
    updatedAt: null,
  });

  // sourceItems/{asin}
  b.set(doc(fireBaseDb, "sourceItems", asin), {
    orgId: null,
    asin: null,
    seller: null,
    url: null,
    baseCost: null,
    shipping: null,
    availability: null,
    priceChecks: null,
    images_url: null,
    main_image_url: null,
    createdAt: null,
    updatedAt: null,
  });

  // listings/{listingId}
  b.set(doc(fireBaseDb, "listings", listingId), {
    orgId: null,
    ebayAccountId: null,
    ebayListingId: null,
    sku: null,
    asin: null,
    title: null,
    price: null,
    qtyPolicy: null,
    qty: null,
    priceRule: null,
    status: null,
    sourceSnapshot: null,
    nextPrice: null,
    nextPriceReason: null,
    lastSyncAt: null,
    createdAt: null,
    updatedAt: null,
  });

  // orders/{orderId}
  b.set(doc(fireBaseDb, "orders", orderId), {
    orgId: null,
    ebayAccountId: null,
    ebayOrderId: null,
    buyer: null,
    totals: null,
    status: null,
    line_items: null,
    fulfillments: null,
    refunds: null,
    placedAt: null,
    createdAt: null,
    updatedAt: null,
  });

  // jobs/{jobId}
  b.set(doc(fireBaseDb, "jobs", jobId), {
    orgId: null,
    ebayAccountId: null,
    kind: null,
    state: null,
    attempts: null,
    payload: null,
    error: null,
    createdAt: null,
    updatedAt: null,
  });

  // idempotency_keys/{key}
  b.set(doc(fireBaseDb, "idempotency_keys", idemKey), {
    scope: null,
    hash: null,
    status: null,
    resultRef: null,
    createdAt: null,
    updatedAt: null,
  });

  // uniques/{key}
  b.set(doc(fireBaseDb, "uniques", uniqueKey), {
    purpose: null,
    createdAt: null,
    updatedAt: null,
  });

  // sales_daily/{orgId_YYYYMMDD}
  b.set(doc(fireBaseDb, "sales_daily", salesDailyId), {
    orgId: null,
    date: null,
    orders: null,
    units: null,
    revenue: null,
    fees: null,
    profit: null,
    createdAt: null,
    updatedAt: null,
  });

  // listing_metrics/{listingId}
  b.set(doc(fireBaseDb, "listing_metrics", listingId), {
    orgId: null,
    listingId: null,
    lastSeenPrice: null,
    lastSeenSourceCost: null,
    sales7d: null,
    sales30d: null,
    profit30d: null,
    createdAt: null,
    updatedAt: null,
  });

  // price_snapshots/{asin_YYYYMMDD}
  b.set(doc(fireBaseDb, "price_snapshots", priceSnapId), {
    orgId: null,
    asin: null,
    date: null,
    min: null,
    max: null,
    avg: null,
    samples: null,
    createdAt: null,
    updatedAt: null,
  });

  await b.commit();
}

main().catch(console.error);