import { auth } from "@/auth";
import { apiError } from "@/lib/api-response";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, error: apiError("Authentication required", 401) };
  return { session, error: null };
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return { session: null, error: apiError("Admin access required", 403) };
  }
  return { session, error: null };
}

export async function requireVendor() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { session: null, error: apiError("Vendor access required", 403) };
  }
  return { session, error: null };
}
