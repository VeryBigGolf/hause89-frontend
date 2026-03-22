import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import userLogIn from "@/libs/userLogIn";
import { JWT } from "next-auth/jwt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const response = await userLogIn(
            credentials.email,
            credentials.password,
          );
          if (response.success && response.token) {
            // Return user data that will be stored in the JWT
            return {
              id: response._id || response.data?._id,
              _id: response._id || response.data?._id,
              name: response.name || response.data?.name,
              email: response.email || response.data?.email,
              tel: response.tel || response.data?.tel,
              role: response.role || response.data?.role,
              token: response.token,
              createdAt:
                response.createdAt ||
                response.data?.createdAt ||
                new Date().toISOString(),
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }): JWT {
      if (user) {
        token._id = (user as any)._id;
        token.name = user.name ?? "";
        token.email = user.email ?? "";
        token.tel = (user as any).tel;
        token.role = (user as any).role;
        token.token = (user as any).token;
        token.createdAt = (user as any).createdAt;
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        _id: token._id,
        name: token.name || "",
        email: token.email || "",
        tel: token.tel,
        role: token.role,
        token: token.token,
        createdAt: token.createdAt,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
