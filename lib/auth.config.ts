
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string | null;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;

      const isApiRoute = nextUrl.pathname.startsWith('/api');
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isClientRoute = nextUrl.pathname.startsWith('/client');
      const isEmployeeRoute = nextUrl.pathname.startsWith('/employee');
      const isAuthRoute = nextUrl.pathname.startsWith('/auth');

      // 1. If not logged in and trying to access any dashboard, redirect to login
      if ((isAdminRoute || isClientRoute || isEmployeeRoute) && !isLoggedIn) {
        return false;
      }

      // 2. If logged in and trying to access auth pages (signin/signup), redirect to home
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL('/', nextUrl));
      }

      // 3. Strict Role-Based Access Control
      if (isLoggedIn) {
        if (isAdminRoute && userRole !== 'ADMIN') {
          return Response.redirect(new URL('/', nextUrl));
        }
        if (isClientRoute && userRole !== 'CLIENT') {
          return Response.redirect(new URL('/', nextUrl));
        }
        if (isEmployeeRoute && userRole !== 'EMPLOYEE' && userRole !== 'CONTRACT_ADMIN') {
          return Response.redirect(new URL('/', nextUrl));
        }
      }

      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
