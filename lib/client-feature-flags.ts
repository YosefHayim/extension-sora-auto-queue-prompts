import type { ClientFeatureFlags } from "@/definitions";

export const clientFeatureFlags: ClientFeatureFlags = {
  reactFormHooksMode: "onSubmit",
};


export const clientFeatureFlagsConfig = {
  formMode: clientFeatureFlags.reactFormHooksMode,
}