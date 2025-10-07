import { db } from "../../utils/db";
import { users } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export default defineOAuthAuthentikEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user, tokens }) {
    // Find or create user in database
    let dbUser = await db.query.users.findFirst({
      where: eq(users.sub, user.sub),
    });

    if (!dbUser) {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          sub: user.sub,
          email: user.email,
        })
        .returning();
      dbUser = newUser;
    }

    await setUserSession(event, {
      user: {
        id: dbUser.id,
        sub: dbUser.sub,
        email: dbUser.email,
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
