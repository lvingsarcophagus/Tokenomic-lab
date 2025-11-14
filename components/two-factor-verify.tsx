'use client'

import { useState } from 'react'
import { Shield, AlertCircle, Loader2 } from 'lucide-react'
import { verifyTOTP, get2FASecret } from '@/lib/totp'

interface TwoFactorVerifyProps {
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function TwoFactorVerify({ userId, onSuccess, onCancel }: TwoFactorVerifyProps) {
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setVerifying(true)
    setError('')

    try {
      const secret = await get2FASecret(userId)
      
      if (!secret) {
        setError('2FA not configured for this account')
        return
      }

      const isValid = await verifyTOTP(secret, code)
      
      if (isValid) {
        onSuccess()
      } else {
        setError('Invalid code. Please try again.')
        setCode('')
      }
    } catch (err) {
      console.error('2FA verification error:', err)
      setError('Verification failed. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-black/95 backdrop-blur-xl border-2 border-white/30 rounded-lg p-8 shadow-2xl shadow-white/10 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 border-2 border-white/40 bg-white/5 rounded-lg mb-4 shadow-lg shadow-white/10">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-white font-mono text-2xl font-bold tracking-wider mb-2">
            SECURITY VERIFICATION
          </h2>
          <p className="text-white/60 font-mono text-sm">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Code Input */}
        <div className="space-y-6">
          <div>
            <label className="text-white font-mono text-xs font-bold mb-3 block tracking-widest text-center opacity-80">
              ENTER 6-DIGIT CODE
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setCode(value)
                setError('')
              }}
              onKeyPress={handleKeyPress}
              placeholder="● ● ● ● ● ●"
              autoFocus
              className="w-full bg-black/50 border-2 border-white/40 text-white px-6 py-5 font-mono text-3xl tracking-[0.5em] text-center focus:outline-none focus:border-white focus:shadow-lg focus:shadow-white/20 rounded-lg transition-all placeholder:text-white/20 placeholder:tracking-[0.5em]"
              maxLength={6}
              disabled={verifying}
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-lg text-red-400 font-mono text-sm animate-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={verifying}
              className="flex-1 px-6 py-4 bg-transparent border-2 border-white/40 text-white font-mono text-sm tracking-widest hover:bg-white/10 hover:border-white/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold shadow-lg hover:shadow-white/10"
            >
              CANCEL
            </button>
            <button
              onClick={handleVerify}
              disabled={verifying || code.length !== 6}
              className="flex-1 px-6 py-4 bg-white text-black font-mono text-sm tracking-widest hover:bg-white/90 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-white/30"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  VERIFYING...
                </>
              ) : (
                'VERIFY'
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center space-y-2 pt-4 border-t border-white/10">
            <p className="text-white/50 font-mono text-xs">
              💡 Code changes every 30 seconds
            </p>
            <p className="text-white/40 font-mono text-xs">
              Open Google Authenticator or your TOTP app
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
