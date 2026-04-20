
import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  // Covers all pages + sensitive API routes (admin, employee, upload)
  matcher: [
    '/((?!api/auth|api/assessment|api/webhooks|_next/static|_next/image|.*\\.png$).*)',
  ],
};
