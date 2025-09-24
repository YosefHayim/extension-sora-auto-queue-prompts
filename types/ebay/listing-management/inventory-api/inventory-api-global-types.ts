import type {
  AvailabilityTypeEnum,
  ConditionEnum,
  EbayMarketplaceId,
  LengthUnitOfMeasureEnum,
  LocalEnum,
  PackageTypeEnum,
  TimeDurationUnitEnum,
  WeightUnitOfMeasureEnum,
} from "../../global/enums";

/** Union of all marketplace values (e.g., "EBAY_US") */
export type EbayMarketplace = (typeof EbayMarketplaceId)[keyof typeof EbayMarketplaceId];

/** Inventory item definition aligned with eBay Sell Inventory API */
export type InventoryItemWithSkuLocale = {
  /** Seller-defined SKU (Stock Keeping Unit); unique per item */
  sku: string;
  /** Sale availability across pickup and ship-to locations */
  availability: Availability;
  /** Publish offer note: This field is required before an offer can be published to create an active listing. */
  condition: ConditionEnum;
  /** Free-text condition details (defects, cosmetic notes, etc.) */
  conditionDescription?: string;
  /** Structured condition attributes (name/value), e.g., “Battery Health: 90%” */
  conditionDescriptors?: ConditionDescriptor[];
  /** Listing locale controlling language/formatting */
  locale: LocalEnum;
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
  unit: TimeDurationUnitEnum;
  /** Numeric value of the duration */
  value: number;
};

export type CompatibleProduct = {
  /**
   * This container consists of an array of motor vehicles that are compatible with the motor vehicle part or accessory specified by the SKU value in the call URI. Each motor vehicle is defined through a separate set of name/value pairs.In the name field, the vehicle aspect(such as 'make', 'model', 'year', 'trim', or 'engine') will be identified, and the value field will be used to identify the value of each aspect.The getCompatibilityProperties method of the Taxonomy API can be used to retrieve applicable vehicle aspect names for a specified category, and the getCompatibilityPropertyValues method of the Taxonomy API can be used to retrieve possible values for these same vehicle aspect names.Below is an example of identifying one motor vehicle using the compatibilityProperties container: "compatibilityProperties" : [{ "name": "make", "value": "Subaru"   }, { "name": "model", "value": "GL"   }, { "name": "year", "value": "1983"   }, { "name": "trim", "value": "Base Wagon 4-Door"   }, { "name": "engine", "value": "1.8L Turbocharged"   }]  Typically, the make, model, and year of the motor vehicle are always required, with the trim and engine being necessary sometimes, but it will be dependent on the part or accessory, and on the vehicle class.Note: The productFamilyProperties container is deprecated and should no longer be used.The compatibilityProperties container should be used instead.
   */
  compatibilityProperties?: NameValueList[];
  /**
   * This field is used by the seller to input any notes pertaining to the compatible vehicle list being defined.The seller might use this field to specify the placement of the part on a vehicle or other applicable information.This field will only be returned if specified by the seller.
   * Max Length: 500
   */
  notes?: string;
  /**
   * Important! The productFamilyProperties container is deprecated and should no longer be used.The compatibilityProperties container should be used instead.
   */
  productFamilyProperties?: ProductFamilyProperties;
  /**
   * This container is used in a createOrReplaceProductCompatibility call to identify a motor vehicle that is compatible with the inventory item.The user specifies either an eBay Product ID(ePID) or K - Type value to identify a vehicle, and if the motor vehicle is found in the eBay product catalog, the motor vehicle properties(make, model, year, trim, engine) will automatically be populated for the vehicle.If the vehicle cannot be found using these identifiers, the vehicle will not be added to the compatible vehicle list.Note that this container will not be returned in the getProductCompatibility call.
   */
  productIdentifier?: ProductIdentifier;
};

/**
 * Type that uses NameValueList
 */
export type NameValueList = {
  /**
   * This string value identifies the motor vehicle aspect, such as 'make', 'model', 'year', 'trim', and 'engine'.Typically, the make, model, and year of the motor vehicle are always required, with the trim and engine being necessary sometimes, but it will be dependent on the part or accessory, and on the vehicle class.
   * The getCompatibilityProperties method of the Taxonomy API can be used to retrieve applicable vehicle aspect names for a specified category.
   */
  name: string;
  /**
   * This string value identifies the motor vehicle aspect specified in the corresponding name field.For example, if the name field is 'make', this field may be 'Toyota', or if the name field is 'model', this field may be 'Camry'.
   * The getCompatibilityPropertyValues method of the Taxonomy API can be used to retrieve possible values for vehicle aspect names.
   */
  value: string;
};

