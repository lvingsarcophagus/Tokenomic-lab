'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Shield, Copy, Check, AlertCircle } from 'lucide-react'
import { generateTOTPSecret, generateTOTPUri, verifyTOTP, enable2FA } from '@/lib/totp'
import { useAuth } from '@/contexts/auth-context'

export default function TwoFactorSetup() {
  const { user } = useAuth()
  const [secret, setSecret] = useState('')
  const [qrCodeUri, setQrCodeUri] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user?.email) {
      const newSecret = generateTOTPSecret()
      setSecret(newSecret)
      setQrCodeUri(generateTOTPUri(newSecret, user.email))
    }
  }, [user])

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = async () => {
    if (!user || !verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const isValid = await verifyTOTP(secret, verificationCode)
      
      if (isValid) {
        await enable2FA(user.uid, secret)
        setSuccess(true)
      } else {
        setError('Invalid code. Please try again.')
      }
    } catch (err) {
      console.error('2FA verification error:', err)
      setError('Failed to verify code. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  if (success) {
    return (
      <div className="border-2 border-green-500/30 bg-green-500/10 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/20 border border-green-500/30 rounded">
            <Check className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-green-400 font-mono text-lg font-bold tracking-wider">
            2FA ENABLED SUCCESSFULLY
          </h3>
        </div>
        <p className="text-white/80 font-mono text-sm">
          Two-factor authentication has been enabled for your account. 
          You'll need to enter a code from your authenticator app when logging in.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-white/20 bg-black/40 backdrop-blur-xl p-6 rounded-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 border border-white/30 bg-black/40">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-white font-mono text-lg font-bold tracking-wider">
          ENABLE TWO-FACTOR AUTHENTICATION
        </h3>
      </div>

      <div className="space-y-6">
        {/* Step 1: Scan QR Code */}
        <div>
          <h4 className="text-white/80 font-mono text-sm font-bold mb-3 tracking-wider">
            STEP 1: SCAN QR CODE
          </h4>
          <p className="text-white/60 font-mono text-xs mb-4">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
          </p>
          
          {qrCodeUri && (
            <div className="bg-white p-4 inline-block rounded-lg">
              <QRCodeSVG value={qrCodeUri} size={200} />
            </div>
          )}
        </div>

        {/* Step 2: Manual Entry */}
        <div>
          <h4 className="text-white/80 font-mono text-sm font-bold mb-3 tracking-wider">
            STEP 2: OR ENTER MANUALLY
          </h4>
          <p className="text-white/60 font-mono text-xs mb-3">
            If you can't scan the QR code, enter this secret key manually:
          </p>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-black/60 border border-white/20 p-3 rounded font-mono text-sm text-white break-all">
              {secret}
            </div>
            <button
              onClick={copySecret}
              className="p-3 border border-white/30 hover:border-white/50 hover:bg-white/10 transition-all rounded"
              title="Copy secret"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Step 3: Verify */}
        <div>
          <h4 className="text-white/80 font-mono text-sm font-bold mb-3 tracking-wider">
            STEP 3: VERIFY CODE
          </h4>
          <p className="text-white/60 font-mono text-xs mb-3">
            Enter the 6-digit code from your authenticator app:
          </p>
          
          <div className="space-y-3">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setVerificationCode(value)
                setError('')
              }}
              placeholder="000000"
              className="w-full bg-black border border-white/30 text-white px-4 py-3 font-mono text-lg tracking-widest text-center focus:outline-none focus:border-white rounded"
              maxLength={6}
            />
            
            {error && (
              <div className="flex items-center gap-2 text-red-400 font-mono text-xs">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <button
              onClick={handleVerify}
              disabled={isVerifying || verificationCode.length !== 6}
              className="w-full px-6 py-3 bg-white text-black font-mono text-sm tracking-wider hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded font-bold"
            >
              {isVerifying ? 'VERIFYING...' : 'ENABLE 2FA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
