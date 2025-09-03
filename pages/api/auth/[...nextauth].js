import NextAuth, { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";

const adminEmail = ["sdgsnehal@gmail.com", "ankitshanivare@gmail.com"];

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  secret: process.env.NEXT_AUTH_SECRET,
  adapter: MongoDBAdapter(client),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token; // Google API access
        token.idToken = account.id_token; // ✅ store Google ID token
      }

      // ✅ ensure email is always saved in token
      if (user?.email) {
        token.email = user.email;
      }

      // ✅ assign role based on saved email
      token.role = adminEmail.includes(token.email) ? "admin" : "user";

      return token;
    },

    async session({ session, token }) {
      if (token?.accessToken) {
        session.user.accessToken = token.accessToken;
      }
      if (token?.idToken) {
        session.user.idToken = token.idToken; // ✅ expose ID token to client
      }

      session.user.role = token?.role || "user";

      return session;
    },
  },
};

export default NextAuth(authOptions);

// 🔒 Helper function for admin-only routes
export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!adminEmail.includes(session?.user?.email)) {
    res.status(401).json({ error: "Not authorized as admin" });
    throw new Error("Not authorized as admin");
  }
}
