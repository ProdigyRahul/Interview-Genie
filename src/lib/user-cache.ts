import { db } from "@/server/db";
import { userCache } from "@/server/redis";
import type { User, Prisma } from "@prisma/client";

// In-memory cache for the current request
const requestCache = new Map<string, Partial<User>>();

// Type for user select fields
type UserSelect = {
  id: true;
  email: true;
  name: true;
  image: true;
  credits: true;
  subscriptionStatus: true;
  isVerified: true;
  [key: string]: boolean;
};

type UserIdentifier = 
  | { id: string; email?: never }
  | { email: string; id?: never };

export async function getUser(
  identifier: UserIdentifier,
  select: UserSelect = {
    id: true,
    email: true,
    name: true,
    image: true,
    credits: true,
    subscriptionStatus: true,
    isVerified: true,
  }
) {
  const cacheKey = 'id' in identifier 
    ? `id:${identifier.id}` 
    : `email:${identifier.email}`;

  // Check request cache first
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  // Check Redis cache
  const cachedUser = await userCache.get(cacheKey);
  if (cachedUser) {
    requestCache.set(cacheKey, cachedUser);
    return cachedUser;
  }

  // Fetch from database
  const where: Prisma.UserWhereUniqueInput = 
    'id' in identifier 
      ? { id: identifier.id }
      : { email: identifier.email };

  const user = await db.user.findUnique({
    where,
    select,
  });

  if (user) {
    // Cache in both request and Redis
    requestCache.set(cacheKey, user);
    await userCache.set(cacheKey, user);
  }

  return user;
}

export async function invalidateUserCache(user: { id: string; email: string }) {
  // Clear request cache
  requestCache.delete(`id:${user.id}`);
  requestCache.delete(`email:${user.email}`);

  // Clear Redis cache
  await Promise.all([
    userCache.delete(`id:${user.id}`),
    userCache.delete(`email:${user.email}`),
  ]);
}

// Clear request cache (should be called at the start of each request)
export function clearRequestCache() {
  requestCache.clear();
} 