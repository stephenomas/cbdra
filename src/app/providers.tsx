"use client"

import { SessionProvider } from "next-auth/react"
import { IdleLogout } from "@/components/auth/idle-logout"
import { HelpChatbot } from "@/components/help/chatbot"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <IdleLogout />
      <HelpChatbot />
      {children}
    </SessionProvider>
  )
}