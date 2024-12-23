import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";

export const credentialsProvider = CredentialsProvider({
  id: "credentials",
  name: "credentials",
  credentials: {
    email: { 
      label: "Email", 
      type: "email",
      placeholder: "hello@example.com",
    },
    password: { 
      label: "Password", 
      type: "password",
      placeholder: "••••••••",
    },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error("Invalid credentials");
    }

    try {
      const user = await db.user.findUnique({
        where: { 
          email: credentials.email as string 
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          hashedPassword: true,
        },
      });

      if (!user?.hashedPassword) {
        throw new Error("Invalid credentials");
      }

      const isPasswordValid = await compare(
        credentials.password as string,
        user.hashedPassword
      );

      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  },
}); 