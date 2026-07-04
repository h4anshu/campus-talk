import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-')
}

export function getInitials(name: string | null | undefined) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const initials = parts.length > 1
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2)
  return initials.toUpperCase()
}

// Blueprint theme only allows blue/gray tones for avatars — deterministically
// pick one from a fixed palette so the same user always gets the same color.
const AVATAR_PALETTE = ['#4D8EF5', '#2C3555', '#5B6584', '#1D4ED8', '#444860']

export function getAvatarColor(seed: string | null | undefined) {
  if (!seed) return AVATAR_PALETTE[0]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}
