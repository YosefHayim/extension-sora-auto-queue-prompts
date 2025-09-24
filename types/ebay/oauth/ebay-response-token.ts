/** Standard OAuth token response from eBay */
export type EbayTokenResponse = {
  /** Access token (Bearer) used for API calls */
  access_token: string;
  /** Seconds until access_token expiry */
  expires_in: number;
  /** Refresh token used to mint new access tokens */
  refresh_token: string;
  /** Seconds until refresh_token expiry */
  refresh_token_expires_in: number;
  /** Token type, typically "Bearer" */
  token_type: string;
};
