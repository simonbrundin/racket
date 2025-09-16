import { authClient } from "~/lib/auth-client";

export default defineNuxtPlugin(async () => {
  // Initialize auth client
  return {
    provide: {
      auth: authClient,
    },
  };
});

