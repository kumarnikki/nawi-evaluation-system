/**
 * LandingPage.tsx
 * High-impact, responsive, and interactive landing page for the NAWI Type Evaluation Report System.
 * Designed for SIH 2026 (Problem Statement 26035) for Department of Consumer Affairs (DoCA),
 * Ministry of Consumer Affairs, Food & Public Distribution, Government of India.
 */
import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Calculator,
  Sliders,
  Award,
  Zap,
  Thermometer,
  ArrowRight,
  Search,
  ExternalLink,
  Menu,
  X,
  User,
  Sparkles,
  ChevronRight,
  Layers,
  Clock,
  Radio,
  RotateCcw,
  Check,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DEMO_ACCOUNTS } from '@/lib/mockAuth'
import type { AccuracyClass } from '@/engine/types'

// ── DoCA Ashoka-style SVG Emblem ──────────────────────────────────────────
function DoCAEmblem({ size = 48 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Department of Consumer Affairs emblem"
      className="shrink-0"
    >
      <circle cx="40" cy="40" r="38" fill="#FF9933" />
      <circle cx="40" cy="40" r="30" fill="#ffffff" />
      <circle cx="40" cy="40" r="22" fill="#138808" />
      <circle cx="40" cy="40" r="15" fill="#0d2137" />
      <circle cx="40" cy="40" r="3.5" fill="#FF9933" />
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
      <line x1="28" y1="40" x2="52" y2="40" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="35" x2="40" y2="42" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="28" cy="42" r="3" fill="none" stroke="#ffffff" strokeWidth="1.2" />
      <circle cx="52" cy="42" r="3" fill="none" stroke="#ffffff" strokeWidth="1.2" />
    </svg>
  )
}

// ── 17 OIML R 76 Test Modules Data ─────────────────────────────────────────
interface TestModuleInfo {
  id: string
  code: string
  title: string
  category: 'metrological' | 'environmental' | 'emc' | 'endurance'
  clause: string
  description: string
  passCriteria: string
}

