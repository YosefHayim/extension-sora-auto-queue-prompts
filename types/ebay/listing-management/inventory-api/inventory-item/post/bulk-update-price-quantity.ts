import type { Amount, EbayError } from "@/types/ebay/global/enums";
import type { ShipToLocationAvailability } from "../../inventory-api-global-types";

/**
 * Request payload: update price/quantity for a single SKU and/or its offers.
 * Occurrence: Required
 */
export type BulkUpdatePriceQuantityRequest = {
  /**
   * Up to 25 entries; each targets one SKU (product).
   * Occurrence: Required
   */
  requests: PriceQuantity[];
};

/**
 * Per-SKU update block.
 */
export type PriceQuantity = {
  /**
   * Price/quantity updates for published offers of this SKU.
   * A separate node per offer being updated.
   * Occurrence: Conditional
   */
  offers?: OfferPriceQuantity[];

  /**
   * Total ship-to-home quantity, optionally distributed by locations.
   * Occurrence: Conditional
   */
  shipToLocationAvailability?: ShipToLocationAvailability;

  /**
   * SKU for which ship-to-home quantity is updated.
   * Required when shipToLocationAvailability is provided.
   * Occurrence: Conditional
   * Max Length: 50
   */
  sku?: string;
};

/**
 * Offer-level price/quantity update.
 */
export type OfferPriceQuantity = {
  /**
   * Marketplace-allocated available quantity for this offer.
   * Either this or price is required in each offer node.
   * Occurrence: Conditional
   */
  availableQuantity?: number;

  /**
   * Target offer identifier to update.
   * Occurrence: Conditional
   */
  offerId?: string;

  /**
   * New price for this offer.
   * Either this or availableQuantity is required.
   * Occurrence: Conditional
   */
  price?: Amount;
};

/**
 * Response payload: per-offer/SKU update results.
 * Occurrence: Always
 */
export type BulkUpdatePriceQuantityResponse = {
  /**
   * One result per attempted offer/SKU update.
   * Occurrence: Always
   */
  responses: PriceQuantityResponse[];
};

/**
 * Per-offer/SKU update result.
 */
export type PriceQuantityResponse = {
  /**
   * Errors for this offer/SKU update, if any.
   * Occurrence: Conditional
   */
  errors?: EbayError[];

  /**
   * Updated offer identifier.
   * Not returned when only SKU-level quantity was updated.
   * Occurrence: Conditional
   */
  offerId?: string;

  /**
   * SKU associated with the update attempt.
   * Occurrence: Always
   * Max Length: 50
   */
  sku: string;

  /**
   * HTTP status of the update attempt (e.g., 200 on success).
   * Occurrence: Always
   */
  statusCode: number;

  /**
   * Warnings for this offer/SKU update, if any.
   * Occurrence: Conditional
   */
  warnings?: EbayError[];
};

/**
 * Notes on nested/global types referenced above:
 * - ShipToLocationAvailability.availabilityDistributions?: AvailabilityDistribution[]
 *   • fulfillmentTime?: AvailabilityDistribution["fulfillmentTime"] (TimeDuration)
 *   • merchantLocationKey?: string
 *   • quantity?: number
 * - Amount
 *   • currency: string (ISO currency code)
 *   • value: string (decimal)
 *
 * These are imported from global modules and not redeclared here.
 */
