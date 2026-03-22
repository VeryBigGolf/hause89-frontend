import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      name: string;
      email: string;
      tel: string;
      role: "user" | "admin";
      token: string;
      createdAt: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    name: string;
    email: string;
    tel: string;
    role: "user" | "admin";
    token: string;
    createdAt: string;
  }
}
