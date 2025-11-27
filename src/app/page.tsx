"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RootPage() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleLoginRedirect = () => {
    setIsRedirecting(true)
    router.push("/login")
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Navigation */}
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-foreground rounded-lg flex items-center justify-center">
              <span className="font-bold text-primary text-lg">ZT</span>
            </div>
            <h1 className="text-2xl font-bold">SecureBank</h1>
          </div>
          <button
            onClick={handleLoginRedirect}
            disabled={isRedirecting}
            className="px-6 py-2 bg-primary-foreground text-primary font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isRedirecting ? "Redirecting..." : "Login"}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl text-center">
          <h2 className="text-5xl font-bold mb-6 text-balance">Enterprise Banking with Zero-Trust Security</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Protect your assets with our advanced zero-trust security platform. Real-time device posture monitoring,
            risk scoring, and adaptive authentication for corporate banking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleLoginRedirect}
              className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
            <a
              href="#features"
              className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h3 className="text-3xl font-bold mb-12 text-center">Security Features</h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-Time Risk Scoring",
                description:
                  "Continuous device posture monitoring and adaptive risk assessment based on user behavior and context.",
              },
              {
                title: "Zero-Trust Architecture",
                description:
                  "Never trust, always verify. Every access request is authenticated and authorized independently.",
              },
              {
                title: "Device Posture Analysis",
                description:
                  "Analyze device compliance, network status, and security posture to ensure secure transactions.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-background rounded-lg border border-border hover:shadow-lg transition-shadow"
              >
                <h4 className="font-bold text-lg mb-3">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm opacity-90">
          <p>© 2025 SecureBank. Zero-Trust Banking Platform. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
