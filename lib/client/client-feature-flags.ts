import type { ClientFeatureFlags } from "./client-definitions";

export const clientFeatureFlags: ClientFeatureFlags = {
  reactFormHooksMode: "onSubmit",
};

export const clientFeatureFlagsConfig = {
  formMode: clientFeatureFlags.reactFormHooksMode,
};
