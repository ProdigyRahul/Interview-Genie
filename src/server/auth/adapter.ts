import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import type { Adapter, AdapterUser } from "next-auth/adapters";

export function CustomPrismaAdapter(p: PrismaClient): Adapter {
  const prismaAdapter = PrismaAdapter(p) as Adapter;

  return {
    ...prismaAdapter,
    createUser: async (data) => {
      const user = await p.user.create({
        data: {
          email: data.email,
          name: data.name ?? null,
          image: data.image ?? null,
          emailVerified: data.emailVerified,
          credits: 100, // Default credits for new users
          subscriptionStatus: "free", // Default subscription status
          isVerified: false, // Default verification status
        },
      });

      return {
        id: user.id,
        email: user.email ?? "",
        name: user.name ?? "",
        emailVerified: user.emailVerified,
        image: user.image ?? "",
        credits: user.credits,
        subscriptionStatus: user.subscriptionStatus,
        isVerified: user.isVerified,
      } as AdapterUser;
    },
    getUser: async (id) => {
      const user = await p.user.findUnique({ where: { id } });
      if (!user) return null;

      return {
        id: user.id,
        email: user.email ?? "",
        name: user.name ?? "",
        emailVerified: user.emailVerified,
        image: user.image ?? "",
        credits: user.credits,
        subscriptionStatus: user.subscriptionStatus,
        isVerified: user.isVerified,
      } as AdapterUser;
    },
    getUserByEmail: async (email) => {
      const user = await p.user.findUnique({ where: { email } });
      if (!user) return null;

      return {
        id: user.id,
        email: user.email ?? "",
        name: user.name ?? "",
        emailVerified: user.emailVerified,
        image: user.image ?? "",
        credits: user.credits,
        subscriptionStatus: user.subscriptionStatus,
        isVerified: user.isVerified,
      } as AdapterUser;
    },
    getUserByAccount: async ({ provider, providerAccountId }) => {
      const account = await p.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: { user: true },
      });
      if (!account) return null;

      const { user } = account;
      return {
        id: user.id,
        email: user.email ?? "",
        name: user.name ?? "",
        emailVerified: user.emailVerified,
        image: user.image ?? "",
        credits: user.credits,
        subscriptionStatus: user.subscriptionStatus,
        isVerified: user.isVerified,
      } as AdapterUser;
    },
  };
} 