export const featureFlags = {
  currentEnv: process.env.NODE_ENV === "production" ? "production" : "development",
  authWGoogle: true,
  authWEbay: true,
};
