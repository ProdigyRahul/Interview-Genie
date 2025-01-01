import { db } from "@/lib/db";
import { cache, revalidateTag } from "./redis";

export { cache, revalidateTag };

export function createCachedResponse(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

// Cache user data fetching
export const getUserData = (userId: string) => cache(
  ["user", userId],
  async () => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isProfileComplete: true,
        profileProgress: true,
      },
    });
    return user;
  },
  {
    tags: ["user", `user-${userId}`],
    revalidate: 300, // Cache for 5 minutes
  }
);

// Cache profile data fetching
export const getProfileData = (userId: string) => cache(
  ["profile", userId],
  async () => {
    const profile = await db.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        phoneNumber: true,
        gender: true,
        country: true,
        state: true,
        city: true,
        pinCode: true,
        workStatus: true,
        experience: true,
        education: true,
        industry: true,
        ageGroup: true,
        aspiration: true,
        hardSkills: true,
        image: true,
        profileProgress: true,
        isProfileComplete: true,
      },
    });
    return profile;
  },
  {
    tags: ["profile", `user-${userId}`],
    revalidate: 300, // Cache for 5 minutes
  }
); 