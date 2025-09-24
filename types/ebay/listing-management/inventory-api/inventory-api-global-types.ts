import type { Availability, Condition, EbayMarketplaceId, Local, PackageWeightAndSize, TimeDurationUnit } from "../../global/types";

/**
 * This type defines an inventory item group, which is a collection of inventory items that are variations of a single product.
 * For example, a t-shirt available in different sizes and colors would be an inventory item group.
 */
export type InventoryItemGroup = {
  /**
   * Item specifics (product aspects) shared by all variations in the group.
   * Required before publishing the first offer.
   */
  aspects?: Record<string, string[]>;
  /**
   * Description of the inventory item group, used as the listing description.
   * Max Length: 500000 (including HTML).
   */
  description?: string;
  /**
   * URLs of images for the inventory item group. HTTPS protocol required.
   * At least one image is required before publishing an offer.
   */
  imageUrls?: string[];
  /**
   * Unique identifier for the inventory item group, created by the seller.
   * Not used in `createOrReplaceInventoryItemGroup` request body.
   */
  inventoryItemGroupKey?: string;
  /**
   * Optional listing subtitle. Max Length: 55.
   */
  subtitle?: string;
  /**
   * Title of the inventory item group, used as the listing title.
   * Required before publishing the first offer. Max Length: 80.
   */
  title?: string;
  /**
   * SKUs of individual inventory items belonging to this group.
   * Always returned.
   */
  variantSKUs: string[];
  /**
   * Defines product aspects that vary among items in the group (e.g., size, color).
   * Required before publishing the first offer.
   */
  variesBy?: {
    /**
     * Specifies the product aspect that determines image variations (e.g., 'Color').
     * Required before publishing the first offer if images vary.
     */
    aspectsImageVariesBy?: [string]
    /**
     * Lists product aspects that vary and their possible values (e.g., 'Color': ['Red', 'Blue']).
     * Required before publishing the first offer.
     */
    specifications?: Array<{
      /**
       * Name of the varying product aspect (e.g., 'Color', 'Size').
       */
      name?: string;
      /**
       * List of all possible values for the specified product aspect.
       */
      values?: string[];
    }>;
  };
  /**
   * IDs of eBay-hosted videos for the inventory item group. Only one video per listing is supported.
   */
  videoIds?: string[];
};

/** Union of all marketplace values (e.g., "EBAY_US") */
export type EbayMarketplace = (typeof EbayMarketplaceId)[keyof typeof EbayMarketplaceId];

/** Inventory item definition aligned with eBay Sell Inventory API */
export type InventoryItemWithSkuLocale = {
  /** Seller-defined SKU (Stock Keeping Unit); unique per item */
  sku: string;
  /** Sale availability across pickup and ship-to locations */
  availability: Availability;
  /** Publish offer note: This field is required before an offer can be published to create an active listing. */
  condition: Condition;
  /** Free-text condition details (defects, cosmetic notes, etc.) */
  conditionDescription?: string;
  /** Structured condition attributes (name/value), e.g., “Battery Health: 90%” */
  conditionDescriptors?: ConditionDescriptor[];
  /** Listing locale controlling language/formatting */
  locale: Local;
  /** Physical shipping dimensions and weight */
  packageWeightAndSize?: PackageWeightAndSize;
  /** Publish offer note: This container and a few of its child fields (as noted below) are required before an offer can be published to create an active listing. */
  product: Product;
};

/** Additional structured condition metadata */
export type ConditionDescriptor = {
  /** Optional extra detail for the descriptor */
  additionalInfo?: string;
  /** Descriptor name, e.g., "Battery Health" */
  name: string;
  /** Descriptor values, e.g., ["90%"] */
  values: string[];
};

/** Time duration value for fulfillment SLAs */
export type TimeDuration = {
  /** Unit of the duration (e.g., DAY, HOUR) */
  unit: TimeDurationUnit;
  /** Numeric value of the duration */
  value: number;
};

export type CompatibleProduct = {
  /**
   * Array of motor vehicles compatible with the inventory item, defined by name/value pairs.
   */
  compatibilityProperties?: NameValueList[];
  /**
   * Seller-provided notes about the compatible vehicle list.
   * Max Length: 500
   */
  notes?: string;
  productFamilyProperties?: ProductFamilyProperties; // Deprecated
  /**
   * Identifies a compatible motor vehicle using an eBay Product ID (ePID) or K-Type value.
   */
  productIdentifier?: ProductIdentifier;
};

/**
 * Type that uses NameValueList
 */ export type NameValueList = {
  name: string;
  /**
   * Value of the motor vehicle aspect (e.g., 'Toyota' for 'make').
   */
  value: string;
};

