import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const AUTH_REQUIRED_PREFIXES = ["/account", "/wishlist"];
const ADMIN_PREFIXES = ["/admin"];
const VENDOR_PREFIXES = ["/vendor"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  const redirectToLogin = () => {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  };

  if (ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!req.auth) return redirectToLogin();
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return Response.redirect(new URL("/", req.nextUrl.origin));
    }
    return;
  }

  if (VENDOR_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!req.auth) return redirectToLogin();
    if (role !== "VENDOR") {
      return Response.redirect(new URL("/become-vendor", req.nextUrl.origin));
    }
    return;
  }

  if (AUTH_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) && !req.auth) {
    return redirectToLogin();
  }
});

export const config = {
  matcher: ["/account/:path*", "/wishlist/:path*", "/admin/:path*", "/vendor/:path*"],
};
