'use client'

import { Loader2, Shield, Activity, Users, Lock, TrendingUp, Zap } from 'lucide-react'

export default function ScanLoader() {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="relative">
        {/* Animated border */}
        <div className="absolute inset-0 border-2 border-white/20 animate-pulse"></div>
        
        {/* Main content */}
        <div className="relative bg-black border-2 border-white/40 p-12 min-w-[500px]">
          {/* Scanning animation */}
          <div className="flex flex-col items-center gap-6">
            {/* Rotating loader */}
            <div className="relative">
              <Loader2 className="w-16 h-16 text-white animate-spin" />
              <Shield className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            {/* Status text */}
            <div className="text-center">
              <h2 className="text-white font-mono text-xl tracking-wider mb-2 animate-pulse">
                ANALYZING TOKEN
              </h2>
              <p className="text-white/60 font-mono text-xs tracking-wider">
                PLEASE WAIT...
              </p>
            </div>
            
            {/* Progress indicators */}
            <div className="w-full space-y-3 mt-4">
              <ScanStep icon={<Activity className="w-4 h-4" />} label="Fetching blockchain data" />
              <ScanStep icon={<Users className="w-4 h-4" />} label="Analyzing holder distribution" />
              <ScanStep icon={<Lock className="w-4 h-4" />} label="Checking security features" />
              <ScanStep icon={<TrendingUp className="w-4 h-4" />} label="Calculating risk score" />
              <ScanStep icon={<Zap className="w-4 h-4" />} label="Generating AI insights" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScanStep({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 text-white/60 font-mono text-xs animate-pulse">
      <div className="text-white/40">{icon}</div>
      <div className="flex-1 h-px bg-white/20"></div>
      <span className="tracking-wider">{label}</span>
    </div>
  )
}
