"use client"

import { useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"

// Inactivity logout guard: signs out after 1 minute without user input.
const INACTIVITY_LIMIT_MS = 1 * 60 * 1000 // 1 minute
const STORAGE_KEY = "cdra:lastActivityAt"

export function IdleLogout() {
  const { status } = useSession()
  const timerRef = useRef<number | null>(null)

  // Record an activity timestamp both locally and across tabs
  const recordActivity = () => {
    try {
      const now = Date.now()
      localStorage.setItem(STORAGE_KEY, String(now))
      resetTimer(now)
    } catch {
      // Ignore storage errors (e.g., private mode)
      resetTimer(Date.now())
    }
  }

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const resetTimer = (lastActivity: number) => {
    clearTimer()
    const now = Date.now()
    const elapsed = now - lastActivity
    const remaining = Math.max(INACTIVITY_LIMIT_MS - elapsed, 0)
    timerRef.current = window.setTimeout(() => {
      // Only sign out when authenticated
      if (status === "authenticated") {
        signOut({ callbackUrl: "/auth/signin" })
      }
    }, remaining)
  }

  useEffect(() => {
    if (status !== "authenticated") {
      // Not logged in; no inactivity tracking
      clearTimer()
      return
    }

    // Initialize last activity timestamp with a safe default on fresh authentication
    const now = Date.now()
    let last = now
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (!Number.isNaN(parsed)) {
          const elapsed = now - parsed
          // If stored activity is older than the inactivity limit, reset to 'now' to avoid instant sign-out on re-login
          if (elapsed >= INACTIVITY_LIMIT_MS) {
            localStorage.setItem(STORAGE_KEY, String(now))
            last = now
          } else {
            last = parsed
          }
        } else {
          localStorage.setItem(STORAGE_KEY, String(now))
          last = now
        }
      } else {
        localStorage.setItem(STORAGE_KEY, String(now))
        last = now
      }
    } catch {
      // On storage errors, default to current time
      last = now
    }
    resetTimer(last)

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && typeof e.newValue === "string") {
        const parsed = parseInt(e.newValue, 10)
        if (!Number.isNaN(parsed)) {
          resetTimer(parsed)
        }
      }
    }

    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ]

    activityEvents.forEach((evt) => window.addEventListener(evt, recordActivity, { passive: true }))
    window.addEventListener("storage", onStorage)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        recordActivity()
      }
    })

    return () => {
      clearTimer()
      activityEvents.forEach((evt) => window.removeEventListener(evt, recordActivity))
      window.removeEventListener("storage", onStorage)
    }
  }, [status])

  return null
}