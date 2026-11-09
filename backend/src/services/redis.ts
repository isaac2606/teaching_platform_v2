import "dotenv/config";
import { Redis } from "@upstash/redis";

// Check if Upstash credentials are provided in .env
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Upstash Redis client if credentials exist
export const redis = (redisUrl && redisToken)
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

const GLOBAL_ONLINE_KEY = "online_users";

// In-memory fallback stores for offline / local resilience
const localOnlineUsers = new Set<string>();
const localUserConnections = new Map<string, Set<string>>();

/**
 * Tracks a new socket connection for a user.
 * Returns true if this is the user's FIRST active connection (offline -> online).
 */
export async function addConnection(userId: string, socketId: string): Promise<boolean> {
  if (redis) {
    try {
      const userConnectionsKey = `user:connections:${userId}`;
      await redis.sadd(userConnectionsKey, socketId);
      await redis.sadd(GLOBAL_ONLINE_KEY, userId);
      await redis.expire(userConnectionsKey, 86400);

      const count = await redis.scard(userConnectionsKey);
      return count === 1;
    } catch (err) {
      // Redis call failed, fall through to in-memory fallback
    }
  }

  // --- In-Memory Fallback ---
  let userSockets = localUserConnections.get(userId);
  if (!userSockets) {
    userSockets = new Set();
    localUserConnections.set(userId, userSockets);
  }
  userSockets.add(socketId);
  localOnlineUsers.add(userId);

  return userSockets.size === 1;
}

/**
 * Removes a socket connection when a tab closes or client disconnects.
 * Returns true if this was the user's LAST connection (online -> offline).
 */
export async function removeConnection(userId: string, socketId: string): Promise<boolean> {
  if (redis) {
    try {
      const userConnectionsKey = `user:connections:${userId}`;
      await redis.srem(userConnectionsKey, socketId);

      const remainingCount = await redis.scard(userConnectionsKey);
      if (remainingCount === 0) {
        await redis.srem(GLOBAL_ONLINE_KEY, userId);
        return true;
      }
      return false;
    } catch (err) {
      // Redis call failed, fall through to in-memory fallback
    }
  }

  // --- In-Memory Fallback ---
  const userSockets = localUserConnections.get(userId);
  if (!userSockets) return false;

  userSockets.delete(socketId);
  if (userSockets.size === 0) {
    localUserConnections.delete(userId);
    localOnlineUsers.delete(userId);
    return true; // Last connection removed -> user is offline
  }

  return false;
}

/**
 * Returns all currently online user IDs.
 */
export async function getOnlineUsers(): Promise<string[]> {
  if (redis) {
    try {
      const members = await redis.smembers(GLOBAL_ONLINE_KEY);
      return (members as string[]) || [];
    } catch (err) {
      // Fall through to in-memory fallback
    }
  }

  return Array.from(localOnlineUsers);
}

/**
 * Checks if a specific user is currently online.
 */
export async function isUserOnline(userId: string): Promise<boolean> {
  if (redis) {
    try {
      const isMember = await redis.sismember(GLOBAL_ONLINE_KEY, userId);
      return isMember === 1;
    } catch (err) {
      // Fall through to in-memory fallback
    }
  }

  return localOnlineUsers.has(userId);
}
