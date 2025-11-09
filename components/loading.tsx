export default function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-32 h-32">
        {/* Shield icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-16 h-16 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        
        {/* Outer scanning ring */}
        <div className="absolute inset-0">
          <div className="w-full h-full border-2 border-cyan-500/30 rounded-full"></div>
          <div 
            className="absolute inset-0 w-full h-full border-2 border-transparent border-t-cyan-500 rounded-full animate-spin"
            style={{ animationDuration: '2s' }}
          ></div>
        </div>
        
        {/* Middle pulse ring */}
        <div className="absolute inset-3">
          <div className="w-full h-full border-2 border-blue-500/20 rounded-full animate-pulse"></div>
        </div>
        
        {/* Inner fast scanning ring */}
        <div className="absolute inset-6">
          <div className="w-full h-full border-2 border-transparent border-t-blue-400 border-r-blue-400 rounded-full animate-spin" 
            style={{ animationDuration: '1s' }}
          ></div>
        </div>

        {/* Scanning lines */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-scan"></div>
          <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-scan-slow"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-reverse"></div>
          <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-scan"></div>
        </div>

        {/* Corner brackets */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-500"></div>
        <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-500"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-500"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-500"></div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(128px); opacity: 0; }
        }
        @keyframes scan-slow {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(128px); opacity: 0; }
        }
        @keyframes scan-reverse {
          0% { transform: translateY(128px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(0); opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        .animate-scan-slow {
          animation: scan-slow 3s ease-in-out infinite;
        }
        .animate-scan-reverse {
          animation: scan-reverse 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      
      {/* Animated background lines */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-pulse"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        <LoadingAnimation />
        
        {/* Scanning text */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-cyan-400 font-mono text-lg tracking-widest animate-pulse">
            {message}
          </p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-6 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-loading-bar"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  }

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
    </div>
  )
}
