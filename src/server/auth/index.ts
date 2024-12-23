import NextAuth from "next-auth";
import { authConfig } from "./config";

const nextAuth = NextAuth(authConfig);

export const {
  auth,
  signIn,
  signOut,
} = nextAuth;

// Export handlers for API route
export const { GET, POST } = nextAuth.handlers;
