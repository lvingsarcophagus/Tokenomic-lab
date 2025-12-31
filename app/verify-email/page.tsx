"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { sendEmailVerification, onAuthStateChanged } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Shield, Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { theme } from "@/lib/theme"
import Navbar from "@/components/navbar"

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [checking, setChecking] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // No user logged in, redirect to login
        router.push('/login')
      } else if (user.emailVerified) {
        // Email already verified, redirect to dashboard
        router.push('/dashboard')
      } else {
        setUserEmail(user.email || "")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleResendEmail = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const user = auth.currentUser
      if (!user) {
        setError("No user logged in")
        return
      }

      await sendEmailVerification(user, {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: false
      })

      setSuccess("Verification email sent! Please check your inbox.")
    } catch (err: any) {
      console.error("Failed to send verification email:", err)
      if (err.code === 'auth/too-many-requests') {
        setError("Too many requests. Please wait a few minutes before trying again.")
      } else {
        setError(err.message || "Failed to send verification email")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCheckVerification = async () => {
    setChecking(true)
    setError("")

    try {
      const user = auth.currentUser
      if (!user) {
        setError("No user logged in")
        return
      }

      // Reload user to get latest emailVerified status
      await user.reload()
      
      if (user.emailVerified) {
        setSuccess("Email verified! Redirecting to dashboard...")
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        setError("Email not verified yet. Please check your inbox and click the verification link.")
      }
    } catch (err: any) {
      console.error("Failed to check verification:", err)
      setError(err.message || "Failed to check verification status")
    } finally {
      setChecking(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className={`relative min-h-screen flex items-center justify-center ${theme.backgrounds.main} overflow-hidden p-4`}>
        {/* Stars background */}
        <div className="fixed inset-0 stars-bg pointer-events-none"></div>

        {/* Corner frame accents */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/30 z-20"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white/30 z-20"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white/30 z-20"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/30 z-20"></div>

        {/* Verification Card */}
        <div className={`relative ${theme.backgrounds.card} border ${theme.borders.default} p-8 w-full max-w-md`}>
          {/* Top decorative line */}
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <div className={theme.decorative.divider}></div>
            <span className={`${theme.text.tiny} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>VERIFY EMAIL</span>
            <div className="flex-1 h-px bg-white"></div>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Mail className="w-8 h-8 text-white" />
            <h1 className={`${theme.text.xlarge} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} italic transform -skew-x-12`}>
              TOKENGUARD
            </h1>
          </div>

          <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} mb-6 text-center ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
            Verify Your Email
          </h2>

          {/* Info Message */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`${theme.text.small} text-blue-400 ${theme.fonts.mono} font-bold mb-2`}>
                  CHECK YOUR INBOX
                </p>
                <p className={`${theme.text.tiny} text-white/70 ${theme.fonts.mono}`}>
                  We've sent a verification email to:
                </p>
                <p className={`${theme.text.small} text-white ${theme.fonts.mono} mt-1 break-all`}>
                  {userEmail}
                </p>
                <p className={`${theme.text.tiny} text-white/70 ${theme.fonts.mono} mt-3`}>
                  Click the link in the email to verify your account and access the platform.
                </p>
              </div>
            </div>
          </div>

          {success && (
            <div className={`mb-4 p-3 border border-green-500/30 bg-green-500/10 flex items-start gap-2`}>
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className={`${theme.text.small} text-green-400 ${theme.fonts.mono}`}>
                {success}
              </p>
            </div>
          )}

          {error && (
            <div className={`mb-4 p-3 border ${theme.status.danger.border} ${theme.status.danger.bg} flex items-start gap-2`}>
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className={`${theme.status.danger.text} ${theme.text.small} ${theme.fonts.mono}`}>
                {error}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleCheckVerification}
              disabled={checking}
              className={`w-full ${theme.buttons.primary} uppercase`}
            >
              {checking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  CHECKING...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I'VE VERIFIED MY EMAIL
                </>
              )}
            </Button>

            <Button
              onClick={handleResendEmail}
              disabled={loading}
              variant="outline"
              className="w-full border-2 border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-mono tracking-wider uppercase"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  SENDING...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  RESEND EMAIL
                </>
              )}
            </Button>
          </div>

          <div className={`mt-6 text-center ${theme.text.secondary} ${theme.fonts.mono} ${theme.text.tiny}`}>
            <p className="mb-2">Didn't receive the email?</p>
            <ul className="space-y-1 text-left list-disc list-inside">
              <li>Check your spam/junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and try resending</li>
            </ul>
          </div>

          {/* Bottom decorative line */}
          <div className="flex items-center gap-2 mt-6 opacity-40">
            <span className={`${theme.text.primary} ${theme.text.tiny} ${theme.fonts.mono}`}>{theme.decorative.infinity}</span>
            <div className="flex-1 h-px bg-white"></div>
            <span className={`${theme.text.primary} ${theme.text.tiny} ${theme.fonts.mono}`}>VERIFY.EMAIL</span>
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
    </>
  )
}
