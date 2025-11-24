"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type Role = "COMMUNITY_USER" | "VOLUNTEER" | "NGO" | "GOVERNMENT_AGENCY" | "ADMIN"

type ChatMessage = {
  id: string
  author: "user" | "bot"
  text: string
  ts: number
}

const SUGGESTIONS: Record<Role, string[]> = {
  COMMUNITY_USER: [
    "How do I report an incident?",
    "What details should I include in a report?",
    "How do I track my incident status?",
    "Can I upload photos or video?",
  ],
  VOLUNTEER: [
    "Where do I see assigned incidents?",
    "How do I update my response?",
    "How do I mark an allocation completed?",
  ],
  NGO: [
    "Where do I see assigned incidents?",
    "How do we coordinate resources?",
    "How do I update my response?",
  ],
  GOVERNMENT_AGENCY: [
    "Where do I see assigned incidents?",
    "How do I attend to an assigned incident?",
    "How do I update incident status?",
  ],
  ADMIN: [
    "How do I allocate resources?",
    "Where do I manage users?",
    "How do I verify incidents?",
  ],
}

function botReply(role: Role, question: string): { text: string; navigateTo?: string } {
  const q = question.toLowerCase()

  // Community: Reporting guidance
  if (role === "COMMUNITY_USER") {
    // Prioritize answering the specific "details to include" question
    if (
      q.includes("detail") ||
      q.includes("include") ||
      q.includes("required") ||
      q.includes("field")
    ) {
      return {
        text:
          "Include: a clear title, incident type, severity (if known), precise location/address, thorough description of what happened, and any photos/videos. Optionally add your contact info, medical ID, or emergency contact if relevant. Accurate details help responders act faster. I can take you to the report form.",
        navigateTo: "/incidents/report",
      }
    }
    // Status tracking should NOT be overridden by generic incident wording
    if (q.includes("track") || q.includes("status") || q.includes("progress")) {
      return {
        text:
          "To track your incident: 1) Go to Incidents → My Incident Reports, 2) Open your report to see current status (Pending/Verified/Resolved), resource allocations, and the timeline, 3) You’ll also receive notifications when status or allocations change. I can take you there.",
        navigateTo: "/incidents",
      }
    }
    // Media attachments guidance
    if (q.includes("photo") || q.includes("video") || q.includes("upload")) {
      return {
        text:
          "Yes, you can upload photos and videos while reporting. Use the media section on the report page to attach files."
      }
    }
    // Reporting guidance — avoid catching unrelated questions with the word "incident"
    if (q.includes("report") || q.includes("submit") || q.includes("create")) {
      return {
        text:
          "To report an incident: 1) Go to Incidents → Report, 2) Add title, type, location, and description, 3) Attach photos/video if available, 4) Submit. I can take you there.",
        navigateTo: "/incidents/report",
      }
    }
    return {
      text:
        "I can help you report incidents and track their status. Ask about reporting, required details, attachments, or tracking status."
    }
  }

  // Org roles: attending allocations and updating
  if (["VOLUNTEER", "NGO", "GOVERNMENT_AGENCY"].includes(role)) {
    // Mark allocation completed
    if (q.includes("complete") || q.includes("completed") || q.includes("mark complete")) {
      return {
        text:
          "To mark an allocation completed: 1) Go to Incidents → Assigned Incidents, 2) Open the incident, 3) Use the actions to update your allocation status to Completed, 4) Add a brief note if needed. This helps admins and reporters know the work is done.",
        navigateTo: "/incidents",
      }
    }
    if (q.includes("assigned") || q.includes("view incidents") || q.includes("incidents")) {
      return {
        text:
          "To see incidents assigned to you: go to Incidents. Your view shows ‘Assigned Incidents’. Open one to see details and allocated resources.",
        navigateTo: "/incidents",
      }
    }
    if (q.includes("attend") || q.includes("respond") || q.includes("allocation")) {
      return {
        text:
          "To attend an assigned incident: 1) Open the incident from your ‘Assigned Incidents’, 2) Review details and location, 3) Coordinate your team/resources, 4) Post status updates or responses in the incident page, 5) Mark progress with your team lead if needed."
      }
    }
    if (q.includes("update") || q.includes("status") || q.includes("response")) {
      return {
        text:
          "You can add updates in the incident’s detail page using the response/status actions. Share challenges, successes, and recommendations as needed."
      }
    }
    return {
      text:
        "I can guide you to your assigned incidents and explain how to attend and update. Ask about viewing assignments, attending, or updating responses."
    }
  }

  // Admin guidance
  if (role === "ADMIN") {
    if (q.includes("allocate") || q.includes("resources")) {
      return {
        text:
          "To allocate resources: open an incident → Allocate button → choose user/org and resource details → confirm. Use Admin Dashboard to browse incidents and users.",
        navigateTo: "/dashboard/admin",
      }
    }
    if (q.includes("manage") || q.includes("users") || q.includes("resources")) {
      return {
        text:
          "Manage users and vet operational roles via Dashboard → Resources. You can filter by role and verification."
      }
    }
    if (q.includes("verify") || q.includes("incidents")) {
      return {
        text:
          "Verify incidents from the Incidents page or Admin Dashboard. Open an incident and use ‘Update Status’ to verify, progress, or resolve."
      }
    }
    return {
      text:
        "I help with allocations, user/resource management, and incident workflows. Ask about allocating, managing users, or verifying incidents."
    }
  }

  // Fallback
  return { text: "How can I help? Ask about reporting, assignments, or updates." }
}

