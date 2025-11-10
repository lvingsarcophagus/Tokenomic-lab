"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Shield, Home, Search, TrendingUp, Settings, LogOut, Menu, X, User, Zap, Bell, RefreshCw } from "lucide-react"
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
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Build navigation links based on user role and plan
  const navLinks = []
  
  if (user) {
    // Dashboard link - different based on tier
    if (userData?.plan === "PREMIUM") {
      navLinks.push({ href: "/premium/dashboard", label: "Dashboard", icon: Home })
    } else {
      navLinks.push({ href: "/dashboard", label: "Dashboard", icon: Home })
    }
    
    // Pricing link for all users
    navLinks.push({ href: "/pricing", label: "Pricing", icon: TrendingUp })
    
    // Admin-only links
    if (userData?.role === "admin") {
      navLinks.push({ href: "/api-test", label: "API Test", icon: Settings })
      navLinks.push({ href: "/admin", label: "Admin", icon: Shield })
    }
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-2xl border-b border-white/20 shadow-lg shadow-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo with Dynamic Hover */}
          <Link href="/dashboard" className="flex items-center gap-3 group relative">
            <div className="relative p-2.5 border-2 border-white/30 group-hover:border-white group-hover:bg-white transition-all duration-300 overflow-hidden">
              <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:text-black transition-colors relative z-10" />
              <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
            </div>
            <div>
              <span className="text-xl lg:text-2xl font-bold text-white font-mono tracking-widest italic transform -skew-x-12 group-hover:text-white/90 transition-colors">
                TOKEN GUARD
              </span>
              <div className="text-[8px] lg:text-[10px] text-white/60 font-mono -mt-1 tracking-wider group-hover:text-white/80 transition-colors">REAL-TIME.SECURITY</div>
            </div>
          </Link>

          {/* Desktop Navigation with Dynamic States */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link, index) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={`${link.href}-${link.label}-${index}`}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2.5 border-2 transition-all duration-200 group font-mono text-xs overflow-hidden ${
                    isActive
                      ? "text-white border-white/50 bg-white/10 scale-105"
                      : "text-white/60 hover:text-white border-white/20 hover:border-white/40 hover:bg-white/5 hover:scale-105"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-white/50 group-hover:text-white group-hover:scale-110 group-hover:rotate-6'
                  }`} />
                  <span className="relative z-10 font-mono tracking-wider font-bold">{link.label.toUpperCase()}</span>
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop User Menu with Dynamic Interactions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Refresh with Spin Animation */}
            <button 
              onClick={handleRefresh}
              className="p-2.5 border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 group"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-white/60 group-hover:text-white transition-all duration-200 group-hover:rotate-180" />
            </button>

            {/* Notifications with Pulse */}
            <button className="relative p-2.5 border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 group">
              <Bell className="w-4 h-4 text-white/60 group-hover:text-white transition-all duration-200 group-hover:scale-110 group-hover:rotate-12" />
              {userData?.alerts && userData.alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black flex items-center justify-center text-[9px] font-bold border-2 border-black animate-pulse">
                  {userData.alerts.length}
                </span>
              )}
            </button>

            {/* Dynamic Tier Badge */}
            <div className={`relative flex items-center gap-2 px-3 py-2.5 border-2 font-mono text-xs transition-all duration-200 overflow-hidden ${
              userData?.tier === "pro"
                ? "text-white border-white/50 bg-white/10 animate-pulse"
                : "text-white/60 border-white/20 bg-black/40 hover:border-white/30"
            }`}>
              {userData?.tier === "pro" && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 animate-shimmer" />
              )}
              <Zap className={`w-4 h-4 relative z-10 ${
                userData?.tier === "pro" ? "text-white animate-pulse" : "text-white/60"
              }`} />
              <span className="font-bold tracking-wider relative z-10">
                {userData?.tier === "pro" ? "PRO" : "FREE"}
              </span>
            </div>

            {/* Profile with Hover Effect */}
            <Link href="/profile" className="group">
              <div className="flex items-center gap-2.5 pl-3 pr-2 py-2 border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono group-hover:text-white/90 transition-colors">
                    {user.email?.split('@')[0]?.toUpperCase()}
                  </div>
                  <div className="text-[8px] text-white/40 font-mono truncate max-w-[120px] group-hover:text-white/60 transition-colors">
                    {user.email}
                  </div>
                </div>
                <div className="w-9 h-9 border-2 border-white/40 bg-black/60 group-hover:bg-white group-hover:border-white flex items-center justify-center transition-all duration-200">
                  <User className="w-4 h-4 text-white group-hover:text-black transition-colors" />
                </div>
              </div>
            </Link>

            {/* Logout with Danger State */}
            <button
              onClick={handleLogout}
              className="p-2.5 border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-white/60 group-hover:text-white transition-all duration-200 group-hover:scale-110 group-hover:-rotate-12" />
            </button>
          </div>

          {/* Mobile Menu Button with Animation */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 group"
          >
            {mobileMenuOpen ? 
              <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" /> : 
              <Menu className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu with Slide Animation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-black/98 animate-in slide-in-from-top-2">
          <div className="px-4 py-6 space-y-4">
            {/* User Info - Mobile */}
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/20">
              <div className="w-12 h-12 border-2 border-white/40 bg-black/60 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white font-mono">
                  {user?.email?.split('@')[0]?.toUpperCase()}
                </div>
                <div className="text-[10px] text-white/50 font-mono truncate">
                  {user?.email}
                </div>
              </div>
              <div className={`px-2.5 py-1.5 border-2 font-mono text-[10px] ${
                userData?.tier === "pro"
                  ? "text-white border-white/50 bg-white/10 font-bold"
                  : "text-white/60 border-white/20"
              }`}>
                {userData?.tier === "pro" ? "⚡ PRO" : "FREE"}
              </div>
            </div>

            {/* Mobile Navigation Links with Hover Effects */}
            <div className="space-y-2">
              {navLinks.map((link, index) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={`${link.href}-${link.label}-${index}`}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center gap-3 px-4 py-3 border-2 transition-all duration-200 font-mono text-xs group ${
                      isActive
                        ? "bg-white/10 border-white/40 text-white font-bold"
                        : "text-white/60 hover:text-white border-white/20 hover:border-white/30 hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                    )}
                    <Icon className={`w-4 h-4 transition-all ${
                      isActive ? 'text-white' : 'group-hover:scale-110 group-hover:rotate-6'
                    }`} />
                    <span className="font-bold tracking-wider">{link.label.toUpperCase()}</span>
                  </Link>
                )
              })}
              
              {/* Profile Link */}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 border-2 border-white/20 hover:border-white/30 hover:bg-white/5 text-white/60 hover:text-white transition-all duration-200 font-mono text-xs group"
              >
                <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-bold tracking-wider">PROFILE</span>
              </Link>
              
              {/* Logout Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-white/20 hover:border-white/40 hover:bg-white/5 text-white/60 hover:text-white transition-all duration-200 font-mono text-xs group"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 group-hover:-rotate-12 transition-all" />
                <span className="font-bold tracking-wider">LOGOUT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
