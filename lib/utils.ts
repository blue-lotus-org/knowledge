import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to safely access localStorage (avoiding SSR issues)
export function getLocalStorage(key: string, defaultValue = ""): string {
  if (typeof window === "undefined") {
    return defaultValue
  }
  return localStorage.getItem(key) || defaultValue
}

export function setLocalStorage(key: string, value: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value)
  }
}

