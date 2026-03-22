import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import userLogIn from "@/libs/userLogIn";
import getUserProfile from "@/libs/getUserProfile";
import { JWT } from "next-auth/jwt";

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: "user" | "admin";
  token: string;
  createdAt: string;
};

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
          const token = response?.token || response?.data?.token;

          if (!token) return null;

          let profile = response?.data?.user || response?.user || response?.data || response;

          if (!profile?._id) {
            try {
              const profileResponse = await getUserProfile(token);
              profile = profileResponse?.data || profile;
            } catch {
              // Keep login working even if profile fetch fails.
            }
          }

          if (!profile?._id) return null;

          return {
            id: profile._id,
            _id: profile._id,
            name: profile.name || "",
            email: profile.email || credentials.email,
            tel: profile.tel || "",
            role: profile.role || "user",
            token,
            createdAt: profile.createdAt || new Date().toISOString(),
          };
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
        const authUser = user as unknown as AuthUser;
        token._id = authUser._id;
        token.name = authUser.name ?? "";
        token.email = authUser.email ?? "";
        token.tel = authUser.tel;
        token.role = authUser.role;
        token.token = authUser.token;
        token.createdAt = authUser.createdAt;
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