const TEST_MODULES: TestModuleInfo[] = [
  {
    id: 'static-weighing',
    code: 'A.4.4',
    title: 'Static Weighing Performance Test',
    category: 'metrological',
    clause: 'OIML R 76-1 A.4.4',
    description: 'Evaluation with at least 10 test loads up to Max capacity, measuring error on loading and unloading steps.',
    passCriteria: 'Error E ≤ MPE (±0.5e, ±1.0e, or ±1.5e depending on test load)',
  },
  {
    id: 'eccentricity',
    code: 'A.4.7',
    title: 'Eccentricity (Corner Load) Test',
    category: 'metrological',
    clause: 'OIML R 76-1 A.4.7',
    description: 'Applies 1/3 (Max + Tare) to off-center positions (corners 1–4 and center) to ensure structural stability.',
    passCriteria: 'Maximum error in any position ≤ MPE for the test load',
  },
  {
    id: 'repeatability',
    code: 'A.4.10',
    title: 'Repeatability Test',
    category: 'metrological',
    clause: 'OIML R 76-1 A.4.10',
    description: '3 series of 10 loadings at 50% Max and 100% Max under identical conditions to assess measurement dispersion.',
    passCriteria: 'Difference between max and min indication (Pmax - Pmin) ≤ |MPE|',
  },
  {
    id: 'discrimination',
    code: 'A.4.8',
    title: 'Discrimination Test',
    category: 'metrological',
    clause: 'OIML R 76-1 A.4.8',
    description: 'Gently placing additional load (1.4d) on instrument at equilibrium to observe indication change.',
    passCriteria: 'Instrument must visibly increment indication by at least 1d',
  },
  {
    id: 'tare-weighing',
    code: 'A.4.6',
    title: 'Tare Weighing & Subtractive Tare Test',
    category: 'metrological',
    clause: 'OIML R 76-1 A.4.6',
    description: 'Evaluates net indication accuracy with tare load set across various operational range points.',
    passCriteria: 'Net indication error ≤ MPE for net load; tare rounding ≤ 0.25e',
  },
  {
    id: 'creep-zero-return',
    code: 'A.4.11',
    title: 'Creep & Zero Return Test',
    category: 'metrological',
    clause: 'OIML R 76-1 A.4.11',
    description: 'Constant load near Max kept on load receptor for 4 hours; monitored at 0, 5, 15, and 30 minutes.',
    passCriteria: 'Indication variation within 30 min ≤ 0.5e; 15 to 30 min change ≤ 0.2e; zero return ≤ 0.5e',
  },
  {
    id: 'tilt-testing',
    code: 'A.5.1',
    title: 'Tilt Sensitivity Test',
    category: 'metrological',
    clause: 'OIML R 76-1 A.5.1',
    description: 'Evaluates Class II, III, and IIII instruments tilted forwards, backwards, and sideways by up to 50/1000.',
    passCriteria: 'No-load zero shift ≤ 2e; loaded indication error ≤ MPE',
  },
  {
    id: 'warm-up',
    code: 'A.5.2',
    title: 'Warm-up Period Test',
    category: 'metrological',
    clause: 'OIML R 76-1 A.5.2',
    description: 'Tested immediately after connection to supply and at 5, 15, and 30 minutes of energization.',
    passCriteria: 'Shift |E_L - E_0| ≤ MPE for load applied',
  },
  {
    id: 'static-temperatures',
    code: 'A.5.3',
    title: 'Static Temperatures Test (-10°C to +40°C)',
    category: 'environmental',
    clause: 'OIML R 76-1 A.5.3',
    description: 'Tested at Reference (20°C), High (+40°C), Low (-10°C), and 5°C steps to measure temperature coefficient of zero.',
    passCriteria: 'Zero drift ≤ 1e per 5°C (Class II/III/IIII); span error within MPE',
  },
  {
    id: 'damp-heat-steady',
    code: 'B.2.2',
    title: 'Damp Heat Steady State Test',
    category: 'environmental',
    clause: 'OIML R 76-1 B.2.2',
    description: 'Exposed to 85% relative humidity at +40°C for 48 hours in environmental climatic chamber.',
    passCriteria: 'All span and zero indications remain within initial verification MPE',
  },
  {
    id: 'voltage-variations',
    code: 'A.5.4',
    title: 'Voltage Variations Test',
    category: 'environmental',
    clause: 'OIML R 76-1 A.5.4',
    description: 'Operated at Nominal, -15% under-voltage (0.85 Un), and +10% over-voltage (1.10 Un) mains levels.',
    passCriteria: 'Indication remains within MPE; no significant fault occurs',
  },
  {
    id: 'power-reductions',
    code: 'B.3.1',
    title: 'Short-Time Power Reductions (Dips & Interruptions)',
    category: 'emc',
    clause: 'OIML R 76-1 B.3.1',
    description: 'Mains reductions of 0% supply and 50% supply for 0.5 to 1 full electrical cycle (10 repetitions).',
    passCriteria: 'Difference between indication with disturbance and without ≤ 1e, or fault detected',
  },
  {
    id: 'bursts',
    code: 'B.3.2',
    title: 'Electrical Fast Transient / Burst Immunity',
    category: 'emc',
    clause: 'OIML R 76-1 B.3.2',
    description: 'Injection of 1 kV transients on AC power supply lines and 0.5 kV on I/O communication cables.',
    passCriteria: 'Significant fault (> 1e error) must be detected and inhibited by instrument',
  },
  {
    id: 'esd',
    code: 'B.3.3',
    title: 'Electrostatic Discharge (ESD) Immunity',
    category: 'emc',
    clause: 'OIML R 76-1 B.3.3',
    description: 'Direct contact discharges (up to 6 kV) and air discharges (up to 8 kV) applied to accessible metal enclosures.',
    passCriteria: 'No change in stored legal metrology parameters; transient variation ≤ 1e or fault displayed',
  },
  {
    id: 'radiated-rf',
    code: 'B.3.4',
    title: 'Radiated Radio-Frequency Electromagnetic Field',
    category: 'emc',
    clause: 'OIML R 76-1 B.3.4',
    description: 'RF field exposure from 26 MHz to 1000 MHz at 3 V/m field strength with 80% AM modulation.',
    passCriteria: 'Indication deviation during irradiation ≤ 1e, or instrument blanks indication',
  },
  {
    id: 'conducted-rf',
    code: 'B.3.6',
    title: 'Conducted Radio-Frequency Disturbances',
    category: 'emc',
    clause: 'OIML R 76-1 B.3.6',
    description: 'RF current injection from 150 kHz to 80 MHz into mains and interface cables at 140 dBµV.',
    passCriteria: 'Indication error ≤ 1e; zero tracking retains calibration integrity',
  },
  {
    id: 'span-stability',
    code: 'B.4',
    title: 'Span Stability Test (28-day drift evaluation)',
    category: 'endurance',
    clause: 'OIML R 76-1 B.4',
    description: 'Repeated span measurements taken over 28 consecutive days under varying ambient baseline conditions.',
    passCriteria: 'Maximum span drift over entire 28-day testing regimen ≤ 0.5e',
  },
]

