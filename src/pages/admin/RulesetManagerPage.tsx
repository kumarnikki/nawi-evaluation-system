/**
 * RulesetManagerPage.tsx
 * Visual and code-level management for versioned OIML and national legal metrology rulesets.
 * Designed for metrology officers and non-technical inspectors (Zero JSON knowledge needed),
 * while retaining an advanced JSON mode for technical auditors.
 */
import React, { useState, useEffect } from 'react'
import {
  Settings,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCode,
  ShieldCheck,
  Info,
  Sliders,
  Thermometer,
  Scale,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  Check,
} from 'lucide-react'
import Layout from '@/components/layout/Layout'
import { RulesetSchema, type Ruleset, type AccuracyClass } from '@/engine/types'
import defaultRuleset from '@/rulesets/oiml-r76-1-2006.json'

type ActiveTab = 'visual' | 'json'
type VisualSection = 'general' | 'mpe' | 'temperature' | 'table3' | 'tolerances'

export default function RulesetManagerPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('visual')
  const [visualSection, setVisualSection] = useState<VisualSection>('general')
  
  // Load initial ruleset from localStorage if present
  const [rulesetData, setRulesetData] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('nawi_active_ruleset')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      // fallback
    }
    return defaultRuleset
  })

  const [jsonInput, setJsonInput] = useState<string>(() =>
    JSON.stringify(rulesetData, null, 2)
  )

  const [validationResult, setValidationResult] = useState<{
    success: boolean
    message?: string
    errors?: string[]
  } | null>(null)

  const [savedNotification, setSavedNotification] = useState<string | null>(null)

  // Keep jsonInput in sync when rulesetData changes via visual form
  const updateRuleset = (updater: (prev: any) => any) => {
    setRulesetData((prev: any) => {
      const next = updater(prev)
      setJsonInput(JSON.stringify(next, null, 2))
      return next
    })
    setValidationResult(null)
  }

  // When switching from JSON to Visual, parse and synchronize
  const handleSwitchTab = (tab: ActiveTab) => {
    if (tab === 'visual') {
      try {
        const parsed = JSON.parse(jsonInput)
        setRulesetData(parsed)
      } catch (e: any) {
        setValidationResult({
          success: false,
          errors: [`Cannot switch to Visual Form: JSON contains syntax error (${e.message}). Please fix JSON first.`],
        })
        return
      }
    } else {
      setJsonInput(JSON.stringify(rulesetData, null, 2))
    }
    setActiveTab(tab)
  }

  const handleValidate = () => {
    try {
      const targetObj = activeTab === 'json' ? JSON.parse(jsonInput) : rulesetData
      const validated = RulesetSchema.safeParse(targetObj)
      if (validated.success) {
        setValidationResult({
          success: true,
          message: `Ruleset "${validated.data.name}" (${validated.data.id}) is valid and complies strictly with OIML R 76-1 RulesetSchema.`,
        })
      } else {
        const issues = validated.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`
        )
        setValidationResult({
          success: false,
          errors: issues,
        })
      }
    } catch (err: any) {
      setValidationResult({
        success: false,
        errors: [`Invalid JSON Syntax: ${err.message}`],
      })
    }
  }

  const handleActivate = () => {
    try {
      const targetObj = activeTab === 'json' ? JSON.parse(jsonInput) : rulesetData
      const validated = RulesetSchema.safeParse(targetObj)
      if (validated.success) {
        setRulesetData(validated.data)
        setJsonInput(JSON.stringify(validated.data, null, 2))
        localStorage.setItem('nawi_active_ruleset', JSON.stringify(validated.data))
        setValidationResult({
          success: true,
          message: `Ruleset "${validated.data.name}" has been successfully activated as the active system ruleset.`,
        })
        setSavedNotification('Ruleset saved & activated successfully!')
        setTimeout(() => setSavedNotification(null), 4000)
      } else {
        const issues = validated.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`
        )
        setValidationResult({
          success: false,
          errors: issues,
        })
      }
    } catch (err: any) {
      setValidationResult({
        success: false,
        errors: [`Cannot activate invalid ruleset: ${err.message}`],
      })
    }
  }

  const handleReset = () => {
    setRulesetData(defaultRuleset)
    setJsonInput(JSON.stringify(defaultRuleset, null, 2))
    localStorage.removeItem('nawi_active_ruleset')
    setValidationResult({
      success: true,
      message: 'Reset to standard OIML R 76-1:2006 statutory defaults.',
    })
    setSavedNotification('Reset to OIML R 76-1:2006 Default!')
    setTimeout(() => setSavedNotification(null), 3000)
  }

  const handleDownload = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rulesetData, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${rulesetData.id || 'ruleset'}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        const validated = RulesetSchema.safeParse(parsed)
        if (validated.success) {
          setRulesetData(validated.data)
          setJsonInput(JSON.stringify(validated.data, null, 2))
          setValidationResult({
            success: true,
            message: `Loaded "${validated.data.name}" from file. Click "Save & Activate" to apply.`,
          })
        } else {
          setValidationResult({
            success: false,
            errors: validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
          })
        }
      } catch (err: any) {
        setValidationResult({
          success: false,
          errors: [`Failed to parse JSON file: ${err.message}`],
        })
      }
    }
    reader.readAsText(file)
  }

  // Presets
  const applyPreset = (presetKey: string) => {
    if (presetKey === 'oiml') {
      handleReset()
    } else if (presetKey === 'india') {
      const indian = {
        ...defaultRuleset,
        id: 'india-legal-metrology-2011',
        name: 'Legal Metrology (General) Rules 2011 (India)',
        edition: 2011,
        effectiveDate: '2011-04-01',
        description:
          'Government of India, Ministry of Consumer Affairs — Specifications for Non-Automatic Weighing Instruments (Eighth Schedule)',
        version: '1.2.0',
        inServiceMpeMultiplier: 2,
      }
      setRulesetData(indian)
      setJsonInput(JSON.stringify(indian, null, 2))
      setValidationResult({
        success: true,
        message: 'Loaded preset: Legal Metrology (General) Rules 2011 (India). Click Save & Activate to apply.',
      })
    }
  }

  return (
    <Layout title="Rule Set Manager">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-navy-700" />
              Metrological Rule Set Manager
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Inspect, modify, and activate statutory rulesets without writing any code or JSON.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="btn btn-outline text-xs flex items-center gap-1.5 py-1.5"
              title="Download ruleset as JSON file"
            >
              <Download className="w-3.5 h-3.5" /> Download (.json)
            </button>
            <label className="btn btn-outline text-xs flex items-center gap-1.5 py-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Upload File
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline text-xs flex items-center gap-1.5 py-1.5 text-gray-700"
              title="Reset all settings to OIML R 76-1:2006 Standard"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Default
            </button>
            <button
              type="button"
              onClick={handleActivate}
              className="btn btn-saffron text-xs flex items-center gap-1.5 py-1.5 shadow-sm font-semibold"
            >
              <UploadCloud className="w-4 h-4" /> Save &amp; Activate Ruleset
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {savedNotification && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center gap-3 text-emerald-800 text-sm shadow-sm transition-all">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{savedNotification}</span>
          </div>
        )}

        {/* Active Ruleset Summary Card */}
        <div className="card space-y-4 border-l-4 border-l-saffron-500 bg-gradient-to-r from-saffron-50/20 via-white to-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-saffron-700 bg-saffron-100 px-2 py-0.5 rounded">
                  CURRENT ACTIVE STATUTORY STANDARD
                </span>
                <span className="text-xs text-gray-500 font-mono">ID: {rulesetData.id}</span>
              </div>
              <h2 className="text-xl font-bold text-navy-900 mt-1">{rulesetData.name}</h2>
              <p className="text-xs text-gray-500">{rulesetData.description}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Edition: {rulesetData.edition}</span>
              <span className="text-xs font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded">
                Version {rulesetData.version}
              </span>
            </div>
          </div>

          {/* Quick parameter summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white border border-gray-100 p-2.5 rounded shadow-2xs">
              <span className="text-gray-400 block font-medium">Class I MPE Steps</span>
              <span className="font-semibold text-navy-900">
                0.5e (≤{rulesetData.table6?.I?.t1?.toLocaleString() || '50k'}), 1.0e (≤{rulesetData.table6?.I?.t2?.toLocaleString() || '200k'})
              </span>
            </div>
            <div className="bg-white border border-gray-100 p-2.5 rounded shadow-2xs">
              <span className="text-gray-400 block font-medium">Class III MPE Steps</span>
              <span className="font-semibold text-navy-900">
                0.5e (≤{rulesetData.table6?.III?.t1?.toLocaleString() || '500'}), 1.0e (≤{rulesetData.table6?.III?.t2?.toLocaleString() || '2k'})
              </span>
            </div>
            <div className="bg-white border border-gray-100 p-2.5 rounded shadow-2xs">
              <span className="text-gray-400 block font-medium">Operating Temp Range</span>
              <span className="font-semibold text-navy-900">
                {rulesetData.temperatureDefaults?.min_C}°C to {rulesetData.temperatureDefaults?.max_C}°C
              </span>
            </div>
            <div className="bg-white border border-gray-100 p-2.5 rounded shadow-2xs">
              <span className="text-gray-400 block font-medium">In-Service Multiplier</span>
              <span className="font-semibold text-navy-900">
                {rulesetData.inServiceMpeMultiplier}× Initial Verification
              </span>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSwitchTab('visual')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'visual'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sliders className="w-4 h-4 text-saffron-400" />
              <span>Visual Form Editor</span>
              <span className="text-[10px] bg-saffron-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Recommended
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('json')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'json'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Advanced JSON Code</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Quick Standards:</span>
            <button
              type="button"
              onClick={() => applyPreset('oiml')}
              className="px-2.5 py-1 bg-white border border-gray-200 rounded text-navy-800 hover:bg-navy-50 font-medium text-xs"
            >
              OIML R 76-1:2006 Standard
            </button>
            <button
              type="button"
              onClick={() => applyPreset('india')}
              className="px-2.5 py-1 bg-white border border-gray-200 rounded text-saffron-700 hover:bg-saffron-50 font-medium text-xs flex items-center gap-1"
            >
              🇮🇳 Indian Rules 2011
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VISUAL FORM EDITOR MODE                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            {/* Sub-Navigation for Visual Form */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setVisualSection('general')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  visualSection === 'general'
                    ? 'bg-white text-navy-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                1. Standard Details &amp; Identity
              </button>
              <button
                type="button"
                onClick={() => setVisualSection('mpe')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  visualSection === 'mpe'
                    ? 'bg-white text-navy-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                2. Permissible Errors (Table 6 MPE)
              </button>
              <button
                type="button"
                onClick={() => setVisualSection('temperature')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  visualSection === 'temperature'
                    ? 'bg-white text-navy-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                3. Temperature Limits (°C)
              </button>
              <button
                type="button"
                onClick={() => setVisualSection('table3')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  visualSection === 'table3'
                    ? 'bg-white text-navy-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                4. Accuracy Classes &amp; Intervals (Table 3)
              </button>
              <button
                type="button"
                onClick={() => setVisualSection('tolerances')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  visualSection === 'tolerances'
                    ? 'bg-white text-navy-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                5. Inspection Multipliers &amp; Tests
              </button>
            </div>

            {/* SECTION 1: GENERAL & IDENTITY */}
            {visualSection === 'general' && (
              <div className="card space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                    <Info className="w-5 h-5 text-navy-700" />
                    Standard Document Details &amp; Legal Identity
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure the title, edition, and legal reference shown on certificates and verification reports.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Standard Title / Regulation Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input text-xs w-full"
                      value={rulesetData.name || ''}
                      onChange={(e) =>
                        updateRuleset((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g. OIML R 76-1:2006"
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Appears on the top header of test certificates and pattern approval records.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      System Ruleset ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input text-xs w-full font-mono bg-gray-50"
                      value={rulesetData.id || ''}
                      onChange={(e) =>
                        updateRuleset((prev) => ({ ...prev, id: e.target.value }))
                      }
                      placeholder="e.g. oiml-r76-1-2006"
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Unique alphanumeric slug used internally by the calculation engine.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Statutory Edition Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-input text-xs w-full"
                      value={rulesetData.edition || 2006}
                      onChange={(e) =>
                        updateRuleset((prev) => ({
                          ...prev,
                          edition: parseInt(e.target.value) || 2006,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Ruleset Release Version <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input text-xs w-full"
                      value={rulesetData.version || '1.0.0'}
                      onChange={(e) =>
                        updateRuleset((prev) => ({ ...prev, version: e.target.value }))
                      }
                      placeholder="e.g. 1.0.0"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      className="form-input text-xs w-full"
                      value={rulesetData.effectiveDate || '2006-01-01'}
                      onChange={(e) =>
                        updateRuleset((prev) => ({
                          ...prev,
                          effectiveDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-gray-700 mb-1">
                      Description / Scope
                    </label>
                    <textarea
                      rows={2}
                      className="form-input text-xs w-full"
                      value={rulesetData.description || ''}
                      onChange={(e) =>
                        updateRuleset((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Non-automatic weighing instruments — Metrological and technical requirements — Tests"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: TABLE 6 MPE (PERMISSIBLE ERRORS) */}
            {visualSection === 'mpe' && (
              <div className="card space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-navy-700" />
                    Maximum Permissible Errors (MPE Step Boundaries — Table 6)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure the load step limits in verification scale intervals (<i>m</i> / <i>e</i>) where the permissible error jumps from ±0.5 <i>e</i> to ±1.0 <i>e</i> to ±1.5 <i>e</i>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(['I', 'II', 'III', 'IIII'] as AccuracyClass[]).map((cls) => {
                    const entry = rulesetData.table6?.[cls] || {
                      t1: 500,
                      t2: 2000,
                      t3: 10000,
                      mpe1_e: 0.5,
                      mpe2_e: 1.0,
                      mpe3_e: 1.5,
                    }
                    const classLabels: Record<string, string> = {
                      I: 'Class I (Special Accuracy)',
                      II: 'Class II (High Accuracy)',
                      III: 'Class III (Medium Accuracy)',
                      IIII: 'Class IIII (Ordinary Accuracy)',
                    }

                    return (
                      <div
                        key={cls}
                        className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50"
                      >
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                          <span className="font-bold text-navy-900 text-sm">
                            {classLabels[cls]}
                          </span>
                          <span className="text-xs font-mono font-bold text-navy-700 bg-navy-100 px-2 py-0.5 rounded">
                            Class {cls}
                          </span>
                        </div>

                        {/* Visual Range Indicator */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500">
                            <span className="text-emerald-700">±0.5 e Zone</span>
                            <span className="text-amber-700">±1.0 e Zone</span>
                            <span className="text-rose-700">±1.5 e Zone</span>
                          </div>
                          <div className="h-2 w-full flex rounded-full overflow-hidden bg-gray-200">
                            <div className="bg-emerald-500 w-1/3" title="0 to t1" />
                            <div className="bg-amber-500 w-1/3" title="t1 to t2" />
                            <div className="bg-rose-500 w-1/3" title="> t2" />
                          </div>
                        </div>

                        {/* Step inputs */}
                        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                          <div>
                            <label className="block text-gray-600 font-medium mb-1">
                              Step 1 Limit (<i>t</i>₁):
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                className="form-input text-xs w-full pr-7 font-mono font-bold text-emerald-800"
                                value={entry.t1 ?? ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0
                                  updateRuleset((prev) => ({
                                    ...prev,
                                    table6: {
                                      ...prev.table6,
                                      [cls]: { ...prev.table6[cls], t1: val },
                                    },
                                  }))
                                }}
                              />
                              <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-mono">e</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              0 ≤ <i>m</i> ≤ {entry.t1?.toLocaleString()} <i>e</i>: <b>±0.5 <i>e</i></b>
                            </span>
                          </div>

                          <div>
                            <label className="block text-gray-600 font-medium mb-1">
                              Step 2 Limit (<i>t</i>₂):
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                className="form-input text-xs w-full pr-7 font-mono font-bold text-amber-800"
                                value={entry.t2 ?? ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0
                                  updateRuleset((prev) => ({
                                    ...prev,
                                    table6: {
                                      ...prev.table6,
                                      [cls]: { ...prev.table6[cls], t2: val },
                                    },
                                  }))
                                }}
                              />
                              <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-mono">e</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              {entry.t1?.toLocaleString()} &lt; <i>m</i> ≤ {entry.t2?.toLocaleString()} <i>e</i>: <b>±1.0 <i>e</i></b>
                            </span>
                          </div>

                          <div className="col-span-2">
                            <label className="block text-gray-600 font-medium mb-1">
                              Step 3 Upper Cap (<i>t</i>₃, optional):
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                placeholder="None / Max capacity"
                                className="form-input text-xs w-full pr-7 font-mono"
                                value={entry.t3 ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value ? parseFloat(e.target.value) : undefined
                                  updateRuleset((prev) => {
                                    const nextCls = { ...prev.table6[cls] }
                                    if (val === undefined) {
                                      delete nextCls.t3
                                    } else {
                                      nextCls.t3 = val
                                    }
                                    return {
                                      ...prev,
                                      table6: {
                                        ...prev.table6,
                                        [cls]: nextCls,
                                      },
                                    }
                                  })
                                }}
                              />
                              <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-mono">e</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              Above {entry.t2?.toLocaleString()} <i>e</i>
                              {entry.t3 ? ` up to ${entry.t3.toLocaleString()} e` : ''}: <b>±1.5 <i>e</i></b>
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SECTION 3: TEMPERATURE LIMITS */}
            {visualSection === 'temperature' && (
              <div className="card space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-navy-700" />
                    Operating Temperature Range Defaults (Clause 3.9.2.1)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Standard temperatures for pattern evaluation when no special operating range is declared on the instrument's nameplate.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 border border-gray-200 rounded-lg bg-blue-50/30 space-y-2">
                    <label className="block font-semibold text-navy-900">
                      Standard Minimum Temperature (°C)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="form-input text-xs w-28 font-mono font-bold"
                        value={rulesetData.temperatureDefaults?.min_C ?? -10}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          updateRuleset((prev) => ({
                            ...prev,
                            temperatureDefaults: {
                              ...prev.temperatureDefaults,
                              min_C: val,
                            },
                          }))
                        }}
                      />
                      <span className="text-gray-500 font-medium">°C (Standard default: -10 °C)</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg bg-amber-50/30 space-y-2">
                    <label className="block font-semibold text-navy-900">
                      Standard Maximum Temperature (°C)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="form-input text-xs w-28 font-mono font-bold"
                        value={rulesetData.temperatureDefaults?.max_C ?? 40}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          updateRuleset((prev) => ({
                            ...prev,
                            temperatureDefaults: {
                              ...prev.temperatureDefaults,
                              max_C: val,
                            },
                          }))
                        }}
                      />
                      <span className="text-gray-500 font-medium">°C (Standard default: +40 °C)</span>
                    </div>
                  </div>
                </div>

                {/* Minimum range span per class */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-semibold text-xs text-navy-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                    Minimum Temperature Range Span per Class (Clause 3.9.2.2)
                  </h4>
                  <p className="text-xs text-gray-500">
                    If an instrument specifies special temperature limits (e.g. on its descriptive plate), the span (Max °C - Min °C) cannot be narrower than these statutory values:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {(['I', 'II', 'III', 'IIII'] as AccuracyClass[]).map((cls) => {
                      const currentVal =
                        rulesetData.temperatureDefaults?.minRangeByClass?.[cls] ??
                        (cls === 'I' ? 5 : cls === 'II' ? 15 : 30)

                      return (
                        <div key={cls} className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                          <span className="font-bold text-navy-800 block mb-1">Class {cls}</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="form-input text-xs w-20 font-mono"
                              value={currentVal}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0
                                updateRuleset((prev) => ({
                                  ...prev,
                                  temperatureDefaults: {
                                    ...prev.temperatureDefaults,
                                    minRangeByClass: {
                                      ...prev.temperatureDefaults?.minRangeByClass,
                                      [cls]: val,
                                    },
                                  },
                                }))
                              }}
                            />
                            <span className="text-gray-500">°C span</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: TABLE 3 (ACCURACY CLASSES & INTERVALS) */}
            {visualSection === 'table3' && (
              <div className="card space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-navy-700" />
                    Verification Scale Interval &amp; Number of Divisions (Table 3)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Statutory limits on minimum/maximum verification scale intervals <i>e</i> and total number of scale intervals <i>n</i> per class.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-navy-900 text-white">
                        <th className="p-2.5 rounded-tl">Accuracy Class</th>
                        <th className="p-2.5">Min e (g)</th>
                        <th className="p-2.5">Max e (g)</th>
                        <th className="p-2.5">Min n (Divisions)</th>
                        <th className="p-2.5">Max n (Divisions)</th>
                        <th className="p-2.5 rounded-tr">Min Divisions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(['I', 'II', 'III', 'IIII'] as AccuracyClass[]).map((cls) => {
                        const rows = rulesetData.table3?.[cls] || []
                        return rows.map((row: any, rIdx: number) => (
                          <tr key={`${cls}-${rIdx}`} className="hover:bg-gray-50">
                            <td className="p-2.5 font-bold text-navy-900">
                              Class {cls} {rows.length > 1 ? `(Range ${rIdx + 1})` : ''}
                            </td>
                            <td className="p-2.5 font-mono">
                              <input
                                type="number"
                                step="0.001"
                                className="form-input text-xs w-24"
                                value={row.eMin_g ?? ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0
                                  updateRuleset((prev) => {
                                    const nextTable = { ...prev.table3 }
                                    nextTable[cls][rIdx].eMin_g = val
                                    return { ...prev, table3: nextTable }
                                  })
                                }}
                              />
                            </td>
                            <td className="p-2.5 font-mono">
                              <input
                                type="number"
                                step="0.001"
                                placeholder="No max"
                                className="form-input text-xs w-24"
                                value={row.eMax_g ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value ? parseFloat(e.target.value) : null
                                  updateRuleset((prev) => {
                                    const nextTable = { ...prev.table3 }
                                    nextTable[cls][rIdx].eMax_g = val
                                    return { ...prev, table3: nextTable }
                                  })
                                }}
                              />
                            </td>
                            <td className="p-2.5 font-mono">
                              <input
                                type="number"
                                className="form-input text-xs w-28"
                                value={row.nMin ?? ''}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0
                                  updateRuleset((prev) => {
                                    const nextTable = { ...prev.table3 }
                                    nextTable[cls][rIdx].nMin = val
                                    return { ...prev, table3: nextTable }
                                  })
                                }}
                              />
                            </td>
                            <td className="p-2.5 font-mono">
                              <input
                                type="number"
                                placeholder="No max"
                                className="form-input text-xs w-28"
                                value={row.nMax ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value ? parseInt(e.target.value) : null
                                  updateRuleset((prev) => {
                                    const nextTable = { ...prev.table3 }
                                    nextTable[cls][rIdx].nMax = val
                                    return { ...prev, table3: nextTable }
                                  })
                                }}
                              />
                            </td>
                            <td className="p-2.5 font-mono">
                              <input
                                type="number"
                                className="form-input text-xs w-20"
                                value={row.minDivisions ?? 100}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0
                                  updateRuleset((prev) => {
                                    const nextTable = { ...prev.table3 }
                                    nextTable[cls][rIdx].minDivisions = val
                                    return { ...prev, table3: nextTable }
                                  })
                                }}
                              />
                            </td>
                          </tr>
                        ))
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 5: TOLERANCES & SPAN STABILITY */}
            {visualSection === 'tolerances' && (
              <div className="card space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-navy-700" />
                    Inspection Multipliers, Zero Setting &amp; Span Stability
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Statutory multipliers for subsequent in-service verification and specialized test tolerances.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
                    <label className="block font-semibold text-navy-900">
                      In-Service MPE Multiplier (Clause 3.6.2)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      In-service verification maximum permissible error is twice the initial verification MPE (standard multiplier: 2×).
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="form-input text-xs w-24 font-mono font-bold"
                        value={rulesetData.inServiceMpeMultiplier ?? 2}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 2
                          updateRuleset((prev) => ({
                            ...prev,
                            inServiceMpeMultiplier: val,
                          }))
                        }}
                      />
                      <span className="text-gray-600 font-semibold">× initial verification MPE</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
                    <label className="block font-semibold text-navy-900">
                      Zero Return Limit (Clause A.4.11.1)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Residual indication at zero after unloading the test load (default: 0.5 <i>e</i>).
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.05"
                        className="form-input text-xs w-24 font-mono font-bold"
                        value={rulesetData.zeroReturnLimit_e ?? 0.5}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0.5
                          updateRuleset((prev) => ({
                            ...prev,
                            zeroReturnLimit_e: val,
                          }))
                        }}
                      />
                      <span className="text-gray-600 font-semibold">e</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
                    <label className="block font-semibold text-navy-900">
                      Tare &amp; Zero Setting Accuracy Limit
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Permissible rounding error during automatic/semi-automatic zero-setting (standard: 0.25 <i>e</i>).
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.05"
                        className="form-input text-xs w-24 font-mono font-bold"
                        value={rulesetData.zeroSetting?.accuracy_limit_e ?? 0.25}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0.25
                          updateRuleset((prev) => ({
                            ...prev,
                            zeroSetting: { accuracy_limit_e: val },
                            tare: { accuracy_limit_e: val },
                          }))
                        }}
                      />
                      <span className="text-gray-600 font-semibold">e</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
                    <label className="block font-semibold text-navy-900">
                      Span Stability Test Drift Limit (Clause B.4)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Maximum variation between the initial span measurement and any subsequent measurement over 28 days.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.05"
                        className="form-input text-xs w-24 font-mono font-bold"
                        value={rulesetData.spanStability?.passLimit_e ?? 0.5}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0.5
                          updateRuleset((prev) => ({
                            ...prev,
                            spanStability: {
                              ...prev.spanStability,
                              passLimit_e: val,
                            },
                          }))
                        }}
                      />
                      <span className="text-gray-600 font-semibold">e</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* RAW JSON CODE EDITOR MODE                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'json' && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-navy-700" />
                Raw Rule Set JSON Definition
              </h3>
              <span className="text-xs text-gray-400">Schema: OIML R 76-1:2006 RulesetSchema</span>
            </div>

            <p className="text-xs text-gray-500">
              Technical mode: Edit or paste raw JSON. Any updates made here will automatically synchronize with the Visual Form Editor.
            </p>

            <textarea
              rows={16}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="form-input font-mono text-xs bg-gray-900 text-green-400 p-4 rounded-lg focus:ring-navy-600 w-full"
            />
          </div>
        )}

        {/* Action Buttons & Feedback */}
        <div className="card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleValidate}
                className="btn btn-outline flex items-center gap-2 text-xs"
              >
                <ShieldCheck className="w-4 h-4" /> Check &amp; Validate Ruleset
              </button>
              <button
                type="button"
                onClick={handleActivate}
                className="btn btn-saffron flex items-center gap-2 text-xs font-semibold shadow-xs"
              >
                <UploadCloud className="w-4 h-4" /> Save &amp; Activate Ruleset
              </button>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-navy-600 hover:underline"
            >
              Reset to OIML R 76-1:2006 Standard Default
            </button>
          </div>

          {/* Validation Feedback */}
          {validationResult && (
            <div
              className={`p-4 rounded-lg text-xs space-y-2 ${
                validationResult.success
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {validationResult.success ? (
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  {validationResult.message}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    Validation Check Failed:
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 font-mono">
                    {validationResult.errors?.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
