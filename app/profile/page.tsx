"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { theme } from "@/lib/theme"
import Navbar from "@/components/navbar"

export default function ProfilePage() {
  const { user, userData, updateProfile, loading } = useAuth()
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [connectingWallet, setConnectingWallet] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (userData?.name) {
      setName(userData.name)
    }
    if (userData?.walletAddress) {
      setWalletAddress(userData.walletAddress)
    }
  }, [user, userData, loading, router])

  const handleSave = async () => {
    setSaving(true)
    await updateProfile({ name })
    setSaving(false)
    alert("Profile updated!")
  }

  const handleConnectWallet = async () => {
    setConnectingWallet(true)
    try {
      interface EthereumProvider {
        request: (args: { method: string }) => Promise<string[]>
      }
      
      const windowWithEthereum = window as unknown as { ethereum?: EthereumProvider }
      
      if (typeof window !== "undefined" && windowWithEthereum.ethereum) {
        const accounts = await windowWithEthereum.ethereum.request({
          method: "eth_requestAccounts",
        })
        const address = accounts[0]
        setWalletAddress(address)
        await updateProfile({ walletAddress: address })
        alert("Wallet connected successfully!")
      } else {
        alert("Please install MetaMask or Phantom wallet extension")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      alert("Failed to connect wallet")
    } finally {
      setConnectingWallet(false)
    }
  }

  const handleDisconnectWallet = async () => {
    setWalletAddress("")
    await updateProfile({ walletAddress: "" })
    alert("Wallet disconnected")
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.backgrounds.main} flex items-center justify-center`}>
        <div className={`${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking}`}>LOADING...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className={`relative min-h-screen ${theme.backgrounds.main} overflow-hidden`}>
      {/* Stars background */}
      <div className="fixed inset-0 stars-bg pointer-events-none"></div>

      {/* Corner frame accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white/30 z-20"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/30 z-20"></div>

      <Navbar />

      <div className="relative max-w-4xl mx-auto px-4 pt-24 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 opacity-60">
            <div className={theme.decorative.divider}></div>
            <span className={`${theme.text.tiny} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>USER SETTINGS</span>
            <div className="flex-1 h-px bg-white"></div>
          </div>
          <h1 className={`text-3xl ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking}`}>PROFILE</h1>
        </div>

        <div className="space-y-6">
          <Card className={`${theme.backgrounds.card} border ${theme.borders.default}`}>
            <CardHeader>
              <CardTitle className={`${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking}`}>ACCOUNT INFORMATION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`mt-1 ${theme.inputs.boxed}`}
                />
              </div>

              <div>
                <Label htmlFor="email" className={`${theme.text.secondary} ${theme.fonts.mono} ${theme.text.small} ${theme.fonts.tracking} uppercase`}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className={`mt-1 ${theme.inputs.boxed} opacity-60`}
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className={`${theme.buttons.primary} uppercase`}
              >
                {saving ? "SAVING..." : "SAVE CHANGES"}
              </Button>
            </CardContent>
          </Card>

          <Card className={`${theme.backgrounds.card} border ${theme.borders.default}`}>
            <CardHeader>
              <CardTitle className={`${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking}`}>SUBSCRIPTION</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} uppercase ${theme.fonts.tracking}`}>Current Plan</div>
                  <div className={`${theme.text.xlarge} ${theme.fonts.bold} ${theme.text.primary} mt-1 ${theme.fonts.mono} ${theme.fonts.tracking}`}>
                    {userData?.tier === "pro" ? "PRO" : "FREE"}
                  </div>
                </div>

                {userData?.tier === "free" && (
                  <Link href="/pricing">
                    <Button className={`${theme.buttons.secondary} uppercase`}>
                      UPGRADE TO PRO
                    </Button>
                  </Link>
                )}
              </div>

              {userData?.tier === "pro" && userData?.nextBillingDate && (
                <div className={`mt-4 pt-4 border-t ${theme.borders.default} ${theme.text.secondary} ${theme.text.base} ${theme.fonts.mono}`}>
                  Next billing date: {userData.nextBillingDate}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={`${theme.backgrounds.card} border ${theme.borders.default}`}>
            <CardHeader>
              <CardTitle className={`${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking}`}>CONNECTED WALLETS</CardTitle>
            </CardHeader>
            <CardContent>
              {walletAddress ? (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-4 ${theme.backgrounds.overlay} border ${theme.borders.light}`}>
                    <div>
                      <div className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} uppercase ${theme.fonts.tracking}`}>Connected Wallet</div>
                      <div className={`${theme.text.primary} ${theme.fonts.mono} mt-1`}>
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </div>
                    </div>
                    <Button
                      onClick={handleDisconnectWallet}
                      className="border border-white/30 text-white hover:bg-white hover:text-black transition-all font-mono text-sm uppercase"
                    >
                      DISCONNECT
                    </Button>
                  </div>
                  <p className={`${theme.text.secondary} ${theme.text.base} ${theme.fonts.mono}`}>
                    Your wallet is connected. You can now track your portfolio and receive personalized alerts.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className={`${theme.text.secondary} ${theme.text.base} ${theme.fonts.mono}`}>
                    Connect your wallet to track your portfolio and receive personalized token alerts.
                  </p>
                  <Button
                    onClick={handleConnectWallet}
                    disabled={connectingWallet}
                    className={`${theme.buttons.primary} uppercase`}
                  >
                    {connectingWallet ? "CONNECTING..." : "CONNECT WALLET"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
  )
}
