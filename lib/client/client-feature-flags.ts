import type { ClientFeatureFlags } from "./client-definitions";

export const clientFeatureFlags: ClientFeatureFlags = {
  reactFormHooksModeLogin: "onSubmit",
  reactFormHooksModeRegister: "onSubmit",
};

export const clientFeatureFlagsConfig = {
  formMode: {
    login: clientFeatureFlags.reactFormHooksModeLogin,
    register: clientFeatureFlags.reactFormHooksModeRegister,
  },
};