// ── Calculator Presets ──────────────────────────────────────────────────────
interface CalculatorPreset {
  name: string
  cls: AccuracyClass
  max: number
  e: number
  unit: string
}

const CALCULATOR_PRESETS: CalculatorPreset[] = [
  { name: 'Grocery / Retail Counter Scale', cls: 'III', max: 15000, e: 5, unit: 'g' },
  { name: 'Jewellery Analytical Balance', cls: 'I', max: 220, e: 0.001, unit: 'g' },
  { name: 'Laboratory Precision Scale', cls: 'II', max: 3000, e: 0.05, unit: 'g' },
  { name: 'Heavy Industrial Weighbridge', cls: 'III', max: 60000, e: 20, unit: 'kg' },
]

export default function LandingPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  // Navigation mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Quick verification query state
  const [verifyQuery, setVerifyQuery] = useState('')

  // 17 Modules active filter tab
  const [activeModuleTab, setActiveModuleTab] = useState<
    'all' | 'metrological' | 'environmental' | 'emc' | 'endurance'
  >('all')
  const [expandedModule, setExpandedModule] = useState<string | null>('static-weighing')

  // Live Calculator State
  const [selectedClass, setSelectedClass] = useState<AccuracyClass>('III')
  const [calcMax, setCalcMax] = useState<number>(15000)
  const [calcE, setCalcE] = useState<number>(5)
  const [testLoad, setTestLoad] = useState<number>(5000)
  const [testIndication, setTestIndication] = useState<number>(5002)

  // Demo user logging in state
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null)

  // Calculations for Live Calculator
  const calcResults = useMemo(() => {
    const n = calcE > 0 ? Math.round(calcMax / calcE) : 0

    // Table 6 thresholds based on class
    let t1 = 500
    let t2 = 2000
    let t3: number | null = 10000

    if (selectedClass === 'I') {
      t1 = 50000
      t2 = 200000
      t3 = null
    } else if (selectedClass === 'II') {
      t1 = 5000
      t2 = 20000
      t3 = 100000
    } else if (selectedClass === 'III') {
      t1 = 500
      t2 = 2000
      t3 = 10000
    } else if (selectedClass === 'IIII') {
      t1 = 50
      t2 = 200
      t3 = 1000
    }

    // Check Table 3 n range
    let nValid = true
    let nMinRequired = 100
    let nMaxAllowed = 10000
    if (selectedClass === 'I') {
      nMinRequired = 50000
      nMaxAllowed = 10000000
      nValid = n >= 50000
    } else if (selectedClass === 'II') {
      nMinRequired = 100
      nMaxAllowed = 100000
      nValid = n >= 100 && n <= 100000
    } else if (selectedClass === 'III') {
      nMinRequired = 500
      nMaxAllowed = 10000
      nValid = n >= 100 && n <= 10000
    } else if (selectedClass === 'IIII') {
      nMinRequired = 100
      nMaxAllowed = 1000
      nValid = n >= 100 && n <= 1000
    }

    // Load step in 'e' units
    const loadInE = calcE > 0 ? testLoad / calcE : 0
    let mpeFraction = 0.5
    if (loadInE <= t1) {
      mpeFraction = 0.5
    } else if (loadInE <= t2) {
      mpeFraction = 1.0
    } else {
      mpeFraction = 1.5
    }

    const mpeValue = mpeFraction * calcE
    const errorValue = testIndication - testLoad
    const isPass = Math.abs(errorValue) <= mpeValue

    return {
      n,
      t1,
      t2,
      t3,
      nValid,
      nMinRequired,
      nMaxAllowed,
      loadInE,
      mpeFraction,
      mpeValue,
      errorValue,
      isPass,
      step1MaxLoad: t1 * calcE,
      step2MaxLoad: t2 * calcE,
    }
  }, [selectedClass, calcMax, calcE, testLoad, testIndication])

  // Handle Quick Demo Login
  const handleDemoLogin = async (email: string, password: string, roleName: string) => {
    setLoggingInRole(roleName)
    try {
      const res = await login(email, password)
      if (res.user) {
        if (res.user.role === 'technician') {
          navigate('/reports/new')
        } else if (res.user.role === 'admin') {
          navigate('/rulesets')
        } else {
          navigate('/dashboard')
        }
      }
    } finally {
      setLoggingInRole(null)
    }
  }

  // Handle Verify Quick Jump
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyQuery.trim()) return
    const clean = verifyQuery.trim()
    if (clean.toLowerCase().startsWith('rep-') || clean.toLowerCase().includes('rep')) {
      navigate(`/verify/report/${encodeURIComponent(clean)}`)
    } else {
      navigate(`/verify/cert/${encodeURIComponent(clean)}`)
    }
  }

  const filteredModules = useMemo(() => {
    if (activeModuleTab === 'all') return TEST_MODULES
    return TEST_MODULES.filter((m) => m.category === activeModuleTab)
  }, [activeModuleTab])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-saffron-500 selection:text-white">
      {/* Tricolor National Identity Ribbon */}
      <div
        className="h-2 w-full flex-shrink-0 shadow-xs"
        style={{
          background:
            'linear-gradient(to right, #FF9933 0%, #FF9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%, #138808 100%)',
        }}
      />

      {/* ── Sticky Header Navigation ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-navy-950/95 backdrop-blur-md border-b border-navy-800/80 shadow-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Branding */}
            <Link to="/" className="flex items-center gap-3 group">
              <DoCAEmblem size={44} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-base sm:text-lg leading-none tracking-wide group-hover:text-saffron-300 transition-colors">
                    NAWI Report System
                  </span>
                  <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase bg-saffron-500/20 text-saffron-300 border border-saffron-400/30 rounded">
                    SIH 26035
                  </span>
                </div>
                <p className="text-saffron-400 text-xs leading-none mt-1 font-medium">
                  Department of Consumer Affairs • Legal Metrology Division
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm text-slate-300">
              <a href="#features" className="hover:text-saffron-300 transition-colors">
                Key Features
              </a>
              <a href="#calculator" className="hover:text-saffron-300 transition-colors flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-saffron-400" /> Live Calculator
              </a>
              <a href="#modules" className="hover:text-saffron-300 transition-colors">
                17 Test Modules
              </a>
              <a href="#demo-access" className="hover:text-saffron-300 transition-colors">
                Demo Roles
              </a>
              <a href="#verify" className="hover:text-saffron-300 transition-colors">
                Verify Certificate
              </a>
            </nav>

            {/* Right: Auth & CTAs */}
            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3 bg-navy-900/90 border border-navy-700/80 px-3 py-1.5 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">{user.name}</span>
                    <span className="text-[10px] uppercase font-bold bg-navy-800 text-saffron-400 px-1.5 py-0.5 rounded border border-navy-600">
                      {user.role}
                    </span>
                  </div>
                  <Link
                    to="/dashboard"
                    className="bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-semibold px-3 py-1.5 rounded shadow transition-all flex items-center gap-1"
                  >
                    Dashboard <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    to="/verify"
                    className="text-slate-300 hover:text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-navy-900 transition-colors"
                  >
                    Public Verification
                  </Link>
                  <Link
                    to="/login"
                    className="bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-saffron-400"
                  >
                    <User className="w-3.5 h-3.5" /> Officer Login
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-900 focus:outline-none"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navy-900 border-b border-navy-800 px-4 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-200 hover:text-saffron-400 py-1"
            >
              Key Features
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-200 hover:text-saffron-400 py-1"
            >
              Live OIML Calculator
            </a>
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-200 hover:text-saffron-400 py-1"
            >
              17 Test Modules
            </a>
            <a
              href="#demo-access"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-200 hover:text-saffron-400 py-1"
            >
              Demo Roles &amp; Logins
            </a>
            <a
              href="#verify"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-200 hover:text-saffron-400 py-1"
            >
              Verify Certificate / Report
            </a>
            <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full text-center bg-saffron-500 hover:bg-saffron-600 text-white font-semibold py-2 rounded-lg text-sm"
                >
                  Go to Dashboard ({user.name})
                </Link>
              ) : (
                <div className="flex gap-2 w-full">
                  <Link
                    to="/verify"
                    className="flex-1 text-center bg-navy-800 text-slate-200 py-2 rounded-lg text-xs"
                  >
                    Public Verify
                  </Link>
                  <Link
                    to="/login"
                    className="flex-1 text-center bg-saffron-500 text-white font-bold py-2 rounded-lg text-xs"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white pt-14 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Ambient glow accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* SIH 2026 Problem Statement Pill */}
          <div className="inline-flex items-center gap-2 bg-saffron-500/15 border border-saffron-400/30 rounded-full px-4 py-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
            <span className="text-saffron-300 text-xs font-semibold tracking-wider uppercase">
              SIH 2026 — Problem Statement SIH26035
            </span>
            <span className="text-navy-400 text-xs">•</span>
            <span className="text-slate-300 text-xs hidden sm:inline">
              Department of Consumer Affairs (DoCA)
            </span>
          </div>

          {/* Main Title */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none">
              NAWI Type Evaluation <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-saffron-300 via-amber-200 to-white bg-clip-text text-transparent">
                Report &amp; Certification System
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
              Automated end-to-end metrological test evaluation, mathematical MPE computation,
              and tamper-evident statutory certification for Non-Automatic Weighing Instruments conforming to{' '}
              <span className="text-saffron-300 font-semibold underline decoration-saffron-400/50 underline-offset-4">
                OIML R 76-1:2006
              </span>{' '}
              and the Indian Legal Metrology Rules, 2011.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              to={user ? '/dashboard' : '/login'}
              className="bg-saffron-500 hover:bg-saffron-600 active:scale-95 text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-xl shadow-lg shadow-saffron-500/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {user ? 'Open Officer Dashboard' : 'Launch Inspection Portal'}
            </Link>

            <Link
              to={user ? '/reports/new' : '/login'}
              className="bg-navy-800/80 hover:bg-navy-700/80 active:scale-95 text-white border border-navy-600 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4 text-saffron-400" />
              Start New Evaluation
            </Link>

            <a
              href="#calculator"
              className="text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 text-sm sm:text-base px-5 py-3.5 rounded-xl transition-all flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-saffron-400" />
              Try Live Calculator
            </a>
          </div>

          {/* Interactive Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 text-left">
            <div className="bg-navy-900/60 border border-navy-700/60 rounded-xl p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-saffron-400 text-xs font-semibold uppercase mb-1">
                <ShieldCheck className="w-4 h-4" /> Compliance
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">100% OIML</div>
              <p className="text-slate-400 text-[11px] mt-0.5">R 76-1:2006 &amp; R 76-2:1993</p>
            </div>

            <div className="bg-navy-900/60 border border-navy-700/60 rounded-xl p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase mb-1">
                <Layers className="w-4 h-4" /> Protocols
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">17 Test Modules</div>
              <p className="text-slate-400 text-[11px] mt-0.5">Annex A &amp; Annex B Standard</p>
            </div>

            <div className="bg-navy-900/60 border border-navy-700/60 rounded-xl p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase mb-1">
                <Scale className="w-4 h-4" /> Classes
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">I, II, III, IIII</div>
              <p className="text-slate-400 text-[11px] mt-0.5">Micro-gram to 100t Weighbridge</p>
            </div>

            <div className="bg-navy-900/60 border border-navy-700/60 rounded-xl p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase mb-1">
                <Award className="w-4 h-4" /> Integrity
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">SHA-256 Seal</div>
              <p className="text-slate-400 text-[11px] mt-0.5">QR Verification &amp; Cryptography</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Interactive Live Metrology Calculator ──────────────────── */}
      <section id="calculator" className="py-16 sm:py-20 bg-white border-b border-gray-200 scroll-mt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-100 text-saffron-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5 text-saffron-600" /> Interactive Engine Demo
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-950">
              Live OIML R 76 Metrological Calculator
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Experience the core calculation engine in real time. Select an accuracy class and capacity to inspect Table 3 scale divisions and Table 6 permissible error thresholds.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="text-xs font-semibold text-gray-500 uppercase mr-1">Presets:</span>
            {CALCULATOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setSelectedClass(preset.cls)
                  setCalcMax(preset.max)
                  setCalcE(preset.e)
                  setTestLoad(Math.round(preset.max * 0.4))
                  setTestIndication(Math.round(preset.max * 0.4) + preset.e * 0.5)
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  selectedClass === preset.cls && calcMax === preset.max && calcE === preset.e
                    ? 'bg-navy-900 text-white border-navy-900 font-semibold shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Controls (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              <h3 className="font-bold text-navy-900 text-base flex items-center justify-between">
                <span>1. Instrument Parameters</span>
                <span className="text-xs text-saffron-600 font-semibold bg-saffron-50 px-2 py-0.5 rounded border border-saffron-200">
                  Live Inputs
                </span>
              </h3>

              {/* Class Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Accuracy Class (Clause 3.2, Table 3)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['I', 'II', 'III', 'IIII'] as AccuracyClass[]).map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        selectedClass === cls
                          ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Class {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Capacity and Scale Interval */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Max Capacity (Max)
                  </label>
                  <input
                    type="number"
                    value={calcMax}
                    onChange={(e) => setCalcMax(parseFloat(e.target.value) || 0)}
                    className="form-input text-xs w-full font-mono font-bold"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Full scale capacity</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Scale Interval (<i>e</i>)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={calcE}
                    onChange={(e) => setCalcE(parseFloat(e.target.value) || 0.001)}
                    className="form-input text-xs w-full font-mono font-bold"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Verification interval</span>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Interactive Load Tester */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-navy-700" />
                  Simulate a Test Load Point
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Test Load (<i>L</i>)</label>
                    <input
                      type="number"
                      value={testLoad}
                      onChange={(e) => setTestLoad(parseFloat(e.target.value) || 0)}
                      className="form-input text-xs w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Indication (<i>I</i>)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={testIndication}
                      onChange={(e) => setTestIndication(parseFloat(e.target.value) || 0)}
                      className="form-input text-xs w-full font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Outputs & Visual Steps (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-gray-200 rounded-xl p-4">
                  <span className="text-xs text-gray-500 font-medium block">Total Scale Intervals (<i>n</i>)</span>
                  <div className="text-2xl font-bold font-mono text-navy-900 mt-1">
                    {calcResults.n.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Formula: Max / <i>e</i>
                  </span>
                </div>

                <div className="bg-slate-50 border border-gray-200 rounded-xl p-4">
                  <span className="text-xs text-gray-500 font-medium block">Table 3 Conformance</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {calcResults.nValid ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 text-xs font-bold px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 text-xs font-bold px-2 py-0.5 rounded-full">
                        <X className="w-3.5 h-3.5" /> OUT OF BOUNDS
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Range: {calcResults.nMinRequired.toLocaleString()} – {calcResults.nMaxAllowed.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 border border-gray-200 rounded-xl p-4">
                  <span className="text-xs text-gray-500 font-medium block">Simulated Verdict</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {calcResults.isPass ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 text-xs font-bold px-2 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5" /> COMPLIANT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 text-xs font-bold px-2 py-0.5 rounded-full">
                        <X className="w-3.5 h-3.5" /> EXCEEDS MPE
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Error: {calcResults.errorValue >= 0 ? `+${calcResults.errorValue}` : calcResults.errorValue} (MPE: ±{calcResults.mpeValue})
                  </span>
                </div>
              </div>

              {/* Table 6 Step Breakdown Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h4 className="font-bold text-navy-900 text-sm flex items-center gap-2">
                    <Scale className="w-4 h-4 text-saffron-500" />
                    Table 6 Permissible Error Steps for Class {selectedClass}
                  </h4>
                  <span className="text-xs font-mono text-gray-400">R 76-1 Clause 3.6.1</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-emerald-900 text-xs block">
                        Step 1: Lower Range (0 to {calcResults.t1.toLocaleString()} <i>e</i>)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Loads: 0 up to {calcResults.step1MaxLoad.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-emerald-600 text-white font-bold px-2.5 py-1 rounded text-xs">
                        MPE = ±0.5 <i>e</i> (±{(0.5 * calcE).toFixed(3)})
                      </span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-amber-900 text-xs block">
                        Step 2: Medium Range ({calcResults.t1.toLocaleString()} <i>e</i> to {calcResults.t2.toLocaleString()} <i>e</i>)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Loads: {calcResults.step1MaxLoad.toLocaleString()} to {calcResults.step2MaxLoad.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-amber-600 text-white font-bold px-2.5 py-1 rounded text-xs">
                        MPE = ±1.0 <i>e</i> (±{(1.0 * calcE).toFixed(3)})
                      </span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-rose-900 text-xs block">
                        Step 3: Upper Range (&gt; {calcResults.t2.toLocaleString()} <i>e</i>
                        {calcResults.t3 ? ` to ${calcResults.t3.toLocaleString()} e` : ''})
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Loads: Above {calcResults.step2MaxLoad.toLocaleString()} up to Max ({calcMax.toLocaleString()})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-rose-600 text-white font-bold px-2.5 py-1 rounded text-xs">
                        MPE = ±1.5 <i>e</i> (±{(1.5 * calcE).toFixed(3)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Explore by Role & 1-Click Demo Logins ─────────────────── */}
      <section id="demo-access" className="py-16 sm:py-20 bg-slate-100 border-b border-gray-200 scroll-mt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-100 text-navy-800 text-xs font-bold uppercase tracking-wider mb-2">
              <User className="w-3.5 h-3.5 text-navy-700" /> Interactive Persona Access
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-950">
              Role-Based Access for Every Stakeholder
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Explore the platform as an inspector, technical reviewer, director, or standards administrator. Click any demo persona below for immediate 1-click access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Persona 1: Lead Technician */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mb-4">
                  🔬
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-blue-600 uppercase">Technician</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">Testing Lab</span>
                </div>
                <h3 className="font-bold text-navy-950 text-base mb-1">Priya Sharma</h3>
                <p className="text-xs text-gray-500 mb-3">technician@nawi.gov.in</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Conducts 17 OIML R 76 tests, enters raw scale readings, performs repeatability &amp; eccentricity runs, and generates draft reports.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDemoLogin('technician@nawi.gov.in', 'Tech@123', 'Technician')}
                disabled={loggingInRole === 'Technician'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {loggingInRole === 'Technician' ? 'Logging in...' : 'Launch as Technician →'}
              </button>
            </div>

            {/* Persona 2: Quality Reviewer */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg mb-4">
                  📋
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-purple-600 uppercase">Reviewer</span>
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold">QA Cell</span>
                </div>
                <h3 className="font-bold text-navy-950 text-base mb-1">Amit Verma</h3>
                <p className="text-xs text-gray-500 mb-3">reviewer@nawi.gov.in</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Verifies decimal math, reviews test anomalies, validates climatic chamber logs, and recommends reports for statutory approval.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDemoLogin('reviewer@nawi.gov.in', 'Review@123', 'Reviewer')}
                disabled={loggingInRole === 'Reviewer'}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {loggingInRole === 'Reviewer' ? 'Logging in...' : 'Launch as Reviewer →'}
              </button>
            </div>

            {/* Persona 3: Approving Authority */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-saffron-100 text-saffron-700 flex items-center justify-center font-bold text-lg mb-4">
                  ⚖️
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-saffron-600 uppercase">Approver</span>
                  <span className="text-[10px] bg-saffron-50 text-saffron-700 px-2 py-0.5 rounded font-semibold">Directorate</span>
                </div>
                <h3 className="font-bold text-navy-950 text-base mb-1">Dr. Sunita Patel</h3>
                <p className="text-xs text-gray-500 mb-3">approver@nawi.gov.in</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Authorizes final test evaluations, issues tamper-evident OIML Pattern Approval Certificates, and executes digital signatures.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDemoLogin('approver@nawi.gov.in', 'Approve@123', 'Approver')}
                disabled={loggingInRole === 'Approver'}
                className="w-full bg-saffron-600 hover:bg-saffron-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {loggingInRole === 'Approver' ? 'Logging in...' : 'Launch as Approver →'}
              </button>
            </div>

            {/* Persona 4: System Admin */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
                  ⚙️
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-emerald-600 uppercase">Administrator</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">DoCA Admin</span>
                </div>
                <h3 className="font-bold text-navy-950 text-base mb-1">Dr. Rajesh Kumar</h3>
                <p className="text-xs text-gray-500 mb-3">admin@nawi.gov.in</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Configures visual metrological rulesets, inspects audit logs, manages user permissions, and customizes national tolerances.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@nawi.gov.in', 'Admin@123', 'Admin')}
                disabled={loggingInRole === 'Admin'}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {loggingInRole === 'Admin' ? 'Logging in...' : 'Launch as Admin →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: 17 OIML R 76-1 Test Modules Explorer ───────────────────── */}
      <section id="modules" className="py-16 sm:py-20 bg-white border-b border-gray-200 scroll-mt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-emerald-600" /> Full Standard Coverage
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-950">
              17 Standardized OIML R 76 Test Modules
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              All statutory test protocols defined in OIML R 76-1:2006 Annex A and Annex B are fully supported with deterministic decimal validation.
            </p>
          </div>

          {/* Module Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setActiveModuleTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeModuleTab === 'all'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Modules (17)
            </button>
            <button
              type="button"
              onClick={() => setActiveModuleTab('metrological')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeModuleTab === 'metrological'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Metrological (Annex A.4)
            </button>
            <button
              type="button"
              onClick={() => setActiveModuleTab('environmental')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeModuleTab === 'environmental'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Environmental (Annex A.5 &amp; B.2)
            </button>
            <button
              type="button"
              onClick={() => setActiveModuleTab('emc')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeModuleTab === 'emc'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              EMC Disturbances (Annex B.3)
            </button>
            <button
              type="button"
              onClick={() => setActiveModuleTab('endurance')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeModuleTab === 'endurance'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Span &amp; Endurance (Annex B.4)
            </button>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((mod) => {
              const isExpanded = expandedModule === mod.id

              return (
                <div
                  key={mod.id}
                  onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isExpanded
                      ? 'border-saffron-400 bg-saffron-50/20 shadow-md ring-1 ring-saffron-300'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-navy-800 bg-navy-100 px-2 py-0.5 rounded">
                      {mod.code}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">{mod.clause}</span>
                  </div>

                  <h3 className="font-bold text-navy-900 text-sm mb-2">{mod.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-3">{mod.description}</p>

                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-saffron-700 uppercase tracking-wider block mb-0.5">
                      Statutory Pass Criteria:
                    </span>
                    <p className="text-xs text-navy-900 font-medium">{mod.passCriteria}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Section: Instant Public Verification ───────────────────────────── */}
      <section id="verify" className="py-16 sm:py-20 bg-gradient-to-br from-navy-950 to-navy-900 text-white scroll-mt-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-500/20 text-saffron-300 text-xs font-bold uppercase tracking-wider border border-saffron-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-saffron-400" /> Tamper-Evident Metrological Trust
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Verify an OIML Certificate or Test Report
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
              Inspect statutory authenticity, legal status, cryptographic hash signatures, and laboratory accreditation using the unique document number.
            </p>
          </div>

          {/* Interactive Search Box */}
          <form onSubmit={handleVerifySubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 bg-navy-900/90 p-2 rounded-2xl border border-navy-700 shadow-xl backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={verifyQuery}
                  onChange={(e) => setVerifyQuery(e.target.value)}
                  placeholder="e.g. R76/2006-A-IN01-2026.01 or REP-2026-001"
                  className="w-full bg-navy-950 text-white text-xs sm:text-sm pl-9 pr-3 py-3 rounded-xl border border-navy-800 focus:outline-none focus:border-saffron-400 font-mono"
                />
              </div>
              <button
                type="submit"
                className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                Verify Record <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Sample Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
              <span>Try sample:</span>
              <button
                type="button"
                onClick={() => setVerifyQuery('R76/2006-A-IN01-2026.01')}
                className="font-mono text-saffron-300 hover:underline bg-navy-800/80 px-2 py-0.5 rounded border border-navy-700"
              >
                R76/2006-A-IN01-2026.01
              </button>
              <button
                type="button"
                onClick={() => setVerifyQuery('REP-2026-001')}
                className="font-mono text-saffron-300 hover:underline bg-navy-800/80 px-2 py-0.5 rounded border border-navy-700"
              >
                REP-2026-001
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Section: Statutory Legal Metrology Framework ───────────────────── */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-2xl border border-gray-200 p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-saffron-500 rounded-full" />
              <div>
                <h3 className="text-navy-950 text-xl font-bold">National Statutory Framework</h3>
                <p className="text-gray-500 text-xs">Statutory mandates governing non-automatic weighing instruments in India</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
              <div className="space-y-2">
                <span className="text-xs font-bold text-saffron-600 uppercase tracking-wider block">
                  Enforcing Ministry
                </span>
                <p className="text-navy-950 font-bold text-sm">
                  Department of Consumer Affairs (DoCA)
                </p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Ministry of Consumer Affairs, Food &amp; Public Distribution, Government of India.
                </p>
              </div>

              <div className="pt-6 sm:pt-0 sm:pl-8 space-y-2">
                <span className="text-xs font-bold text-saffron-600 uppercase tracking-wider block">
                  Statutory Legislation
                </span>
                <p className="text-navy-950 font-bold text-sm">
                  Legal Metrology Act, 2009
                </p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Legal Metrology (General) Rules, 2011 (Eighth Schedule: Specifications for NAWI).
                </p>
              </div>

              <div className="pt-6 sm:pt-0 sm:pl-8 space-y-2">
                <span className="text-xs font-bold text-saffron-600 uppercase tracking-wider block">
                  International Standard
                </span>
                <p className="text-navy-950 font-bold text-sm">
                  OIML R 76-1:2006 (E)
                </p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  OIML Certificate System for Non-Automatic Weighing Instruments &amp; R 76-2 Format.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-navy-950 text-slate-400 py-10 mt-auto border-t border-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-navy-900 text-center md:text-left">
            <div className="flex items-center gap-3">
              <DoCAEmblem size={36} />
              <div>
                <p className="text-white font-bold text-sm leading-tight">
                  NAWI Type Evaluation System
                </p>
                <p className="text-saffron-400 text-xs">
                  Government of India • Ministry of Consumer Affairs
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <Link to="/verify" className="hover:text-white transition-colors">
                Public Verification
              </Link>
              <Link to="/rulesets" className="hover:text-white transition-colors">
                Ruleset Manager
              </Link>
              <Link to="/repository" className="hover:text-white transition-colors">
                Report Repository
              </Link>
              <Link to="/login" className="hover:text-white transition-colors">
                Officer Portal
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              Smart India Hackathon 2026 • Problem Statement SIH26035 • Legal Metrology Division
            </p>
            <p>
              © 2026 Department of Consumer Affairs, Government of India. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
