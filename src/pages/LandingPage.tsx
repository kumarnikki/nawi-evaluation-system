import React from 'react'
import { Link } from 'react-router-dom'

// ── DoCA Ashoka-style SVG Emblem ──────────────────────────────────────────
function DoCAEmblem() {
  return (
    <svg
      viewBox="0 0 80 80"
      width="52"
      height="52"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Department of Consumer Affairs emblem"
    >
      {/* Outer ring — saffron */}
      <circle cx="40" cy="40" r="38" fill="#FF9933" />
      {/* Second ring — white */}
      <circle cx="40" cy="40" r="30" fill="#ffffff" />
      {/* Third ring — ashoka green */}
      <circle cx="40" cy="40" r="22" fill="#138808" />
      {/* Inner field — navy */}
      <circle cx="40" cy="40" r="15" fill="#0d2137" />
      {/* Central dot */}
      <circle cx="40" cy="40" r="3.5" fill="#FF9933" />
      {/* Spokes — 24 Ashoka-style spokes */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i * 360) / 24
        const rad = (angle * Math.PI) / 180
        const x1 = 40 + 4 * Math.cos(rad)
        const y1 = 40 + 4 * Math.sin(rad)
        const x2 = 40 + 14 * Math.cos(rad)
        const y2 = 40 + 14 * Math.sin(rad)
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#FF9933"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )
      })}
      {/* Scale beam — symbolic weighing scale */}
      <line x1="28" y1="40" x2="52" y2="40" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="35" x2="40" y2="42" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="28" cy="42" r="3" fill="none" stroke="#ffffff" strokeWidth="1.2" />
      <circle cx="52" cy="42" r="3" fill="none" stroke="#ffffff" strokeWidth="1.2" />
    </svg>
  )
}

// ── Feature Card ────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-saffron-300 transition-all duration-200 group">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-navy-900 font-semibold text-base mb-2 group-hover:text-saffron-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

// ── Statutory Item ──────────────────────────────────────────────────────────
function StatCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-saffron-500 uppercase tracking-wider mb-1">{label}</p>
      {items.map((item) => (
        <p key={item} className="text-gray-700 text-sm font-medium">{item}</p>
      ))}
    </div>
  )
}

// ── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Tricolor strip */}
      <div
        className="h-2 w-full flex-shrink-0"
        style={{
          background: 'linear-gradient(to right, #FF9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%)',
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-navy-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Left: branding */}
          <div className="flex items-center gap-3">
            <DoCAEmblem />
            <div>
              <p className="text-white font-bold text-base leading-tight tracking-wide">
                NAWI Report System
              </p>
              <p className="text-saffron-400 text-xs leading-tight">
                Department of Consumer Affairs
              </p>
            </div>
          </div>

          {/* Right: login */}
          <Link
            to="/login"
            className="bg-saffron-500 hover:bg-saffron-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:ring-offset-2 focus:ring-offset-navy-900"
          >
            Login
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071425 0%, #0d2137 55%, #1e3a56 100%)' }}
      >
        {/* subtle background grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-saffron-500/20 border border-saffron-500/40 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
            <span className="text-saffron-300 text-xs font-semibold tracking-wider uppercase">
              SIH 2026 — Problem Statement SIH26035
            </span>
          </div>

          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 max-w-4xl mx-auto">
            NAWI Type Evaluation Report System
          </h1>
          <p className="text-navy-200 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Software for Generation of Test Reports for Non-Automatic Weighing Instruments
            per{' '}
            <span className="text-saffron-300 font-semibold">OIML R&nbsp;76-1:2006</span>
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link
              to="/login"
              className="bg-saffron-500 hover:bg-saffron-600 text-white font-semibold px-7 py-3 rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:ring-offset-2 focus:ring-offset-navy-900"
            >
              🚀 Launch Portal
            </Link>
            <Link
              to="/login"
              className="border-2 border-white/60 hover:border-white text-white hover:bg-white/10 font-semibold px-7 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-navy-900"
            >
              📋 Start New Evaluation
            </Link>
          </div>

          {/* Stat badges */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: '17 Test Modules' },
              { label: 'R 76-1:2006 Compliant' },
              { label: '4 Accuracy Classes' },
            ].map(({ label }) => (
              <span
                key={label}
                className="bg-white/10 border border-white/20 text-white/90 text-xs font-medium px-4 py-1.5 rounded-full backdrop-blur-sm"
              >
                ✓ {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-navy-900 text-2xl font-bold text-center mb-2">
          Built for Legal Metrology
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          End-to-end test report generation, compliance checks, and archival — all in one system.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="⚖️"
            title="R 76 Test Modules"
            description="17 standardized test sections per OIML R 76-1:2006 Annex A & B. Auto-calculated errors, mpe lookup, and per-row pass/fail verdict."
          />
          <FeatureCard
            icon="🔢"
            title="Auto Compliance Engine"
            description="Rule-based engine using versioned JSON rule sets. Decimal-safe arithmetic for precise e-division comparisons. Live validation with formula popovers."
          />
          <FeatureCard
            icon="📄"
            title="Report Repository"
            description="Searchable archive with instrument-wise history, multi-step workflow (Draft→Approved), role-based access and digital signature verification."
          />
        </div>
      </section>

      {/* ── Statutory Framework ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-saffron-500 rounded-full" />
            <h2 className="text-navy-900 text-xl font-bold">Statutory Framework</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            <StatCard
              label="Enforcing Organization"
              items={['Department of Consumer Affairs (DoCA)', 'Ministry of Consumer Affairs, Food & Public Distribution']}
            />
            <div className="pt-6 sm:pt-0 sm:pl-8">
              <StatCard
                label="Statutory Legislation"
                items={['Legal Metrology Act, 2009', 'Legal Metrology (General) Rules, 2011']}
              />
            </div>
            <div className="pt-6 sm:pt-0 sm:pl-8">
              <StatCard
                label="OIML Standard"
                items={['OIML R 76-1:2006 (Non-automatic weighing instruments)', 'OIML R 76-2:1993 (Test report format)']}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-navy-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-gray-400 text-sm">
            Smart India Hackathon 2026&nbsp;|&nbsp;Problem Statement SIH26035&nbsp;|&nbsp;Department of Consumer Affairs (DoCA)
          </p>
          <p className="text-gray-600 text-xs mt-1">
            © 2026 Government of India. All rights reserved. | Legal Metrology Division
          </p>
        </div>
      </footer>
    </div>
  )
}
