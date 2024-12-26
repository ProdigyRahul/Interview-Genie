import NextAuth from "next-auth";
import { config } from "@/lib/auth";

const nextAuth = NextAuth(config);

export const {
  auth,
  signIn,
  signOut,
} = nextAuth;

// Export handlers for API route
export const { GET, POST } = nextAuth.handlers;
