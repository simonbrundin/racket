export default defineOAuthAuthentikEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        id: user.sub,
        email: user.email,
      },
      session: {
        loginTime: Date.now(),
        accessToken: tokens.access_token,
      },
    });
    return sendRedirect(event, "/");
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error("Authentik OAuth error:", error);
    return sendRedirect(event, "/");
  },
});
