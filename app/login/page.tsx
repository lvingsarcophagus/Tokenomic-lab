"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"
import { theme } from "@/lib/theme"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && userProfile) {
      console.log('[Login] User already logged in, redirecting')
      if (userProfile.plan === 'PREMIUM') {
        router.replace('/premium')
      } else {
        router.replace('/free-dashboard')
      }
    }
  }, [user, userProfile, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Wait a bit for auth context to update
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (error: unknown) {
      console.error("Login failed:", error)
      const err = error as { code?: string; message?: string }
      
      // Handle specific Firebase auth errors
      switch (err.code) {
        case 'auth/operation-not-allowed':
          setError("Email/password authentication is not enabled. Please contact support.")
          break
        case 'auth/user-not-found':
          setError("No account found with this email address.")
          break
        case 'auth/wrong-password':
          setError("Incorrect password.")
          break
        case 'auth/invalid-email':
          setError("Invalid email address.")
          break
        case 'auth/user-disabled':
          setError("This account has been disabled.")
          break
        default:
          setError("Login failed. Please check your credentials.")
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

      {/* Login Card */}
      <div className={`relative ${theme.backgrounds.card} border ${theme.borders.default} p-8 w-full max-w-md`}>
        {/* Top decorative line */}
        <div className="flex items-center gap-2 mb-6 opacity-60">
          <div className={theme.decorative.divider}></div>
          <span className={`${theme.text.tiny} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>ACCESS</span>
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
          Welcome Back
        </h2>

        {error && (
          <div className={`mb-4 p-3 border ${theme.status.danger.border} ${theme.status.danger.bg} ${theme.status.danger.text} ${theme.text.small} ${theme.fonts.mono}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full ${theme.buttons.primary} uppercase`}
          >
            {loading ? "ACCESSING..." : "LOG IN"}
          </Button>
        </form>

        <div className={`mt-6 text-center ${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small}`}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={`${theme.text.primary} hover:underline`}>
            Sign Up
          </Link>
        </div>

        {/* Bottom decorative line */}
        <div className="flex items-center gap-2 mt-6 opacity-40">
          <span className={`${theme.text.primary} ${theme.text.tiny} ${theme.fonts.mono}`}>{theme.decorative.infinity}</span>
          <div className="flex-1 h-px bg-white"></div>
          <span className={`${theme.text.primary} ${theme.text.tiny} ${theme.fonts.mono}`}>SECURE.LOGIN</span>
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
