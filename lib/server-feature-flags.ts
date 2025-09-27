import type { FeatureFlagsServer } from "@/definitions";

export const featureFlags: FeatureFlagsServer = {
  currentEnv: process.env.NODE_ENV === "production" ? "production" : "development",
  authWGoogle: true,
  authWEbay: true,
};
