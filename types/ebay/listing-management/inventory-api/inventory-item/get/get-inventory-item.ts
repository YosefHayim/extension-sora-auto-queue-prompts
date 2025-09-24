import type { InventoryItem } from "../../inventory-api-global-types";

/**
 * Path parameters for getInventoryItem.
 * sku: Seller-defined SKU (unique per seller). Max length: 50
 * Occurrence: Required
 */
export type GetInventoryItemPathParams = {
  sku: string;
};

/**
 * Response body: full inventory item record for given SKU.
 * Occurrence: Always (if SKU exists)
 */
export type GetInventoryItemResponse = InventoryItem;
