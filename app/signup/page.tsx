"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Check, X, AlertCircle } from "lucide-react"
import { theme } from "@/lib/theme"
import { analyticsEvents } from "@/lib/firebase-analytics"
import Navbar from "@/components/navbar"
import { logAuth } from "@/lib/services/activity-logger"

// Rate limiting configuration
const RATE_LIMIT_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes

interface PasswordStrength {
  score: number // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent'
  color: string
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
    unique: boolean
  }
}

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [rateLimitMessage, setRateLimitMessage] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordMatchError, setPasswordMatchError] = useState("")
  const router = useRouter()

  // Check rate limiting on component mount
  useEffect(() => {
    checkRateLimit()
  }, [])

  // Calculate password strength whenever password changes
  useEffect(() => {
    if (password.length > 0) {
      const strength = calculatePasswordStrength(password)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(null)
    }
  }, [password])

  // Validate email format in real-time
  useEffect(() => {
    if (email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setEmailError("Invalid email format")
      } else {
        setEmailError("")
      }
    } else {
      setEmailError("")
    }
  }, [email])

  // Check password match in real-time
  useEffect(() => {
    if (confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        setPasswordMatchError("Passwords do not match")
      } else {
        setPasswordMatchError("")
      }
    } else {
      setPasswordMatchError("")
    }
  }, [password, confirmPassword])

  const checkRateLimit = () => {
    const attempts = JSON.parse(localStorage.getItem('signup_attempts') || '[]')
    const now = Date.now()
    
    // Clean old attempts
    const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW)
    
    // Check if locked out
    const lockoutUntil = localStorage.getItem('signup_lockout')
    if (lockoutUntil && now < parseInt(lockoutUntil)) {
      const remainingMinutes = Math.ceil((parseInt(lockoutUntil) - now) / 60000)
      setIsRateLimited(true)
      setRateLimitMessage(`Too many attempts. Please try again in ${remainingMinutes} minutes.`)
      return false
    }
    
    // Check rate limit
    if (recentAttempts.length >= RATE_LIMIT_ATTEMPTS) {
      const lockoutTime = now + LOCKOUT_DURATION
      localStorage.setItem('signup_lockout', lockoutTime.toString())
      setIsRateLimited(true)
      setRateLimitMessage(`Too many signup attempts. Please try again in 30 minutes.`)
      return false
    }
    
    localStorage.setItem('signup_attempts', JSON.stringify(recentAttempts))
    setIsRateLimited(false)
    return true
  }

  const recordAttempt = () => {
    const attempts = JSON.parse(localStorage.getItem('signup_attempts') || '[]')
    attempts.push(Date.now())
    localStorage.setItem('signup_attempts', JSON.stringify(attempts))
  }

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    const checks = {
      length: pwd.length >= 12,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      unique: new Set(pwd).size >= pwd.length * 0.6 // At least 60% unique characters
    }

    // Calculate score
    let score = 0
    if (pwd.length >= 8) score += 20
    if (pwd.length >= 12) score += 10
    if (pwd.length >= 16) score += 10
    if (checks.uppercase) score += 15
    if (checks.lowercase) score += 15
    if (checks.number) score += 15
    if (checks.special) score += 15
    if (checks.unique) score += 10

    // Determine level and color
    let level: PasswordStrength['level']
    let color: string
    
    if (score < 40) {
      level = 'weak'
      color = 'bg-red-500'
    } else if (score < 60) {
      level = 'fair'
      color = 'bg-orange-500'
    } else if (score < 75) {
      level = 'good'
      color = 'bg-yellow-500'
    } else if (score < 90) {
      level = 'strong'
      color = 'bg-blue-500'
    } else {
      level = 'excellent'
      color = 'bg-green-500'
    }

    return { score, level, color, checks }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Enhanced Validation with boundary checks
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }
    
    if (email.length > 254) {
      setError("Email address is too long (max 254 characters)")
      setLoading(false)
      return
    }

    // Password validation
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }
    
    if (password.length > 128) {
      setError("Password is too long (max 128 characters)")
      setLoading(false)
      return
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }
    
    // Password strength check
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError("Password must contain uppercase, lowercase, and numbers")
      setLoading(false)
      return
    }

    // Name validation
    if (!name || name.trim().length === 0) {
      setError("Full name is required")
      setLoading(false)
      return
    }
    
    if (name.length > 100) {
      setError("Name is too long (max 100 characters)")
      setLoading(false)
      return
    }
    
    // Sanitize name input
    const sanitizedName = name.trim().replace(/[<>]/g, '')

    // Terms agreement
    if (!agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy")
      setLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Default to FREE plan, check auto-premium
      let userTier: 'FREE' | 'PAY_PER_USE' | 'PREMIUM' = 'FREE'
      let userPlan: 'FREE' | 'PAY_PER_USE' | 'PREMIUM' = 'FREE'
      let redirectPath = '/dashboard'
      
      try {
        const settingsDoc = await getDoc(doc(db, "system", "platform_settings"))
        const settings = settingsDoc.data()
        
        if (settings?.autoPremiumEnabled === true) {
          userTier = "PREMIUM"
          userPlan = "PREMIUM"
          redirectPath = "/premium/dashboard"
          console.log('[Signup] Auto-premium enabled - assigning PREMIUM tier')
        }
      } catch (settingsError) {
        console.error('[Signup] Failed to check auto-premium setting:', settingsError)
        // Continue with selected plan if settings check fails
      }

      // Create user profile in Firestore with enhanced data
      const userDoc: any = {
        uid: userCredential.user.uid,
        email,
        name: sanitizedName,
        tier: userTier,
        plan: userPlan,
        usage: {
          tokensAnalyzed: 0,
          lastResetDate: new Date(),
          dailyLimit: (userTier === "PREMIUM") ? 999999 : 10
        },
      }
      

      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        ...userDoc,
        dailyAnalyses: 0,
        totalAnalyses: 0,
        watchlist: [],
        alerts: [],
        preferences: {
          emailNotifications: true,
          riskAlerts: true,
          priceAlerts: false
        },
        metadata: {
          signupSource: "web",
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
          signupIp: null, // Can be populated via server-side API
          autoPremiumGranted: userTier === "PREMIUM"
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Track signup event
      analyticsEvents.signup('email')
      
      // Log user signup
      await logAuth(userCredential.user.uid, email, 'user_signup')
      
      // Redirect to email verification page instead of dashboard
      router.push('/verify-email')
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

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError("")

    try {
      // Request additional user info scopes
      const provider = new GoogleAuthProvider()
      provider.addScope('profile')
      provider.addScope('email')
      
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))
      
      if (!userDoc.exists()) {
        // Extract user info from Google profile
        const displayName = user.displayName || ""
        const photoURL = user.photoURL || null
        const email = user.email || ""
        
        // Create user profile in Firestore for new Google users with collected info
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: email,
          name: displayName,
          photoURL: photoURL,
          tier: "FREE",
          plan: "FREE",
          role: "user",
          usage: {
            tokensAnalyzed: 0,
            lastResetDate: new Date(),
            dailyLimit: 10
          },
          dailyAnalyses: 0,
          totalAnalyses: 0,
          watchlist: [],
          alerts: [],
          preferences: {
            emailNotifications: true,
            riskAlerts: true,
            priceAlerts: false
          },
          metadata: {
            signupSource: "google",
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
            signupIp: null,
            provider: "google"
          },
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

        // Track signup event
        analyticsEvents.signup('google')
      } else {
        // Update last login time
        await setDoc(doc(db, "users", user.uid), {
          lastLoginAt: new Date().toISOString()
        }, { merge: true })
        
        // Track login event for existing users
        analyticsEvents.login('google')
      }
      
      // Redirect to unified dashboard
      router.push("/dashboard")
    } catch (error: unknown) {
      console.error("Google sign up failed:", error)
      const err = error as { code?: string; message?: string }
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign up cancelled")
      } else if (err.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please allow popups for this site.")
      } else {
        setError(err.message || "Google sign up failed. Please try again.")
      }
    } finally {
      setLoading(false)
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

        {isRateLimited && (
          <div className={`mb-4 p-3 border ${theme.status.danger.border} ${theme.status.danger.bg} flex items-start gap-2`}>
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`${theme.status.danger.text} ${theme.text.small} ${theme.fonts.mono} font-bold`}>
                RATE LIMIT EXCEEDED
              </p>
              <p className={`${theme.status.danger.text} ${theme.text.tiny} ${theme.fonts.mono} mt-1`}>
                {rateLimitMessage}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className={`mb-4 p-3 border ${theme.status.danger.border} ${theme.status.danger.bg} ${theme.status.danger.text} ${theme.text.small} ${theme.fonts.mono}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="name" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= 100) {
                  setName(value)
                }
              }}
              className={`mt-1 ${theme.inputs.default}`}
              placeholder="John Doe"
              maxLength={100}
              required
            />
            {name.length > 80 && (
              <p className={`mt-1 ${theme.text.tiny} ${name.length > 95 ? theme.status.danger.text : theme.text.secondary} ${theme.fonts.mono}`}>
                {name.length}/100 characters
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= 254) {
                  setEmail(value)
                }
              }}
              className={`mt-1 ${theme.inputs.default}`}
              placeholder="you@example.com"
              maxLength={254}
              required
            />
            {emailError && (
              <div className="flex items-center gap-2 mt-2">
                <X className="w-4 h-4 text-red-400" />
                <p className={`${theme.text.tiny} text-red-400 ${theme.fonts.mono}`}>
                  {emailError}
                </p>
              </div>
            )}
            {email.length > 0 && !emailError && (
              <div className="flex items-center gap-2 mt-2">
                <Check className="w-4 h-4 text-green-400" />
                <p className={`${theme.text.tiny} text-green-400 ${theme.fonts.mono}`}>
                  Valid email format
                </p>
              </div>
            )}
            {email.length > 200 && (
              <p className={`mt-1 ${theme.text.tiny} ${email.length > 240 ? theme.status.danger.text : theme.text.secondary} ${theme.fonts.mono}`}>
                {email.length}/254 characters
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>
              Password *
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= 128) {
                  setPassword(value)
                }
              }}
              className={`mt-1 ${theme.inputs.default}`}
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={128}
            />
            
            {/* Password Strength Indicator */}
            {passwordStrength && (
              <div className="mt-3 space-y-2">
                {/* Progress Bar */}
                <div className="relative h-2 bg-white/10 border border-white/20 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
                
                {/* Strength Label */}
                <div className="flex items-center justify-between">
                  <span className={`${theme.text.tiny} ${theme.fonts.mono} uppercase`}>
                    <span className="text-white/60">Strength: </span>
                    <span className={
                      passwordStrength.level === 'weak' ? 'text-red-400' :
                      passwordStrength.level === 'fair' ? 'text-orange-400' :
                      passwordStrength.level === 'good' ? 'text-yellow-400' :
                      passwordStrength.level === 'strong' ? 'text-blue-400' :
                      'text-green-400'
                    }>
                      {passwordStrength.level.toUpperCase()}
                    </span>
                  </span>
                  <span className={`${theme.text.tiny} ${theme.fonts.mono} text-white/40`}>
                    {passwordStrength.score}/100
                  </span>
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-black/40 border border-white/10">
                  <div className={`flex items-center gap-2 ${theme.text.tiny} ${theme.fonts.mono}`}>
                    {passwordStrength.checks.length ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <X className="w-3 h-3 text-red-400" />
                    )}
                    <span className={passwordStrength.checks.length ? 'text-green-400' : 'text-white/40'}>
                      12+ characters
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${theme.text.tiny} ${theme.fonts.mono}`}>
                    {passwordStrength.checks.uppercase ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <X className="w-3 h-3 text-red-400" />
                    )}
                    <span className={passwordStrength.checks.uppercase ? 'text-green-400' : 'text-white/40'}>
                      Uppercase (A-Z)
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${theme.text.tiny} ${theme.fonts.mono}`}>
                    {passwordStrength.checks.lowercase ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <X className="w-3 h-3 text-red-400" />
                    )}
                    <span className={passwordStrength.checks.lowercase ? 'text-green-400' : 'text-white/40'}>
                      Lowercase (a-z)
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${theme.text.tiny} ${theme.fonts.mono}`}>
                    {passwordStrength.checks.number ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <X className="w-3 h-3 text-red-400" />
                    )}
                    <span className={passwordStrength.checks.number ? 'text-green-400' : 'text-white/40'}>
                      Number (0-9)
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${theme.text.tiny} ${theme.fonts.mono}`}>
                    {passwordStrength.checks.special ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <X className="w-3 h-3 text-red-400" />
                    )}
                    <span className={passwordStrength.checks.special ? 'text-green-400' : 'text-white/40'}>
                      Special (!@#$...)
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${theme.text.tiny} ${theme.fonts.mono}`}>
                    {passwordStrength.checks.unique ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <X className="w-3 h-3 text-red-400" />
                    )}
                    <span className={passwordStrength.checks.unique ? 'text-green-400' : 'text-white/40'}>
                      Unique chars
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {password.length > 0 && !passwordStrength && (
              <p className={`mt-2 ${theme.text.tiny} ${theme.text.secondary} ${theme.fonts.mono}`}>
                Must include uppercase, lowercase, and numbers
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>
              Confirm Password *
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= 128) {
                  setConfirmPassword(value)
                }
              }}
              className={`mt-1 ${theme.inputs.default}`}
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={128}
            />
            {passwordMatchError && (
              <div className="flex items-center gap-2 mt-2">
                <X className="w-4 h-4 text-red-400" />
                <p className={`${theme.text.tiny} text-red-400 ${theme.fonts.mono}`}>
                  {passwordMatchError}
                </p>
              </div>
            )}
            {confirmPassword.length > 0 && !passwordMatchError && password.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Check className="w-4 h-4 text-green-400" />
                <p className={`${theme.text.tiny} text-green-400 ${theme.fonts.mono}`}>
                  Passwords match
                </p>
              </div>
            )}
            {confirmPassword.length > 100 && (
              <p className={`mt-1 ${theme.text.tiny} ${confirmPassword.length > 120 ? theme.status.danger.text : theme.text.secondary} ${theme.fonts.mono}`}>
                {confirmPassword.length}/128 characters
              </p>
            )}
          </div>



          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 border border-white/30 bg-black/50 checked:bg-white checked:border-white cursor-pointer"
              required
            />
            <Label htmlFor="terms" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.tiny} leading-relaxed cursor-pointer`}>
              I agree to the{" "}
              <Link href="/terms" className={`${theme.text.primary} hover:underline`} target="_blank">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className={`${theme.text.primary} hover:underline`} target="_blank">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button
            type="submit"
            disabled={loading || isRateLimited}
            className={`w-full ${theme.buttons.primary} uppercase mt-6 ${isRateLimited ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "CREATING ACCOUNT..." : isRateLimited ? "RATE LIMITED" : "CREATE ACCOUNT"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.tiny} uppercase`}>
            OR
          </span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Google Sign Up Button */}
        <Button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          variant="outline"
          className="w-full border-2 border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-mono tracking-wider uppercase flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? "SIGNING UP..." : "SIGN UP WITH GOOGLE"}
        </Button>

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
    </>
  )
}
