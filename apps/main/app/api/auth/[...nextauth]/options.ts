import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import type { Profile } from "next-auth";

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    expires_at?: number;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      picture?: string | null;
      preferred_username?: string | null;
    }
  }
}

// Extend the built-in JWT type
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    expires_at?: number;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    preferred_username?: string | null;
  }
}

// Extend the built-in Profile type for Keycloak
declare module "next-auth/providers/keycloak" {
  interface KeycloakProfile extends Profile {
    sub: string;
    email_verified: boolean;
    // Only add new fields if needed, do not redeclare existing ones with different types
  }
}

export const options: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: 'gateway-client',
      clientSecret: 'YlaDCOKMpaRrWx0Jc9WgQnnHm6MwweEP', 
      issuer: 'http://122.166.245.97:8080/realms/inops',
      profile(profile: Profile) {
        const p = profile as any;
        return {
          id: p.sub,
          name: p.name || p.preferred_username,
          email: p.email,
          image: p.picture,
          preferred_username: p.preferred_username,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        if (account.access_token) {
          const payload = JSON.parse(Buffer.from(account.access_token.split('.')[1], 'base64').toString());
          token.expires_at = payload.exp;
        }
      }
      if (profile) {
        const p = profile as any;
        token.name = p.name || p.preferred_username;
        token.email = p.email;
        token.picture = p.picture;
        token.preferred_username = p.preferred_username;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.expires_at = token.expires_at;
      session.user = {
        name: token.name,
        email: token.email,
        image: token.picture,
        preferred_username: token.preferred_username,
      };
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(options);