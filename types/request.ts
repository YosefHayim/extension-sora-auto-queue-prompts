export type BaseUrlName = "default" | "finance" | "commerce" | "analytics" | "oauth" | "development";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestOptions = {
  productionBaseUrlName: BaseUrlName;
  path?: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
};

export enum ResponseStatus {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  INTERNAL_ERROR = 500,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
}

export type FeatureFlags = {
  currentEnv: "production" | "development";
  authWGoogle: boolean;
  authWEbay: boolean;

}