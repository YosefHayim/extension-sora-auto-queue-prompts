import { OAuth2Client } from "google-auth-library";
import { featureFlags } from "./feature-flags";


export const config = {
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri:
      featureFlags.currentEnv === 'production'
        ? process.env.GOOGLE_REDIRECT_URI
        : 'http://localhost:3000'
  },
  ebay: {
    clientId:
      featureFlags.currentEnv === 'production'
        ? process.env.CLIENT_ID_PROD
        : process.env.CLIENT_ID_SANDBOX,
    clientSecret:
      featureFlags.currentEnv === 'production'
        ? process.env.CLIENT_SECRET_ID_PROD
        : process.env.CLIENT_SECRET_SANDBOX,
    redirectUri:
      featureFlags.currentEnv === 'production'
        ? process.env.REDIRECT_URI_PROD
        : process.env.REDIRECT_URI_SANDBOX
  },
}


export const oAuth2Client = new OAuth2Client({
  apiKey: config.google.apiKey,
  clientId: config.google.clientId,
  clientSecret: config.google.clientSecret,
  redirectUri: config.google.redirectUri,
});