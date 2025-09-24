import type { FeatureFlags } from "@/types/api/request";

export const featureFlags: FeatureFlags = {
  currentEnv: process.env.NODE_ENV === "production" ? "production" : "development",
  authWGoogle: true,
  authWEbay: true,
};
