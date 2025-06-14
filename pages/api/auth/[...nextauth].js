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
  secret: process.env.NEXT_PUBLIC_SECRET,
  adapter: MongoDBAdapter(client),
  callbacks: {
    session: async ({ session, token, user }) => {
      if (adminEmail.includes(session?.user?.email)) {
        return session;
      } else {
        return false;
      }
    },
  },
};
export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!adminEmail.includes(session?.user?.email)) {
    res.status(401);
    res.end();
    throw new Error("Not authorized as admin");
  }
}
