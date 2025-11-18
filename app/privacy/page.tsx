"use client"

import Link from "next/link"
import { Shield, ArrowLeft, Lock, Database, Cookie, Mail, FileText, UserX } from "lucide-react"
import { theme } from "@/lib/theme"

export default function PrivacyPolicyPage() {
  return (
    <div className={`relative min-h-screen ${theme.backgrounds.main} overflow-hidden`}>
      {/* Stars background */}
      <div className="fixed inset-0 stars-bg pointer-events-none"></div>

      {/* Corner frame accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white/30 z-20"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white/30 z-20"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/30 z-20"></div>

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 font-mono text-sm">
          <ArrowLeft className="w-4 h-4" />
          BACK TO HOME
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-10 h-10 text-white" />
            <h1 className={`${theme.text.hero} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
              PRIVACY POLICY
            </h1>
          </div>
          <div className="flex items-center gap-2 text-white/60 font-mono text-xs mb-4">
            <span>LAST UPDATED: NOVEMBER 10, 2025</span>
          </div>
          <p className={`${theme.text.base} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed`}>
            At TokenGuard, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our token analysis platform.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1: Information We Collect */}
          <section className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-white" />
              <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
                1. INFORMATION WE COLLECT
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className={`${theme.text.base} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} mb-2 uppercase`}>
                  1.1 Personal Information
                </h3>
                <ul className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} space-y-2 ml-4`}>
                  <li>• Email address (for account creation and authentication)</li>
                  <li>• Full name (optional, for profile personalization)</li>
                  <li>• Company name (optional)</li>
                  <li>• Country/region (optional)</li>
                  <li>• Wallet addresses (if you choose to connect your wallet)</li>
                </ul>
              </div>

              <div>
                <h3 className={`${theme.text.base} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} mb-2 uppercase`}>
                  1.2 Usage Information
                </h3>
                <ul className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} space-y-2 ml-4`}>
                  <li>• Token addresses you analyze</li>
                  <li>• Scan history and results</li>
                  <li>• Watchlist tokens</li>
                  <li>• Dashboard activity and preferences</li>
                  <li>• Feature usage patterns</li>
                </ul>
              </div>

              <div>
                <h3 className={`${theme.text.base} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} mb-2 uppercase`}>
                  1.3 Technical Information
                </h3>
                <ul className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} space-y-2 ml-4`}>
                  <li>• IP address</li>
                  <li>• Browser type and version</li>
                  <li>• Device information</li>
                  <li>• Operating system</li>
                  <li>• Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: How We Use Your Information */}
          <section className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-white" />
              <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
                2. HOW WE USE YOUR INFORMATION
              </h2>
            </div>

            <ul className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} space-y-3 ml-4`}>
              <li>
                <span className={theme.text.primary}>• Provide Services:</span> To deliver token analysis, risk assessments, and security insights
              </li>
              <li>
                <span className={theme.text.primary}>• Improve Platform:</span> To enhance our algorithms, features, and user experience
              </li>
              <li>
                <span className={theme.text.primary}>• Communication:</span> To send service updates, security alerts, and important notifications
              </li>
              <li>
                <span className={theme.text.primary}>• Account Management:</span> To maintain your account, process subscriptions, and provide support
              </li>
              <li>
                <span className={theme.text.primary}>• Security:</span> To detect fraud, prevent abuse, and protect our users
              </li>
              <li>
                <span className={theme.text.primary}>• Legal Compliance:</span> To comply with applicable laws and regulations
              </li>
            </ul>
          </section>

          {/* Section 3: Cookies and Tracking */}
          <section className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-5 h-5 text-white" />
              <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
                3. COOKIES AND TRACKING TECHNOLOGIES
              </h2>
            </div>

            <div className="space-y-4">
              <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed`}>
                We use cookies and similar tracking technologies to improve your experience and analyze platform usage.
              </p>

              <div>
                <h3 className={`${theme.text.base} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} mb-2 uppercase`}>
                  3.1 Essential Cookies
                </h3>
                <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed ml-4`}>
                  Required for authentication, security, and core platform functionality. These cannot be disabled.
                </p>
              </div>

              <div>
                <h3 className={`${theme.text.base} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} mb-2 uppercase`}>
                  3.2 Analytics Cookies
                </h3>
                <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed ml-4`}>
                  Help us understand how users interact with our platform to improve features and performance.
                </p>
              </div>

              <div>
                <h3 className={`${theme.text.base} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} mb-2 uppercase`}>
                  3.3 Preferences Cookies
                </h3>
                <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed ml-4`}>
                  Remember your settings and preferences for a personalized experience.
                </p>
              </div>

              <div className="pt-4">
                <Link 
                  href="/privacy-settings" 
                  className={`inline-flex items-center gap-2 px-4 py-2 ${theme.buttons.primary} uppercase`}
                >
                  MANAGE COOKIE PREFERENCES
                </Link>
              </div>
            </div>
          </section>

          {/* Section 4: Data Sharing */}
          <section className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-white" />
              <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
                4. DATA SHARING AND DISCLOSURE
              </h2>
            </div>

            <div className="space-y-4">
              <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed`}>
                We do not sell your personal information. We may share data in the following circumstances:
              </p>

              <ul className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} space-y-3 ml-4`}>
                <li>
                  <span className={theme.text.primary}>• Service Providers:</span> Third-party services that help us operate our platform (Firebase, payment processors, analytics)
                </li>
                <li>
                  <span className={theme.text.primary}>• Legal Requirements:</span> When required by law, court order, or government regulations
                </li>
                <li>
                  <span className={theme.text.primary}>• Business Transfers:</span> In connection with a merger, acquisition, or sale of assets
                </li>
                <li>
                  <span className={theme.text.primary}>• Protection:</span> To protect our rights, property, or safety, or that of our users
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Your Rights (GDPR) */}
          <section className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-white" />
              <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
                5. YOUR RIGHTS (GDPR)
              </h2>
            </div>

            <div className="space-y-4">
              <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed`}>
                If you are in the European Economic Area (EEA), you have the following rights:
              </p>

              <ul className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} space-y-3 ml-4`}>
                <li>
                  <span className={theme.text.primary}>• Right to Access:</span> Request a copy of your personal data
                </li>
                <li>
                  <span className={theme.text.primary}>• Right to Rectification:</span> Correct inaccurate or incomplete data
                </li>
                <li>
                  <span className={theme.text.primary}>• Right to Erasure:</span> Request deletion of your personal data
                </li>
                <li>
                  <span className={theme.text.primary}>• Right to Restriction:</span> Limit how we use your data
                </li>
                <li>
                  <span className={theme.text.primary}>• Right to Data Portability:</span> Receive your data in a machine-readable format
                </li>
                <li>
                  <span className={theme.text.primary}>• Right to Object:</span> Object to certain data processing activities
                </li>
                <li>
                  <span className={theme.text.primary}>• Right to Withdraw Consent:</span> Withdraw consent at any time
                </li>
              </ul>

              <div className="pt-4 flex gap-4">
                <Link 
                  href="/profile" 
                  className={`inline-flex items-center gap-2 px-4 py-2 ${theme.buttons.primary} uppercase`}
                >
                  EXERCISE YOUR RIGHTS
                </Link>
              </div>
            </div>
          </section>

          {/* Section 6: Data Security */}
          <section className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-white" />
              <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
                6. DATA SECURITY
              </h2>
            </div>

            <div className="space-y-4">
              <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed`}>
                We implement industry-standard security measures to protect your data:
              </p>

              <ul className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} space-y-2 ml-4`}>
                <li>• End-to-end encryption for sensitive data</li>
                <li>• Secure Firebase authentication and storage</li>
                <li>• Regular security audits and updates</li>
                <li>• Access controls and authentication</li>
                <li>• Encrypted data transmission (HTTPS/SSL)</li>
              </ul>

              <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed italic`}>
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Section 7: Data Retention */}
          <section className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-white" />
              <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
                7. DATA RETENTION
              </h2>
            </div>

            <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed`}>
              We retain your personal information for as long as necessary to:
            </p>

            <ul className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} space-y-2 ml-4 mt-3`}>
              <li>• Provide our services</li>
              <li>• Comply with legal obligations</li>
              <li>• Resolve disputes</li>
              <li>• Enforce our agreements</li>
            </ul>

            <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed mt-4`}>
              When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it by law.
            </p>
          </section>

          {/* Section 8: International Transfers */}
          <section className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-white" />
              <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
                8. INTERNATIONAL DATA TRANSFERS
              </h2>
            </div>

            <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed`}>
              Your information may be transferred to and processed in countries outside your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
            </p>
          </section>

          {/* Section 9: Children's Privacy */}
          <section className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <UserX className="w-5 h-5 text-white" />
              <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
                9. CHILDREN'S PRIVACY
              </h2>
            </div>

            <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed`}>
              TokenGuard is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          {/* Section 10: Changes to Privacy Policy */}
          <section className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-white" />
              <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
                10. CHANGES TO THIS PRIVACY POLICY
              </h2>
            </div>

            <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed`}>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of TokenGuard after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Section 11: Contact Us */}
          <section className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-white" />
              <h2 className={`${theme.text.large} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} ${theme.fonts.tracking} uppercase`}>
                11. CONTACT US
              </h2>
            </div>

            <p className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} leading-relaxed mb-4`}>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>

            <div className={`${theme.text.small} ${theme.text.secondary} ${theme.fonts.mono} space-y-2 ml-4`}>
              <p>
                <span className={theme.text.primary}>Email:</span> nayanjoshymaniyathjoshy@gmail.com
              </p>
              <p>
                <span className={theme.text.primary}>Data Protection Officer:</span> nayanjoshymaniyathjoshy@gmail.com
              </p>
            </div>
          </section>

          {/* Related Links */}
          <div className={`border ${theme.borders.default} ${theme.backgrounds.card} p-6`}>
            <h3 className={`${theme.text.base} ${theme.fonts.bold} ${theme.text.primary} ${theme.fonts.mono} mb-4 uppercase`}>
              RELATED DOCUMENTS
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/terms" 
                className={`inline-flex items-center gap-2 px-4 py-2 border ${theme.borders.default} ${theme.text.primary} hover:bg-white hover:text-black transition-all ${theme.fonts.mono} text-xs uppercase`}
              >
                TERMS OF SERVICE
              </Link>
              <Link 
                href="/privacy-settings" 
                className={`inline-flex items-center gap-2 px-4 py-2 border ${theme.borders.default} ${theme.text.primary} hover:bg-white hover:text-black transition-all ${theme.fonts.mono} text-xs uppercase`}
              >
                PRIVACY SETTINGS
              </Link>
              <Link 
                href="/profile" 
                className={`inline-flex items-center gap-2 px-4 py-2 border ${theme.borders.default} ${theme.text.primary} hover:bg-white hover:text-black transition-all ${theme.fonts.mono} text-xs uppercase`}
              >
                MANAGE YOUR DATA
              </Link>
            </div>
          </div>
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