export function HelpChatbot() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  const role: Role | null = useMemo(() => {
    const r = session?.user?.role as Role | undefined
    return r ?? null
  }, [session])

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, open])

  // Initial greeting per role
  useEffect(() => {
    if (status !== "authenticated" || !role) return
    setMessages([
      {
        id: crypto.randomUUID(),
        author: "bot",
        ts: Date.now(),
        text:
          role === "COMMUNITY_USER"
            ? "Hi! I can help you report incidents and track their status."
            : role === "ADMIN"
            ? "Hi! I can help you allocate resources, manage users, and verify incidents."
            : "Hi! I can help you view assigned incidents and guide your response.",
      },
    ])
  }, [status, role])

  if (status !== "authenticated" || !role) return null

  const suggestions = SUGGESTIONS[role]

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      author: "user",
      text,
      ts: Date.now(),
    }
    const reply = botReply(role, text)
    const botMsg: ChatMessage = {
      id: crypto.randomUUID(),
      author: "bot",
      text: reply.text,
      ts: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg, botMsg])
    if (reply.navigateTo) {
      // Small delay to let the message render
      setTimeout(() => router.push(reply.navigateTo!), 200)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-[360px] md:w-[400px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="font-semibold text-gray-900">CBDRA Assistant</div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="max-h-[340px] overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.author === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
                    m.author === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
                >
                  {s}
                </button>
              ))}
            </div>
            <SupportForm onSent={() => {
              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  author: "bot",
                  ts: Date.now(),
                  text: "our agents will get back to you as soon as possible",
                },
              ])
            }} />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 flex items-center gap-2"
          aria-label="Open CDRA Assistant"
        >
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
          Help
        </button>
      )}
    </div>
  )
}

function SupportForm({ onSent }: { onSent: () => void }) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(session?.user?.name || "")
  const [email, setEmail] = useState(session?.user?.email || "")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const validate = () => {
    if (!message.trim()) return "Please enter your question/message."
    if (!email.trim()) return "Please enter your email."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email."
    return ""
  }

  const submit = async () => {
    const v = validate()
    if (v) { setError(v); return }
    setError("")
    setSending(true)
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to send")
      setMessage("")
      setSuccess(true)
      onSent()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to send support request"
      setError(msg)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-blue-700 hover:text-blue-800 underline"
        >
          Can’t find what you need? Contact support
        </button>
      ) : (
        <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
          {success && (
            <div className="mb-2 rounded-md border border-green-200 bg-green-50 text-green-800 text-xs px-3 py-2">
              our agents will get back to you as soon as possible
            </div>
          )}
          <div className="grid grid-cols-1 gap-2 mb-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={success}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={success}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question or issue"
              rows={3}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={success}
            />
          </div>
          {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
          <div className="flex items-center gap-2">
            <button
              onClick={success ? () => setOpen(false) : submit}
              disabled={sending}
              className={`px-3 py-2 rounded-md text-sm text-white ${sending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {sending ? "Sending…" : success ? "Close" : "Send"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-md text-sm border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}