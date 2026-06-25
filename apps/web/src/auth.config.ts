import type { NextAuthConfig } from "next-auth";

export type SessionRole = "CUSTOMER" | "VENDOR" | "ADMIN" | "SUPER_ADMIN";

// Edge-safe base config — no Prisma/bcrypt imports, so this is the only
// piece middleware (which runs on the Edge runtime) is allowed to import.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.customerId = user.id;
      if (user && "role" in user) token.role = user.role as SessionRole;
      return token;
    },
    async session({ session, token }) {
      if (token.customerId) session.user.id = token.customerId as string;
      if (token.role) session.user.role = token.role as SessionRole;
      return session;
    },
  },
};
