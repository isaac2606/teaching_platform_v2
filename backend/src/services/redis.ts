import "dotenv/config";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client using credentials from .env
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const GLOBAL_ONLINE_KEY = "online_users";

/**
 * Tracks a new socket connection for a user.
 * Returns true if this is the user's FIRST active connection (offline -> online).
 */
export async function addConnection(userId: string, socketId: string): Promise<boolean> {
  const userConnectionsKey = `user:connections:${userId}`;

  // 1. Add socketId to the user's active connections set
  await redis.sadd(userConnectionsKey, socketId);

  // 2. Add the user to the global online directory
  await redis.sadd(GLOBAL_ONLINE_KEY, userId);

  // 3. Set a safety TTL (24h) to avoid orphan keys if a server ever abruptly crashes
  await redis.expire(userConnectionsKey, 86400);

  // 4. Check how many connections this user now has
  const count = await redis.scard(userConnectionsKey);

  // Returns true only when count is 1 (first tab opened)
  return count === 1;
}

/**
 * Removes a socket connection when a tab closes or client disconnects.
 * Returns true if this was the user's LAST connection (online -> offline).
 */
export async function removeConnection(userId: string, socketId: string): Promise<boolean> {
  const userConnectionsKey = `user:connections:${userId}`;

  // 1. Remove the disconnecting socketId
  await redis.srem(userConnectionsKey, socketId);

  // 2. Check how many active connections remain for this user
  const remainingCount = await redis.scard(userConnectionsKey);

  // 3. If zero tabs/sockets remain, remove user from global online directory
  if (remainingCount === 0) {
    await redis.srem(GLOBAL_ONLINE_KEY, userId);
    return true; // User is now officially offline
  }

  return false; // Still has another tab open
}

/**
 * Returns all currently online user IDs.
 */
export async function getOnlineUsers(): Promise<string[]> {
  const members = await redis.smembers(GLOBAL_ONLINE_KEY);
  return (members as string[]) || [];
}

/**
 * Checks if a specific user is currently online.
 */
export async function isUserOnline(userId: string): Promise<boolean> {
  const isMember = await redis.sismember(GLOBAL_ONLINE_KEY, userId);
  return isMember === 1;
}