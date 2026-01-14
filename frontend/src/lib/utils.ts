import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Bot is considered offline if no updates for more than 2 minutes
const OFFLINE_THRESHOLD_MS = 2 * 60 * 1000

export function isBotOnline(lastUpdate: string | undefined | null): boolean {
  if (!lastUpdate) return false

  const lastUpdateTime = new Date(lastUpdate).getTime()
  const now = Date.now()

  return (now - lastUpdateTime) < OFFLINE_THRESHOLD_MS
}

export function getBotOnlineStatus(lastUpdate: string | undefined | null): 'online' | 'offline' | 'unknown' {
  if (!lastUpdate) return 'unknown'
  return isBotOnline(lastUpdate) ? 'online' : 'offline'
}
