import type { InventoryItemWithSkuLocale } from "@/types/ebay/listing-management/inventory-api/inventory-api-global-types";

/** Bulk payload wrapper for creating or replacing inventory items
 *
 * Publish offer note: Fields may be optional or conditionally required when calling this method, but become required when publishing the offer to create an active listing. For this method, see Inventory item fields for a list of fields required to publish an offer.
 */
export type BulkCreateOrReplaceInventoryItem = {
  /** Array of inventory item records to upsert */
  requests: InventoryItemWithSkuLocale[];
};
