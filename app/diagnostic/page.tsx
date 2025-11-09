"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function DiagnosticPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">🔍 Diagnostic Page</h1>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Loading:</span>
                <span className="text-white font-mono">{loading ? 'true' : 'false'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User Authenticated:</span>
                <span className="text-white font-mono">{user ? 'true' : 'false'}</span>
              </div>
              {user && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white font-mono">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">UID:</span>
                    <span className="text-white font-mono text-xs">{user.uid}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">User Data Loaded:</span>
                <span className="text-white font-mono">{userData ? 'true' : 'false'}</span>
              </div>
              {userData && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tier:</span>
                    <span className="text-white font-mono">{userData.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Analyses:</span>
                    <span className="text-white font-mono">{userData.dailyAnalyses}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Environment Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">FIREBASE_API_KEY:</span>
              <span className="text-white">{process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">FIREBASE_PROJECT_ID:</span>
              <span className="text-white">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing'}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  Go to Dashboard
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" className="border-white/20 text-white">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" className="border-white/20 text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Full User Data (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-gray-300 overflow-auto max-h-64 bg-black/30 p-3 rounded">
              {JSON.stringify({ user: user ? { email: user.email, uid: user.uid } : null, userData, loading }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
