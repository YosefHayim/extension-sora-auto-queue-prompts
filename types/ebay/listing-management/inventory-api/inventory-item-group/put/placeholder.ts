import type { EbayError } from "@/types/ebay/global/types";
import type { InventoryItemGroup } from "../../inventory-api-global-types";

/**
 * Path parameters for createOrReplaceInventoryItemGroup.
 * inventoryItemGroupKey: Seller-defined unique identifier. Max length: 50
 * Occurrence: Required
 */
export type CreateOrReplaceInventoryItemGroupPathParams = {
  inventoryItemGroupKey: string;
};

/**
 * Request body for createOrReplaceInventoryItemGroup.
 * Full replacement on update; omit inventoryItemGroupKey from payload (it is in the path).
 */
export type CreateOrReplaceInventoryItemGroupRequest = Omit<InventoryItemGroup, "inventoryItemGroupKey">;

/**
 * Response body (BaseResponse).
 * Warnings/errors triggered by the operation are returned here.
 */
export type CreateOrReplaceInventoryItemGroupResponse = {
  warnings?: EbayError[];
};