/**
 * Type that uses ProductFamilyProperties
 */
export type ProductFamilyProperties = {
  /**
   * Important! The productFamilyProperties container is no longer supported.
   */
  engine?: string;
  /**
   * Important! The productFamilyProperties container is no longer supported.
   */
  make?: string;
  /**
   * Important! The productFamilyProperties container is no longer supported.
   */
  model?: string;
  /**
   * Important! The productFamilyProperties container is no longer supported.
   */
  trim?: string;
  /**
   * Important! The productFamilyProperties container is no longer supported.
   */
  year?: string;
};

/**
 * This type is used to identify a motor vehicle that is compatible with the corresponding inventory item(the SKU that is passed in as part of the call URI).The motor vehicle can be identified through an eBay Product ID or a K - Type value.The gtin field(for inputting Global Trade Item Numbers) is for future use only.If a motor vehicle is found in the eBay product catalog, the motor vehicle properties(engine, make, model, trim, and year) will automatically get picked up for that motor vehicle.
 * Note: Currently, parts compatibility is only applicable for motor vehicles, but it is possible that the Product Compatibility feature is expanded to other(non - vehicle) products in the future.
 */
export type ProductIdentifier = {
  /**
   * This field can be used if the seller already knows the eBay catalog product ID(ePID) associated with the motor vehicle that is to be added to the compatible product list.If this eBay catalog product ID is found in the eBay product catalog, the motor vehicle properties(e.g.make, model, year, engine, and trim) will automatically get picked up for that motor vehicle.
   */
  epid?: string;
  /**
   * This field can be used if the seller knows the Global Trade Item Number for the motor vehicle that is to be added to the compatible product list.If this GTIN value is found in the eBay product catalog, the motor vehicle properties(e.g.make, model, year, engine, and trim will automatically get picked up for that motor vehicle.
   * Note: This field is for future use.
   */
  gtin?: string;
  /**
   * This field can be used if the seller knows the K Type Number for the motor vehicle that is to be added to the compatible product list.If this K Type value is found in the eBay product catalog, the motor vehicle properties(e.g.make, model, year, engine, and trim) will automatically get picked up for that motor vehicle.
   * Only the AU, DE, ES, FR, IT, and UK marketplaces support the use of K Type Numbers.
   */
  ktype?: string;
};

/**
 * This type is used by the createOrReplaceProductCompatibility method to define the compatible vehicle list for the inventory item.
 */
export type Compatibility = {
  /**
   * This container consists of an array of motor vehicles(make, model, year, trim, engine) that are compatible with the motor vehicle part or accessory specified by the sku value.
   */
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
   *
   * Publish offer note: This field is required before an offer can be published to create an active listing.
   */
  aspects?: Record<string, string[]>;
  /** Brand/manufacturer name */
  brand?: string;
  /** Publish offer note: This field is required before an offer can be published to create an active listing. */
  description?: string;
  /** European Article Number(s) (aka International Article Number) */
  ean?: string[];
  /** eBay Product ID linking to catalog record */
  epid?: string;
  /** Publish offer note: This array is required and at least one image URL must be specified before an offer can be published to create an active listing. */
  imageUrls?: string[];
  /** ISBN(s) for books/media */
  isbn?: string[];
  /** Manufacturer Part Number */
  mpn?: string;
  /** Optional subtitle line for listing */
  subtitle?: string;
  /** Publish offer note: This field is required before an offer can be published to create an active listing. */
  title: string;
  /** Universal Product Code(s) */
  upc?: string[];
  /** eBay-hosted video IDs associated to the product */
  videoIds?: string[];
};

/** Availability container across pickup and ship-to */
export type Availability = {
  /** Per-store pickup inventory/SLAs */
  pickupAtLocationAvailability?: PickupAtLocationAvailability[];
  /** Network ship-to inventory/SLAs */
  shipToLocationAvailability?: ShipToLocationAvailability;
};

/** Pickup availability record for a merchant location */
export type PickupAtLocationAvailability = {
  /** Availability state at the pickup location */
  availabilityType: AvailabilityTypeEnum;
  /** Estimated time to fulfill pickup */
  fulfillmentTime: TimeDuration;
  /** Merchant-defined location key (store/warehouse ID) */
  merchantLocationKey: string;
  /** This field is not immediately required, but 'ship-to-home' quantity must be set before an offer of the inventory item can be published. */
  quantity: number;
};