/**
 * Type that uses ProductFamilyProperties
 */ export type ProductFamilyProperties = {
  engine?: string;
  make?: string;
  model?: string;
  trim?: string;
  year?: string;
};

/**
 * Identifies a compatible motor vehicle by eBay Product ID (ePID) or K-Type.
 * GTIN is for future use.
 * Note: Currently, parts compatibility is only for motor vehicles.
 */
export type ProductIdentifier = {
  /** The eBay catalog product ID (ePID) of the compatible motor vehicle.
   */
  epid?: string;
  /**
   * The Global Trade Item Number (GTIN) for the compatible motor vehicle.
   * Note: This field is for future use.
   */ gtin?: string;
  /**
   * The K-Type Number for the compatible motor vehicle.
   * Supported marketplaces: AU, DE, ES, FR, IT, UK.
   */
  ktype?: string;
};

/**
 * This type defines the compatible vehicle list for an inventory item.
 */ export type Compatibility = {
  compatibleProducts: CompatibleProduct[];
  /**
   * The seller - defined SKU value of the inventory item that will be associated with the compatible vehicles.
   * Note: This field is not applicable to the createOrReplaceProductCompatibility method, as the SKU value for the inventory item is passed in as part of the call URI and not in the request payload.It is always returned with the getProductCompatibility method.
   */
  sku: string;
};

/** Core product attributes for an inventory item */
export type Product = {
  /** Effective from December 28th, 2024, sellers offering certain rechargeable devices in EU and Northern Ireland markets must comply with the Common Charger Directive (CCD) and list appropriate charger-related aspects and values on their listings. See Common Charger Directive for more information.
   * Item specifics (product aspects). Required before publishing an offer.
   */
  aspects?: Record<string, string[]>;
  /** Brand/manufacturer name */
  brand?: string;
  /** Product description. Required before publishing an offer. */
  description?: string;
  /** European Article Number(s) (aka International Article Number) */
  ean?: string[];
  /** eBay Product ID linking to catalog record */
  epid?: string;
  /** URLs of product images. At least one image URL is required before publishing an offer. */
  imageUrls?: string[];
  /** ISBN(s) for books/media */
  isbn?: string[];
  /** Manufacturer Part Number */
  mpn?: string;
  /** Optional subtitle line for listing */
  subtitle?: string;
  /** Product title. Required before publishing an offer. */
  title: string;
  /** Universal Product Code(s) */
  upc?: string[];
  videoIds?: string[]; // eBay-hosted video IDs associated to the product
};

/**
 * InventoryItem
 * Detailed information about an inventory item.
 */
export type InventoryItem = {
  /**
   * Quantity availability data for the SKU.
   * Optional until publishing; required if availability already exists on update.
   */
  availability?: Availability;

  /**
   * Item condition (varies by site/category). Required before publishing in most categories.
   */
  condition?: Condition;

  /**
   * Free-text clarification for used/non-new conditions (ignored for new conditions).
   * Max length: 1000.
   */
  conditionDescription?: string;

  /**
   * Structured condition descriptors (name/value attributes).
   */
  conditionDescriptors?: ConditionDescriptor[];

  /**
   * Package dimensions/weight. Required if calculated shipping or weight surcharge used; required on update if previously set.
   */
  packageWeightAndSize?: PackageWeightAndSize;

  /**
   * Product details (title, description, identifiers, aspects, images).
   * Required before publishing; returned for published offers.
   */
  product?: Product;
};

export type InventoryItemWithSkuLocaleGroupKeys = {
  availability: Availability;
  condition: Condition;
  locale: Local;
  packageWeightAndSize: PackageWeightAndSize;
  product: Product;
  sku: string;
};

/**
 * ShipToLocationAvailability
 * Total 'ship-to-home' availability and per-location warehouse availability distributions.
 */
export type ShipToLocationAvailability = {
  /**
   * Warehouse-level distribution of available quantity.
   */
  availabilityDistributions?: AvailabilityDistribution[];

  /**
   * Total 'ship-to-home' quantity across all marketplaces.
   * Must be included on update if already set, or data will be lost.
   */
  quantity?: number;
};

/**
 * AvailabilityDistribution
 * Quantity and optional fulfillment time at a specific merchant location.
 */
export type AvailabilityDistribution = {
  /**
   * Estimated fulfillment time from this location.
   */
  fulfillmentTime?: TimeDuration;

  /**
   * Merchant location key where inventory is available.
   * Required if quantity is set for this location.
   */
  merchantLocationKey?: string;

  /**
   * Quantity available at this location.
   * Required if merchantLocationKey is provided.
   */
  quantity?: number;
};
