"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"
import { theme } from "@/lib/theme"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Create user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        name,
        tier: "free",
        dailyAnalyses: 0,
        watchlist: [],
        alerts: [],
        createdAt: new Date().toISOString(),
      })

      router.push("/dashboard")
    } catch (error: unknown) {
      console.error("Sign up failed:", error)
      const err = error as { code?: string; message?: string }
      
      // Handle specific Firebase auth errors
      switch (err.code) {
        case 'auth/operation-not-allowed':
          setError("Email/password authentication is not enabled. Please contact support.")
          break
        case 'auth/email-already-in-use':
          setError("An account with this email already exists.")
          break
        case 'auth/invalid-email':
          setError("Invalid email address.")
          break
        case 'auth/weak-password':
          setError("Password should be at least 6 characters long.")
          break
        default:
          setError(err.message || "Sign up failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`relative min-h-screen flex items-center justify-center ${theme.backgrounds.main} overflow-hidden p-4`}>
      {/* Stars background */}
      <div className="fixed inset-0 stars-bg pointer-events-none"></div>

      {/* Corner frame accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white/30 z-20"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/30 z-20"></div>

      {/* Signup Card */}
      <div className={`relative ${theme.backgrounds.card} border ${theme.borders.default} p-8 w-full max-w-md`}>
        {/* Top decorative line */}
        <div className="flex items-center gap-2 mb-6 opacity-60">
          <div className={theme.decorative.divider}></div>
          <span className={`${theme.text.tiny} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>REGISTER</span>
          <div className="flex-1 h-px bg-white"></div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-white" />
          <h1 className={`${theme.text.xlarge} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} italic transform -skew-x-12`}>
            TOKENGUARD
          </h1>
        </div>

        <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} mb-6 text-center ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
          Create Account
        </h2>

        {error && (
          <div className={`mb-4 p-3 border ${theme.status.danger.border} ${theme.status.danger.bg} ${theme.status.danger.text} ${theme.text.small} ${theme.fonts.mono}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="name" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 ${theme.inputs.default}`}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 ${theme.inputs.default}`}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 ${theme.inputs.default}`}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full ${theme.buttons.primary} uppercase`}
          >
            {loading ? "CREATING..." : "SIGN UP"}
          </Button>
        </form>

        <div className={`mt-6 text-center ${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small}`}>
          Already have an account?{" "}
          <Link href="/login" className={`${theme.text.primary} hover:underline`}>
            Log In
          </Link>
        </div>

        {/* Bottom decorative line */}
        <div className="flex items-center gap-2 mt-6 opacity-40">
          <span className={`${theme.text.primary} ${theme.text.tiny} ${theme.fonts.mono}`}>{theme.decorative.infinity}</span>
          <div className="flex-1 h-px bg-white"></div>
          <span className={`${theme.text.primary} ${theme.text.tiny} ${theme.fonts.mono}`}>NEW.USER</span>
        </div>
      </div>

      <style jsx>{`
        .stars-bg {
          background-image: 
            radial-gradient(1px 1px at 20% 30%, white, transparent),
            radial-gradient(1px 1px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(1px 1px at 90% 60%, white, transparent),
            radial-gradient(1px 1px at 33% 80%, white, transparent),
            radial-gradient(1px 1px at 15% 60%, white, transparent),
            radial-gradient(1px 1px at 70% 40%, white, transparent);
          background-size: 200% 200%, 180% 180%, 250% 250%, 220% 220%, 190% 190%, 240% 240%, 210% 210%, 230% 230%;
          background-position: 0% 0%, 40% 40%, 60% 60%, 20% 20%, 80% 80%, 30% 30%, 70% 70%, 50% 50%;
          opacity: 0.3;
        }
      `}</style>
    </div>
  )
}
