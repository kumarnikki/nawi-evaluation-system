/**
 * RulesetManagerPage.tsx
 * Admin management for versioned OIML and national legal metrology rulesets.
 * Allows viewing active rules, testing JSON against Zod RulesetSchema, and hot-activating rule sets.
 */
import React, { useState } from 'react'
import {
  Settings,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCode,
  ShieldCheck,
  Info,
} from 'lucide-react'
import Layout from '@/components/layout/Layout'
import { RulesetSchema, type Ruleset } from '@/engine/types'
import defaultRuleset from '@/rulesets/oiml-r76-1-2006.json'

export default function RulesetManagerPage() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultRuleset, null, 2))
  const [validationResult, setValidationResult] = useState<{
    success: boolean
    message?: string
    errors?: string[]
  } | null>(null)
  const [activeRuleset, setActiveRuleset] = useState<any>(defaultRuleset)

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const validated = RulesetSchema.safeParse(parsed)
      if (validated.success) {
        setValidationResult({
          success: true,
          message: `Ruleset "${validated.data.name}" (${validated.data.id}) is valid and complies with RulesetSchema.`,
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
      const parsed = JSON.parse(jsonInput)
      const validated = RulesetSchema.safeParse(parsed)
      if (validated.success) {
        setActiveRuleset(validated.data)
        localStorage.setItem('nawi_active_ruleset', JSON.stringify(validated.data))
        setValidationResult({
          success: true,
          message: `Ruleset "${validated.data.name}" has been successfully activated as the system default.`,
        })
      }
    } catch (err: any) {
      setValidationResult({
        success: false,
        errors: [`Cannot activate invalid ruleset: ${err.message}`],
      })
    }
  }

  return (
    <Layout title="Rule Set Manager">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-navy-700" />
              Metrological Rule Set Manager
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Inspect, validate, and hot-swap versioned statutory OIML R 76 rulesets.
            </p>
          </div>
        </div>

        {/* Active Ruleset Card */}
        <div className="card space-y-4 border-l-4 border-l-saffron-500">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-saffron-600 bg-saffron-50 px-2 py-0.5 rounded">
                ACTIVE STATUTORY RULESET
              </span>
              <h2 className="text-xl font-bold text-navy-900 mt-1">{activeRuleset.name}</h2>
              <p className="text-xs text-gray-500">{activeRuleset.description}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">ID: {activeRuleset.id}</span>
              <span className="text-xs font-bold text-navy-800">Version {activeRuleset.version}</span>
            </div>
          </div>

          {/* Quick parameter summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-gray-50 p-2.5 rounded">
              <span className="text-gray-400 block">Class I mpe thresholds</span>
              <span className="font-semibold text-navy-900">
                0.5e (≤50k), 1.0e (≤200k), 1.5e
              </span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded">
              <span className="text-gray-400 block">Class III mpe thresholds</span>
              <span className="font-semibold text-navy-900">
                0.5e (≤500), 1.0e (≤2k), 1.5e (≤10k)
              </span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded">
              <span className="text-gray-400 block">Operating Temp Range</span>
              <span className="font-semibold text-navy-900">
                {activeRuleset.temperatureDefaults?.min_C}°C to {activeRuleset.temperatureDefaults?.max_C}°C
              </span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded">
              <span className="text-gray-400 block">In-Service Multiplier</span>
              <span className="font-semibold text-navy-900">
                {activeRuleset.inServiceMpeMultiplier}× Initial Verification
              </span>
            </div>
          </div>
        </div>

        {/* JSON Editor & Validator */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-navy-700" />
              Rule Set JSON Definition Editor
            </h3>
            <span className="text-xs text-gray-400">Schema: OIML R 76-1:2006 RulesetSchema</span>
          </div>

          <p className="text-xs text-gray-500">
            Edit or paste custom statutory parameters (e.g., national variations, future OIML R 76 editions).
            Validation ensures all numeric thresholds, Table 3 ranges, and Table 6 factors conform to schema.
          </p>

          <textarea
            rows={14}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="form-input font-mono text-xs bg-gray-900 text-green-400 p-4 rounded-lg focus:ring-navy-600"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleValidate}
                className="btn btn-outline flex items-center gap-2 text-xs"
              >
                <ShieldCheck className="w-4 h-4" /> Validate JSON Schema
              </button>
              <button
                type="button"
                onClick={handleActivate}
                className="btn btn-saffron flex items-center gap-2 text-xs"
              >
                <UploadCloud className="w-4 h-4" /> Validate &amp; Activate Ruleset
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setJsonInput(JSON.stringify(defaultRuleset, null, 2))
                setValidationResult(null)
              }}
              className="text-xs text-navy-600 hover:underline"
            >
              Reset to OIML R 76-1:2006 Default
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
                    Validation Failed:
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
