import { secret } from "@aws-amplify/backend";

export const config = {
  appIdProd: secret("APP_ID_PROD"),
  devIdProd: secret("DEV_ID_PROD"),
  certIdProd: secret("CERT_ID_PROD"),
  dopplerConfig: secret("DOPPLER_CONFIG"),
  dopplerEnvironment: secret("DOPPLER_ENVIRONMENT"),
  redirectUriProd: secret("REDIRECT_URI_PROD"),
  dopplerProject: secret("DOPPLER_PROJECT"),
};
