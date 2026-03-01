import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { upsertSignedInUser } from "@/server/db/service";

const googleClientId =
  process.env.AUTH_GOOGLE_ID ??
  process.env.NEXTAUTH_GOOGLE_ID ??
  process.env.GOOGLE_CLIENT_ID;
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ??
  process.env.NEXTAUTH_GOOGLE_SECRET ??
  process.env.GOOGLE_CLIENT_SECRET;
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  providers: [
    GoogleProvider({
      clientId: googleClientId ?? "",
      clientSecret: googleClientSecret ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  events: {
    async signIn({ user }) {
      if (!user.email) {
        return;
      }
      await upsertSignedInUser(user.name ?? user.email, user.email);
    },
  },
};
