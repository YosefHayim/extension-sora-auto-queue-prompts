/** Path params */
export type GetSkuLocationMappingPath = {
  /** eBay listing ID (Item ID) */
  listingId: string;
  /** Seller-defined SKU value belonging to the listing */
  sku: string;
};

/** Request body: none */
export type GetSkuLocationMappingRequest = void;

/** Response body */
export type GetSkuLocationMappingResponse = {
  locations: LocationAvailabilityDetails[];
};

/** LocationAvailabilityDetails */
export type LocationAvailabilityDetails = {
  merchantLocationKey: string;
};
