'use client'

import React from 'react'
import { useForm, ValidationError } from '@formspree/react'
import { ChevronRight } from 'lucide-react'

function ContactForm() {
  const [state, handleSubmit] = useForm('meovqnpq')

  if (state.succeeded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="border border-green-500/50 bg-green-500/10 p-8 backdrop-blur-xl rounded-lg text-center">
            <div className="w-12 h-12 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-mono tracking-wider mb-3">
              MESSAGE SENT
            </h2>
            <p className="text-green-400 font-mono text-sm mb-6">
              Thank you for contacting us! We'll get back to you soon.
            </p>
            <a 
              href="/"
              className="inline-block px-6 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-mono text-xs hover:bg-green-500/30 transition-colors"
            >
              BACK TO HOME
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-700/50 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="font-mono text-lg font-bold tracking-wider hover:text-gray-300 transition-colors">
            TOKEN GUARD
          </a>
          <a 
            href="/"
            className="px-4 py-2 text-xs font-mono tracking-wider border border-gray-500/50 hover:border-gray-400 transition-colors"
          >
            ← BACK
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold font-mono tracking-wider mb-4 text-white">
            CONTACT US
          </h1>
          <p className="text-gray-400 font-mono text-sm leading-relaxed">
            Have questions, feedback, or need assistance? Get in touch with our team. We're here to help.
          </p>
        </div>

        {/* Contact Form */}
        <div className="border border-white/10 bg-white/5 backdrop-blur-xl p-8 rounded-lg mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-white font-mono text-xs tracking-wider mb-3">
                FULL NAME
              </label>
              <input
                id="name"
                type="text"
                name="name"
                required
                placeholder="Your name"
                className="w-full bg-black/50 border border-gray-700/50 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/50 transition-colors"
              />
              <ValidationError prefix="Name" field="name" errors={state.errors} />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white font-mono text-xs tracking-wider mb-3">
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                className="w-full bg-black/50 border border-gray-700/50 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/50 transition-colors"
              />
              <ValidationError prefix="Email" field="email" errors={state.errors} />
            </div>

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-white font-mono text-xs tracking-wider mb-3">
                SUBJECT
              </label>
              <input
                id="subject"
                type="text"
                name="subject"
                required
                placeholder="What's this about?"
                className="w-full bg-black/50 border border-gray-700/50 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/50 transition-colors"
              />
              <ValidationError prefix="Subject" field="subject" errors={state.errors} />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-white font-mono text-xs tracking-wider mb-3">
                MESSAGE
              </label>
              <textarea
                id="message"
                name="message"
                required
                placeholder="Tell us more..."
                rows={6}
                className="w-full bg-black/50 border border-gray-700/50 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/50 transition-colors resize-none"
              />
              <ValidationError prefix="Message" field="message" errors={state.errors} />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={state.submitting}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-mono text-xs tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {state.submitting ? (
                <>
                  <span className="animate-spin">◌</span>
                  SENDING...
                </>
              ) : (
                <>
                  SEND MESSAGE
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="border border-gray-700/50 bg-gray-900/30 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">✉</span>
              <h3 className="text-white font-mono text-sm tracking-wider">EMAIL</h3>
            </div>
            <a
              href="mailto:nayanjoshymaniyathjoshy@gmail.com"
              className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all transition-colors"
            >
              nayanjoshymaniyathjoshy@gmail.com
            </a>
          </div>

          {/* Response Time */}
          <div className="border border-gray-700/50 bg-gray-900/30 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⏱</span>
              <h3 className="text-white font-mono text-sm tracking-wider">RESPONSE TIME</h3>
            </div>
            <p className="text-gray-400 font-mono text-xs">
              We typically respond within 24-48 hours during business days.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700/50 bg-black/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 font-mono text-xs">
            © 2025 Token Guard. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ContactForm