/** Ship-to network availability across distribution centers */
export type ShipToLocationAvailability = {
  /** Optional per-DC inventory and SLA breakdown */
  availabilityDistributions?: AvailabilityDistribution[];
  /** Total shippable quantity across the network */
  quantity: number;
};

/** Distribution-center level availability record */
export type AvailabilityDistribution = {
  /** Estimated ship handling time from this DC */
  fulfillmentTime: TimeDuration;
  /** Merchant-defined location key (DC identifier) */
  merchantLocationKey: string;
  /** Available units at this DC */
  quantity: number;
};

/** Physical package dimensions and weight for shipping calculations */
export type PackageWeightAndSize = {
  /** Dimensional measurements */
  dimensions: Dimensions;
  /** Package form factor/type */
  packageType?: PackageTypeEnum;
  /** Irregular package flag (non-standard shape/handling) */
  shippingIrregular?: boolean;
  /** Package mass */
  weight: Weight;
};

/** Dimensions (L x W x H) with unit */
export type Dimensions = {
  /** Height of the package */
  height: number;
  /** Length of the package */
  length: number;
  /** Unit of length (e.g., INCH, CENTIMETER) */
  unit: LengthUnitOfMeasureEnum;
  /** Width of the package */
  width: number;
};

/** Weight measure with unit */
export type Weight = {
  /** Unit of mass (e.g., KILOGRAM, POUND) */
  unit: WeightUnitOfMeasureEnum;
  /** Numeric mass value */
  value: number;
};

/**
 * Inventory item with SKU, locale, and group keys.
 */
export type InventoryItem = {
  /**
   * Shipping and pickup availability details.
   * Occurrence: Conditional
   */
  availability?: {
    /**
     * In-store pickup availability across locations.
     * Occurrence: Conditional
     */
    pickupAtLocationAvailability?: Array<{
      /**
       * Availability status at the store.
       * Occurrence: Conditional
       */
      availabilityType?: AvailabilityTypeEnum;

      /**
       * Time until pickup is ready.
       * Occurrence: Conditional
       */
      fulfillmentTime?: AvailabilityDistribution["fulfillmentTime"];

      /**
       * Unique merchant store identifier (max 36 chars).
       * Occurrence: Conditional
       */
      merchantLocationKey?: string;

      /**
       * Quantity available at this store.
       * Occurrence: Conditional
       */
      quantity?: number;
    }>;

    /**
     * Ship-to-home availability.
     * Occurrence: Conditional
     */
    shipToLocationAvailability?: {
      /**
       * Quantity allocation by offer format.
       * Occurrence: Conditional
       */
      allocationByFormat?: {
        /**
         * Quantity reserved for auction offers.
         * Occurrence: Conditional
         */
        auction?: number;

        /**
         * Quantity for fixed-price offers.
         * Occurrence: Conditional
         */
        fixedPrice?: number;
      };

      /**
       * Per-location available quantities and optional fulfillment times.
       * Occurrence: Conditional
       */
      availabilityDistributions?: AvailabilityDistribution[];

      /**
       * Total ship-to-home quantity across offers.
       * Occurrence: Conditional
       */
      quantity?: number;
    };
  };

  /**
   * Item condition (site/category dependent).
   * Occurrence: Conditional
   */
  condition?: ConditionEnum;

  /**
   * Free-text condition clarification for non-new items.
   * Max length: 1000
   * Occurrence: Conditional
   */
  conditionDescription?: string;

  /**
   * Structured condition descriptors (name/value).
   * Occurrence: Conditional
   */
  conditionDescriptors?: Array<{
    /**
     * Additional descriptor info (open text).
     * Max length: 30
     * Occurrence: Conditional
     */
    additionalInfo?: string;

    /**
     * Descriptor name (numeric ID as string).
     * Occurrence: Conditional
     */
    name?: string;

    /**
     * Descriptor value IDs as strings.
     * Occurrence: Conditional
     */
    values?: string[];
  }>;

  /**
   * Inventory item group identifiers (variation keys).
   * Occurrence: Conditional
   */
  inventoryItemGroupKeys?: string[];

  /**
   * Natural language/locale of provided field values.
   * Occurrence: Always
   */
  locale?: LocalEnum;

  /**
   * Package dimensions and weight for shipping.
   * Occurrence: Conditional
   */
  packageWeightAndSize?: PackageWeightAndSize;

  /**
   * Catalog/product metadata (title, description, GTINs, images, etc.).
   * Occurrence: Conditional
   */
  product?: Product;

  /**
   * Seller-defined SKU for the item.
   * Occurrence: Conditional
   */
  sku: string;
};
