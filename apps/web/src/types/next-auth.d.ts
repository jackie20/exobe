import type { DefaultSession } from "next-auth";
import type { SessionRole } from "@/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: SessionRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: SessionRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    customerId?: string;
    role?: SessionRole;
  }
}
