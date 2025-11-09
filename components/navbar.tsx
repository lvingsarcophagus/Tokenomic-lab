"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Shield, Home, Search, TrendingUp, Settings, LogOut, Menu, X, User, Zap, Bell } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "./ui/button"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userData } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/pro", label: "Pro", icon: Zap },
    { href: "/pricing", label: "Pricing", icon: TrendingUp },
    { href: "/api-test", label: "API Test", icon: Settings },
  ]

  if (userData?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin", icon: Shield })
  }

  if (!user) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 border border-white/30 group-hover:bg-white group-hover:text-black transition-all">
                <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:text-black" />
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold text-white font-mono tracking-widest italic transform -skew-x-12">
                  TOKEN GUARD
                </span>
                <div className="text-[8px] lg:text-[10px] text-white/60 font-mono -mt-1">SECURITY.PROTOCOL</div>
              </div>
            </Link>

            <div className="flex items-center gap-2 lg:gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 border border-white/20 text-xs font-mono px-4 py-2">
                  LOGIN
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-transparent border border-white text-white hover:bg-white hover:text-black text-xs font-mono px-4 py-2 transition-all">
                  GET STARTED
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-2xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 border border-white/30 group-hover:bg-white group-hover:text-black transition-all">
              <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:text-black" />
            </div>
            <div>
              <span className="text-xl lg:text-2xl font-bold text-white font-mono tracking-widest italic transform -skew-x-12">
                TOKEN GUARD
              </span>
              <div className="text-[8px] lg:text-[10px] text-white/60 font-mono -mt-1">REAL-TIME.SECURITY</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link, index) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={`${link.href}-${link.label}-${index}`}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2.5 border transition-all group font-mono text-xs ${
                    isActive
                      ? "text-white border-white/40 bg-white/10"
                      : "text-white/60 hover:text-white border-white/20 hover:border-white/40"
                  }`}
                >
                  <Icon className={`w-3 h-3 relative z-10 transition-colors ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
                  <span className="relative z-10 font-mono tracking-wider">{link.label.toUpperCase()}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* Notifications */}
            <button className="relative p-2 border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all group">
              <Bell className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
              {userData?.alerts && userData.alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black flex items-center justify-center text-[8px] font-bold border border-white">
                  {userData.alerts.length}
                </span>
              )}
            </button>

            {/* Tier Badge */}
            <div className={`flex items-center gap-2 px-3 py-2 border font-mono text-xs ${
              userData?.tier === "pro"
                ? "text-white border-white/40 bg-white/10"
                : "text-white/60 border-white/20 bg-black/40"
            }`}>
              <Zap className={`w-3 h-3 ${userData?.tier === "pro" ? "text-white" : "text-white/60"}`} />
              <span className="font-bold tracking-wider">
                {userData?.tier === "pro" ? "PRO" : "FREE"}
              </span>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2 pl-3 pr-1 py-1 border border-white/20 hover:border-white/40 transition-all">
              <div className="text-right">
                <div className="text-xs font-bold text-white font-mono">{user.email?.split('@')[0]?.toUpperCase()}</div>
                <div className="text-[8px] text-white/40 font-mono">{user.email}</div>
              </div>
              <Link href="/profile">
                <div className="w-8 h-8 border border-white/30 bg-black/40 hover:bg-white hover:text-black flex items-center justify-center transition-all cursor-pointer">
                  <User className="w-4 h-4 text-white" />
                </div>
              </Link>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all group"
            >
              <LogOut className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border border-white/20 hover:border-white/40 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 animate-in slide-in-from-top-2 bg-black/95">
            <div className="space-y-2">
              {navLinks.map((link, index) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={`${link.href}-${link.label}-${index}`}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 border transition-all font-mono text-xs ${
                      isActive
                        ? "bg-white/10 border-white/40 text-white"
                        : "text-white/60 hover:text-white border-white/20 hover:border-white/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-bold tracking-wider">{link.label.toUpperCase()}</span>
                  </Link>
                )
              })}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 border border-white/20 hover:border-white/40 text-white/60 hover:text-white transition-all font-mono text-xs"
              >
                <Settings className="w-4 h-4" />
                <span className="font-bold tracking-wider">SETTINGS</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 border border-white/20 hover:border-white/40 text-white/60 hover:text-white transition-all font-mono text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-bold tracking-wider">LOGOUT</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
