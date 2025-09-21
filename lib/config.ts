import { secret } from "@aws-amplify/backend";

export const config = {
  appIdProd: secret("NEXT_PUBLIC_APP_ID_PROD"),
  devIdProd: secret("NEXT_PUBLIC_DEV_ID_PROD"),
  certIdProd: secret("NEXT_PUBLIC_CERT_ID_PROD"),
  dopplerConfig: secret("NEXT_PUBLIC_DOPPLER_CONFIG"),
  dopplerEnvironment: secret("NEXT_PUBLIC_DOPPLER_ENVIRONMENT"),
  redirectUriProd: secret("NEXT_PUBLIC_REDIRECT_URI_PROD"),
  dopplerProject: secret("DOPPLER_PROJECT"),
};
