import type { EbayError } from "@/types/ebay/global/enums";
import type { InventoryItem } from "../../inventory-api-global-types";

/**
 * Request payload: up to 25 SKUs.
 */
export type BulkGetInventoryItemRequest = {
  /**
   * Array of SKU objects to retrieve.
   * Occurrence: Always
   */
  requests: BulkGetInventoryItemSku[];
};

/**
 * Single SKU wrapper.
 */
export type BulkGetInventoryItemSku = {
  /**
   * Seller-defined SKU.
   * Occurrence: Always
   */
  sku: string;
};

/**
 * Top-level response container.
 */
export type BulkGetInventoryItemResponse = {
  /**
   * Results for each requested SKU.
   * Occurrence: Always
   */
  responses: BulkGetInventoryItemResult[];
};

/**
 * Per-SKU result.
 */
export type BulkGetInventoryItemResult = {
  /**
   * Seller-defined SKU for this result.
   * Occurrence: Always
   */
  sku: string;

  /**
   * HTTP status for this retrieval.
   * Occurrence: Always
   */
  statusCode: number;

  /**
   * Inventory item details for the SKU.
   * Occurrence: Always
   */
  inventoryItem?: InventoryItem;

  /**
   * Errors related to this SKU retrieval.
   * Occurrence: Conditional
   */
  errors?: EbayError[];

  /**
   * Warnings related to this SKU retrieval.
   * Occurrence: Conditional
   */
  warnings?: EbayError[];
};
