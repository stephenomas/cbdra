import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        // Check if email is verified (admins are exempt)
        if (!user.emailVerified && user.role !== "ADMIN") {
          throw new Error("Please verify your email before signing in.")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image || undefined,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.image = user.image ?? null
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        // Fetch latest user data to keep session in sync (e.g., avatar changes)
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub! },
            select: { image: true, role: true, name: true }
          })
          if (dbUser) {
            session.user.role = dbUser.role
            session.user.image = dbUser.image ?? null
            if (dbUser.name) {
              session.user.name = dbUser.name
            }
          } else {
            // Fallback to token values if user not found
            session.user.role = token.role
            session.user.image = token.image ?? null
          }
        } catch {
          // On error, keep existing token-derived values
          session.user.role = token.role
          session.user.image = token.image ?? null
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin"
  }
}