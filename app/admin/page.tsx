"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"
import { AdminPanel } from "@/components/admin-panel"
import { useUserRole } from "@/hooks/use-user-role"

export default function AdminPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 1247,
    proUsers: 89,
    freeUsers: 1158,
    monthlyRevenue: 4450,
    tokensAnalyzed: 15234,
    alertsSent: 8921,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    // Check if user is admin
    if (!loading && userData && userData.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, userData, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono">LOADING...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg pointer-events-none opacity-30"></div>
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-20"></div>
      
      <header className="relative border-b border-white/20 bg-black/95 backdrop-blur-lg z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="p-2 border border-white/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white font-mono tracking-widest italic transform -skew-x-12">
              TOKEN GUARD ADMIN
            </span>
          </Link>

          <Link href="/dashboard">
            <Button className="border border-white/20 text-white hover:bg-white hover:text-black bg-transparent text-xs font-mono px-4 py-2">
              BACK TO DASHBOARD
            </Button>
          </Link>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 py-12 z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-60">
              <div className="w-8 h-px bg-white"></div>
              <span className="text-white text-[10px] font-mono tracking-wider">∞</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white font-mono tracking-wider">ADMIN DASHBOARD</h1>
            <p className="text-white/60 text-sm font-mono mt-1">WELCOME, {userData?.name?.toUpperCase() || 'ADMIN'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs text-white/60 font-mono">TOTAL USERS</CardTitle>
              <Users className="w-4 h-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white font-mono">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-[8px] text-white/40 mt-1 font-mono">+12% FROM LAST MONTH</p>
            </CardContent>
          </Card>

          <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs text-white/60 font-mono">PRO USERS</CardTitle>
              <TrendingUp className="w-4 h-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white font-mono">{stats.proUsers}</div>
              <p className="text-[8px] text-white/40 mt-1 font-mono">7.1% CONVERSION RATE</p>
            </CardContent>
          </Card>

          <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs text-white/60 font-mono">MONTHLY REVENUE</CardTitle>
              <DollarSign className="w-4 h-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white font-mono">${stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-[8px] text-white/40 mt-1 font-mono">+18% FROM LAST MONTH</p>
            </CardContent>
          </Card>

          <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs text-white/60 font-mono">TOKENS ANALYZED</CardTitle>
              <Shield className="w-4 h-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white font-mono">{stats.tokensAnalyzed.toLocaleString()}</div>
              <p className="text-[8px] text-white/40 mt-1 font-mono">THIS MONTH</p>
            </CardContent>
          </Card>

          <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs text-white/60 font-mono">ALERTS SENT</CardTitle>
              <AlertTriangle className="w-4 h-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white font-mono">{stats.alertsSent.toLocaleString()}</div>
              <p className="text-[8px] text-white/40 mt-1 font-mono">THIS MONTH</p>
            </CardContent>
          </Card>

          <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs text-white/60 font-mono">FREE USERS</CardTitle>
              <Users className="w-4 h-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white font-mono">{stats.freeUsers.toLocaleString()}</div>
              <p className="text-[8px] text-white/40 mt-1 font-mono">92.9% OF TOTAL USERS</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel for User Management */}
        <div className="mb-8">
          <AdminPanel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-px bg-white"></div>
                <CardTitle className="text-white font-mono tracking-wider text-sm">RECENT USER ACTIVITY</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { email: "user1@example.com", action: "ANALYZED TOKEN", time: "2 MIN AGO" },
                  { email: "user2@example.com", action: "UPGRADED TO PRO", time: "15 MIN AGO" },
                  { email: "user3@example.com", action: "CONNECTED WALLET", time: "1 HOUR AGO" },
                  { email: "user4@example.com", action: "ANALYZED TOKEN", time: "2 HOURS AGO" },
                  { email: "user5@example.com", action: "SIGNED UP", time: "3 HOURS AGO" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                    <div>
                      <div className="text-white text-xs font-mono">{activity.email}</div>
                      <div className="text-white/60 text-[10px] font-mono">{activity.action}</div>
                    </div>
                    <div className="text-white/40 text-[8px] font-mono">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/60 backdrop-blur-lg border border-white/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-px bg-white"></div>
                <CardTitle className="text-white font-mono tracking-wider text-sm">SYSTEM HEALTH</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs font-mono">API STATUS</span>
                  <span className="text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-white"></span>
                    <span className="text-xs font-mono">OPERATIONAL</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs font-mono">DATABASE</span>
                  <span className="text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-white"></span>
                    <span className="text-xs font-mono">HEALTHY</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs font-mono">ALERT SYSTEM</span>
                  <span className="text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-white"></span>
                    <span className="text-xs font-mono">ACTIVE</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs font-mono">BLOCKCHAIN SYNC</span>
                  <span className="text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-white/60"></span>
                    <span className="text-xs font-mono">SYNCING</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
