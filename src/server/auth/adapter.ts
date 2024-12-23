import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import type { Adapter, AdapterUser } from "next-auth/adapters";

export function CustomPrismaAdapter(p: PrismaClient): Adapter {
  const prismaAdapter = PrismaAdapter(p);

  return {
    ...prismaAdapter,
    createUser: async (data: AdapterUser): Promise<AdapterUser> => {
      if (!data.email) throw new Error("Email is required");

      const user = await p.user.create({
        data: {
          email: data.email,
          name: data.name ?? null,
          emailVerified: data.emailVerified,
          image: data.image ?? null,
          firstName: data.name?.split(" ")[0] ?? null,
          lastName: data.name?.split(" ").slice(1).join(" ") ?? null,
          profileImage: data.image ?? null,
          hashedPassword: null,
        },
      });

      const adapterUser: AdapterUser = {
        id: user.id,
        email: user.email ?? "",
        emailVerified: user.emailVerified,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
      };

      return adapterUser;
    },
    getUser: async (id): Promise<AdapterUser | null> => {
      const user = await p.user.findUnique({ where: { id } });
      if (!user?.email) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
      };
    },
    getUserByEmail: async (email): Promise<AdapterUser | null> => {
      const user = await p.user.findUnique({ where: { email } });
      if (!user?.email) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
      };
    },
  };
} 