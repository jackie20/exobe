import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { isLocked, nextLockoutState } from "@/lib/account-lockout";
import { logAudit } from "@/lib/audit";

async function authorizeAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return null;

  if (isLocked(admin.lockedUntil)) {
    await logAudit({ actorType: "ADMIN", actorId: admin.id, action: "auth.login_blocked_locked" });
    return null;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    const lockout = nextLockoutState(admin.failedLoginAttempts);
    await prisma.admin.update({ where: { id: admin.id }, data: lockout });
    await logAudit({ actorType: "ADMIN", actorId: admin.id, action: "auth.login_failed" });
    return null;
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  await logAudit({ actorType: "ADMIN", actorId: admin.id, action: "auth.login_succeeded" });

  return { id: admin.id, name: admin.name, email: admin.email, image: null, role: admin.role };
}

async function authorizeCustomer(email: string, password: string) {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer?.passwordHash) return null;

  if (isLocked(customer.lockedUntil)) {
    await logAudit({ actorType: "CUSTOMER", actorId: customer.id, action: "auth.login_blocked_locked" });
    return null;
  }

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) {
    const lockout = nextLockoutState(customer.failedLoginAttempts);
    await prisma.customer.update({ where: { id: customer.id }, data: lockout });
    await logAudit({ actorType: "CUSTOMER", actorId: customer.id, action: "auth.login_failed" });
    return null;
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  await logAudit({ actorType: "CUSTOMER", actorId: customer.id, action: "auth.login_succeeded" });

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    image: customer.avatarUrl,
    role: customer.isVendor ? ("VENDOR" as const) : ("CUSTOMER" as const),
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        return (await authorizeAdmin(email, password)) ?? (await authorizeCustomer(email, password));
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
    ...(process.env.FACEBOOK_CLIENT_ID
      ? [Facebook({ clientId: process.env.FACEBOOK_CLIENT_ID, clientSecret: process.env.FACEBOOK_CLIENT_SECRET })]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      if (!user.email) return false;

      // OAuth sign-in: link to (or create) a Customer record, then record the provider link.
      const customer = await prisma.customer.upsert({
        where: { email: user.email },
        update: { name: user.name ?? undefined, avatarUrl: user.image ?? undefined },
        create: { email: user.email, name: user.name ?? user.email, avatarUrl: user.image },
      });

      await prisma.oAuthAccount.upsert({
        where: {
          provider_providerAccountId: {
            provider: account!.provider,
            providerAccountId: account!.providerAccountId,
          },
        },
        update: {},
        create: {
          provider: account!.provider,
          providerAccountId: account!.providerAccountId,
          customerId: customer.id,
        },
      });

      user.id = customer.id;
      user.role = customer.isVendor ? "VENDOR" : "CUSTOMER";
      await logAudit({ actorType: "CUSTOMER", actorId: customer.id, action: "auth.oauth_login" });
      return true;
    },
  },
});
