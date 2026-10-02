/**
 * NewEvaluationPage.tsx
 * Multi-step wizard for creating a new NAWI Type Evaluation Report.
 * Steps: Instrument → General Info → Test Equipment → Environment →
 *        Test Applicability → Test Modules → Review & Submit
 */
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import {
  CheckCircle,
  XCircle,
  Circle,
  ChevronRight,
  ChevronLeft,
  Save,
  AlertTriangle,
  Info,
  FlaskConical,
  Thermometer,
  ClipboardList,
  Scale,
  BookOpen,
  Star,
  Send,
  ArrowLeft,
  Home,
} from 'lucide-react'
import mockDb from '@/data/mockDb'
import { getAllTestApplicabilities } from '@/engine/applicability'
import { validateInstrumentParams } from '@/engine/tableValidation'
import type { Instrument, Report, AuditLogEntry, TestModuleResult, ReferenceStandard } from '@/types'
import type { InstrumentParams } from '@/engine/types'
import { useAuth } from '@/contexts/AuthContext'

// ── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Instrument', icon: Scale },
  { label: 'General Info', icon: BookOpen },
  { label: 'Test Equipment', icon: FlaskConical },
  { label: 'Environment', icon: Thermometer },
  { label: 'Applicability', icon: ClipboardList },
  { label: 'Test Modules', icon: Star },
  { label: 'Review & Submit', icon: Send },
]

const TEST_LABELS: Record<string, string> = {
  'test-1-weighing': '1. Weighing Performance',
  'test-2-temp-effect': '2. Effect of Temperature',
  'test-3-1-eccentricity-weight': '3.1 Eccentricity (Weights)',
  'test-3-2-eccentricity-rolling': '3.2 Eccentricity (Rolling Load)',
  'test-4-1-discrimination': '4.1 Discrimination',
  'test-4-2-sensitivity': '4.2 Sensitivity',
  'test-5-repeatability': '5. Repeatability',
  'test-6-1-zero-return': '6.1 Zero Return',
  'test-6-2-creep': '6.2 Creep',
  'test-7-stability': '7. Stability of Equilibrium',
  'test-8-tilting': '8. Tilting',
  'test-9-tare': '9. Tare Weighing',
  'test-10-warmup': '10. Warm-up Time',
  'test-11-voltage': '11. Voltage Variation',
  'test-12-1-power-reduction': '12.1 Power Reduction',
  'test-12-2-bursts': '12.2 Electrical Fast Transients/Bursts',
  'test-12-3-esd': '12.3 Electrostatic Discharge',
  'test-12-4-radiated-emf': '12.4 Radiated EMF',
  'test-12-5-surge': '12.5 Surge',
  'test-12-6-conducted-rf': '12.6 Conducted RF',
  'test-13-damp-heat': '13. Damp Heat',
  'test-14-span-stability': '14. Span Stability',
  'test-15-endurance': '15. Endurance',
  'test-16-construction': '16. Construction Examination',
  'test-17-checklist': '17. Checklist Verification',
}

const CLASS_COLORS: Record<string, string> = {
  I: 'bg-purple-100 text-purple-800 border-purple-300',
  II: 'bg-blue-100 text-blue-800 border-blue-300',
  III: 'bg-green-100 text-green-800 border-green-300',
  IIII: 'bg-orange-100 text-orange-800 border-orange-300',
}

// ── Form types ───────────────────────────────────────────────────────────────

interface EquipmentRow {
  weightClass: string
  certNo: string
  calibrationDate: string
  dueDate: string
}

interface WizardForm {
  instrumentId: string
  // General info
  applicationNo: string
  patternDesignation: string
  manufacturer: string
  applicant: string
  instrumentCategory: string
  // Test equipment
  equipment: EquipmentRow[]
  // Environment
  tempStart: string
  tempMax: string
  tempEnd: string
  humidityStart: string
  humidityMax: string
  humidityEnd: string
  timeStart: string
  timeEnd: string
  barometricPressure: string
  // Test applicability overrides (optional -> include/exclude)
  testOverrides: Record<string, boolean>
  // Remarks
  remarks: string
}

// ── Draft helpers ─────────────────────────────────────────────────────────────

function saveDraft(id: string, data: Partial<WizardForm>, step: number) {
  try {
    localStorage.setItem(`nawi_draft_${id}`, JSON.stringify({ ...data, __step: step, __ts: Date.now() }))
  } catch {
    // ignore quota errors
  }
}

function loadDraft(id: string): (Partial<WizardForm> & { __step?: number }) | null {
  try {
    const raw = localStorage.getItem(`nawi_draft_${id}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── Toast helper ─────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0d2137] text-white px-4 py-3 rounded-lg shadow-xl animate-pulse">
      <Save size={16} className="text-[#FF9933]" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

// ── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full flex items-center mb-8 select-none">
      {STEPS.map((s, i) => {
        const Icon = s.icon
        const isComplete = i < step
        const isCurrent = i === step
        return (
          <React.Fragment key={s.label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isComplete
                    ? 'bg-[#FF9933] border-[#FF9933] text-white'
                    : isCurrent
                    ? 'bg-[#0d2137] border-[#0d2137] text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isComplete ? <CheckCircle size={18} /> : <Icon size={16} />}
              </div>
              <span
                className={`mt-1 text-[10px] font-semibold uppercase tracking-wide hidden sm:block ${
                  isCurrent ? 'text-[#0d2137]' : isComplete ? 'text-[#FF9933]' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 transition-colors duration-300 ${
                  i < step ? 'bg-[#FF9933]' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Step components ───────────────────────────────────────────────────────────

function Step1SelectInstrument({
  instruments,
  selectedId,
  onSelect,
}: {
  instruments: Instrument[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-[#0d2137] mb-4">Select Instrument Under Test</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {instruments.map((inst) => (
          <button
            key={inst.id}
            type="button"
            onClick={() => onSelect(inst.id)}
            className={`text-left border-2 rounded-xl p-4 transition-all hover:shadow-md ${
              selectedId === inst.id
                ? 'border-[#FF9933] bg-orange-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-[#0d2137]'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-bold text-[#0d2137] text-sm leading-tight">{inst.model}</div>
              <span
                className={`ml-2 shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border ${
                  CLASS_COLORS[inst.accuracy_class] ?? 'bg-gray-100 text-gray-700'
                }`}
              >
                Class {inst.accuracy_class}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-1">{inst.manufacturer}</p>
            <p className="text-xs text-gray-400">{inst.type_designation}</p>
            <p className="text-xs text-gray-400 mt-1">
              Max: {inst.max_capacity.toLocaleString()} g · e: {inst.e} g
            </p>
            {selectedId === inst.id && (
              <div className="mt-2 flex items-center gap-1 text-[#FF9933] text-xs font-semibold">
                <CheckCircle size={13} /> Selected
              </div>
            )}
          </button>
        ))}
      </div>
      {instruments.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Scale size={40} className="mx-auto mb-2 opacity-40" />
          <p>No instruments found in the database.</p>
        </div>
      )}
    </div>
  )
}

function Step2GeneralInfo({
  instrument,
  register,
  errors,
}: {
  instrument: Instrument | undefined
  register: ReturnType<typeof useForm<WizardForm>>['register']
  errors: ReturnType<typeof useForm<WizardForm>>['formState']['errors']
}) {
  if (!instrument) {
    return (
      <div className="flex items-center gap-2 text-amber-600 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle size={18} />
        <span>Please go back and select an instrument first.</span>
      </div>
    )
  }

  const n = instrument.e > 0 ? Math.round(instrument.max_capacity / instrument.e) : 0

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0d2137] mb-4">General Information</h2>

      {/* Accuracy class badge */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-[#0d2137]/5 rounded-xl border border-[#0d2137]/10">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-4 shrink-0 ${
            CLASS_COLORS[instrument.accuracy_class] ?? 'bg-gray-100 border-gray-300'
          }`}
        >
          {instrument.accuracy_class}
        </div>
        <div>
          <div className="text-sm font-semibold text-[#0d2137]">OIML Accuracy Class {instrument.accuracy_class}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Max: {instrument.max_capacity.toLocaleString()} g &nbsp;|&nbsp; Min:{' '}
            {instrument.min_capacity.toLocaleString()} g &nbsp;|&nbsp; e: {instrument.e} g &nbsp;|&nbsp; d:{' '}
            {instrument.d} g &nbsp;|&nbsp; n: {n.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Application No. *</label>
          <input
            {...register('applicationNo', { required: 'Required' })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            placeholder="e.g. NLML/TE/2026/001"
          />
          {errors.applicationNo && (
            <p className="text-red-500 text-xs mt-1">{errors.applicationNo.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Pattern Designation *</label>
          <input
            {...register('patternDesignation', { required: 'Required' })}
            defaultValue={instrument.type_designation}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
          />
          {errors.patternDesignation && (
            <p className="text-red-500 text-xs mt-1">{errors.patternDesignation.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Manufacturer *</label>
          <input
            {...register('manufacturer', { required: 'Required' })}
            defaultValue={instrument.manufacturer}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
          />
          {errors.manufacturer && (
            <p className="text-red-500 text-xs mt-1">{errors.manufacturer.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Applicant *</label>
          <input
            {...register('applicant', { required: 'Required' })}
            defaultValue={instrument.applicant}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
          />
          {errors.applicant && (
            <p className="text-red-500 text-xs mt-1">{errors.applicant.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Instrument Category</label>
          <input
            {...register('instrumentCategory')}
            defaultValue={instrument.instrument_type}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            placeholder="e.g. Platform Scale, Lab Balance, Weighbridge"
          />
        </div>
      </div>

      {/* Auto-computed params box */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Info size={14} className="text-blue-600" />
          <span className="text-xs font-semibold text-blue-700">Auto-computed Parameters (R 76-1 Table 3)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Max', value: `${instrument.max_capacity.toLocaleString()} g` },
            { label: 'Min', value: `${instrument.min_capacity.toLocaleString()} g` },
            { label: 'e (Verification)', value: `${instrument.e} g` },
            { label: 'd (Scale division)', value: `${instrument.d} g` },
            { label: 'n = Max/e', value: n.toLocaleString() },
            { label: 'Class', value: `Class ${instrument.accuracy_class}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg p-2 border border-blue-100">
              <div className="text-[10px] text-blue-500 font-semibold uppercase">{label}</div>
              <div className="text-sm font-bold text-[#0d2137] mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step3TestEquipment({
  fields,
  append,
  remove,
  control,
}: {
  fields: any[]
  append: (val: any) => void
  remove: (index: number) => void
  control: any
}) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0d2137]">Test Equipment Register</h2>
        <button
          type="button"
          onClick={() =>
            append({
              weightClass: 'E2',
              certNo: '',
              calibrationDate: '',
              dueDate: '',
            } as EquipmentRow)
          }
          className="bg-[#FF9933] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-orange-500 transition-colors"
        >
          + Add Equipment
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#0d2137] text-white text-xs uppercase">
              <th className="px-3 py-2 text-left rounded-tl-lg">Weight Class</th>
              <th className="px-3 py-2 text-left">Cert. No.</th>
              <th className="px-3 py-2 text-left">Calibration Date</th>
              <th className="px-3 py-2 text-left">Due Date</th>
              <th className="px-3 py-2 text-left rounded-tr-lg">Status</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, i) => (
              <Controller
                key={field.id}
                control={control}
                name={`equipment.${i}` as const}
                render={({ field: f }) => {
                  const row = f.value as EquipmentRow
                  const isExpired = row.dueDate && row.dueDate < today
                  return (
                    <tr className={`border-b ${isExpired ? 'bg-red-50' : 'bg-white'} hover:bg-gray-50`}>
                      <td className="px-3 py-2">
                        <select
                          value={row.weightClass}
                          onChange={(e) => f.onChange({ ...row, weightClass: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#FF9933]"
                        >
                          {['E1', 'E2', 'F1', 'F2', 'M1', 'M2', 'M3'].map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={row.certNo}
                          onChange={(e) => f.onChange({ ...row, certNo: e.target.value })}
                          placeholder="NABL/..."
                          className="border border-gray-300 rounded px-2 py-1 text-xs w-32 focus:ring-1 focus:ring-[#FF9933]"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={row.calibrationDate}
                          onChange={(e) => f.onChange({ ...row, calibrationDate: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#FF9933]"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={row.dueDate}
                          onChange={(e) => f.onChange({ ...row, dueDate: e.target.value })}
                          className={`border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#FF9933] ${
                            isExpired ? 'border-red-400' : 'border-gray-300'
                          }`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        {isExpired ? (
                          <span className="flex items-center gap-1 text-red-600 text-xs font-semibold">
                            <AlertTriangle size={12} /> Expired
                          </span>
                        ) : row.dueDate ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                            <CheckCircle size={12} /> Valid
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <XCircle size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                }}
              />
            ))}
            {fields.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                  No equipment added yet. Click "+ Add Equipment" to add reference weights.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Step4Environment({
  register,
  accuracyClass,
}: {
  register: ReturnType<typeof useForm<WizardForm>>['register']
  accuracyClass: string
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-[#0d2137] mb-4">Environmental Conditions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Temperature */}
        <div className="sm:col-span-3">
          <h3 className="text-sm font-semibold text-[#0d2137] mb-3 flex items-center gap-2">
            <Thermometer size={16} className="text-[#FF9933]" />
            Temperature (°C)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {(
              [
                { id: 'tempStart', label: 'At Start' },
                { id: 'tempMax', label: 'Maximum' },
                { id: 'tempEnd', label: 'At End' },
              ] as { id: keyof WizardForm; label: string }[]
            ).map(({ id, label }) => (
              <div key={id}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <input
                  {...register(id)}
                  type="number"
                  step="0.1"
                  placeholder="°C"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Humidity */}
        <div className="sm:col-span-3">
          <h3 className="text-sm font-semibold text-[#0d2137] mb-3 flex items-center gap-2">
            <span className="text-[#FF9933] font-bold">%</span>
            Relative Humidity (%)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {(
              [
                { id: 'humidityStart', label: 'At Start' },
                { id: 'humidityMax', label: 'Maximum' },
                { id: 'humidityEnd', label: 'At End' },
              ] as { id: keyof WizardForm; label: string }[]
            ).map(({ id, label }) => (
              <div key={id}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <input
                  {...register(id)}
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="%"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="sm:col-span-2">
          <h3 className="text-sm font-semibold text-[#0d2137] mb-3">Test Time</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time</label>
              <input
                {...register('timeStart')}
                type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">End Time</label>
              <input
                {...register('timeEnd')}
                type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              />
            </div>
          </div>
        </div>

        {/* Barometric pressure — Class I only */}
        {accuracyClass === 'I' && (
          <div>
            <h3 className="text-sm font-semibold text-[#0d2137] mb-3">
              Barometric Pressure{' '}
              <span className="text-xs text-purple-600 font-normal">(Class I required)</span>
            </h3>
            <input
              {...register('barometricPressure')}
              type="number"
              step="0.1"
              placeholder="hPa"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function Step5Applicability({
  instrument,
  overrides,
  onChange,
}: {
  instrument: Instrument | undefined
  overrides: Record<string, boolean>
  onChange: (id: string, val: boolean) => void
}) {
  if (!instrument) return null

  const params: InstrumentParams = {
    accuracyClass: instrument.accuracy_class as 'I' | 'II' | 'III' | 'IIII',
    max_g: instrument.max_capacity,
    min_g: instrument.min_capacity,
    e_g: instrument.e,
    d_g: instrument.d,
    isMultiInterval: false,
    maxAdditiveTare_g: instrument.tare_capacity ?? 0,
    indicationType: 'self',
    powerSupplyType:
      (instrument.power_supply as InstrumentParams['powerSupplyType']) ?? 'mains',
    isRetail: instrument.instrument_type === 'retail',
    hasTare: (instrument.tare_capacity ?? 0) > 0,
    hasZeroTracking: false,
    tempRangeMin_C: instrument.temperature_range_min,
    tempRangeMax_C: instrument.temperature_range_max,
    initialZeroRange_pct: 4,
  }

  const results = getAllTestApplicabilities(params)

  const mandatory = results.filter((r) => r.applicability === 'mandatory')
  const optional = results.filter((r) => r.applicability === 'optional')
  const notApplicable = results.filter((r) => r.applicability === 'not_applicable')

  const ApplicabilityBadge = ({ status }: { status: string }) => {
    if (status === 'mandatory')
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
          Mandatory
        </span>
      )
    if (status === 'optional')
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
          Optional
        </span>
      )
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
        N/A
      </span>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0d2137] mb-1">Test Applicability</h2>
      <p className="text-xs text-gray-500 mb-4">
        Based on instrument parameters. Optional tests can be included or excluded.
      </p>

      <div className="space-y-2">
        {[...mandatory, ...optional, ...notApplicable].map((r) => {
          const isOptional = r.applicability === 'optional'
          const isNA = r.applicability === 'not_applicable'
          const included = isNA ? false : overrides[r.testId] !== false
          return (
            <div
              key={r.testId}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                isNA
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : included
                  ? 'bg-white border-gray-200 hover:border-[#0d2137]/30'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={!isNA && included}
                disabled={!isOptional || isNA}
                onChange={(e) => isOptional && onChange(r.testId, e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#FF9933]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#0d2137]">
                    {TEST_LABELS[r.testId] ?? r.testId}
                  </span>
                  <ApplicabilityBadge status={r.applicability} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{r.reason}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step6TestModules({
  applicabilities,
  testResults,
}: {
  applicabilities: ReturnType<typeof getAllTestApplicabilities>
  testResults: TestModuleResult[]
}) {
  const [open, setOpen] = useState<string | null>(null)
  const applicable = applicabilities.filter((a) => a.applicability !== 'not_applicable')

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0d2137] mb-1">Test Modules</h2>
      <p className="text-xs text-gray-500 mb-4">
        Expand each test to view or enter results. Results are saved with the report.
      </p>
      <div className="space-y-2">
        {applicable.map((a) => {
          const result = testResults.find((r) => r.moduleId === a.testId)
          const status = result?.status ?? 'not_started'
          const pass = result?.pass

          const statusIcon =
            status === 'completed' && pass === true ? (
              <CheckCircle size={18} className="text-green-500" />
            ) : status === 'completed' && pass === false ? (
              <XCircle size={18} className="text-red-500" />
            ) : (
              <Circle size={18} className="text-gray-300" />
            )

          const isOpen = open === a.testId

          return (
            <div key={a.testId} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : a.testId)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
              >
                {statusIcon}
                <span className="flex-1 font-semibold text-sm text-[#0d2137]">
                  {TEST_LABELS[a.testId] ?? a.testId}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    a.applicability === 'mandatory'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {a.applicability}
                </span>
                <ChevronRight
                  size={16}
                  className={`text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  {result && result.rows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#0d2137] text-white">
                            <th className="px-2 py-1.5 text-left">Load (g)</th>
                            <th className="px-2 py-1.5 text-left">Indication (g)</th>
                            <th className="px-2 py-1.5 text-left">Error (g)</th>
                            <th className="px-2 py-1.5 text-left">MPE (g)</th>
                            <th className="px-2 py-1.5 text-left">Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row, i) => (
                            <tr key={i} className={`border-b ${row.pass ? 'bg-green-50' : 'bg-red-50'}`}>
                              <td className="px-2 py-1.5">{row.load}</td>
                              <td className="px-2 py-1.5">{row.indication}</td>
                              <td className="px-2 py-1.5">{row.error}</td>
                              <td className="px-2 py-1.5">±{row.mpe}</td>
                              <td className="px-2 py-1.5">
                                {row.pass ? (
                                  <span className="text-green-600 font-bold">PASS</span>
                                ) : (
                                  <span className="text-red-600 font-bold">FAIL</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      No results recorded yet. Results will be entered during the physical test.
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step7Review({
  formData,
  instrument,
  applicabilities,
}: {
  formData: WizardForm
  instrument: Instrument | undefined
  applicabilities: ReturnType<typeof getAllTestApplicabilities>
}) {
  const applicable = applicabilities.filter((a) => a.applicability !== 'not_applicable')
  const excluded = Object.entries(formData.testOverrides ?? {})
    .filter(([, v]) => !v)
    .map(([k]) => k)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-[#0d2137]">Review & Submit</h2>

      {/* Instrument summary */}
      <div className="p-4 border border-gray-200 rounded-xl bg-white">
        <h3 className="text-sm font-bold text-[#0d2137] mb-3">Instrument</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {instrument && (
            <>
              <div>
                <dt className="text-gray-500">Model</dt>
                <dd className="font-semibold text-[#0d2137]">{instrument.model}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Manufacturer</dt>
                <dd className="font-semibold text-[#0d2137]">{formData.manufacturer}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Class</dt>
                <dd className="font-semibold text-[#0d2137]">Class {instrument.accuracy_class}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Application No.</dt>
                <dd className="font-semibold text-[#0d2137]">{formData.applicationNo || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Pattern</dt>
                <dd className="font-semibold text-[#0d2137]">{formData.patternDesignation || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Applicant</dt>
                <dd className="font-semibold text-[#0d2137]">{formData.applicant || '—'}</dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {/* Environment */}
      <div className="p-4 border border-gray-200 rounded-xl bg-white">
        <h3 className="text-sm font-bold text-[#0d2137] mb-3">Environmental Conditions</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {[
            { label: 'Temp Start', value: formData.tempStart ? `${formData.tempStart} °C` : '—' },
            { label: 'Temp Max', value: formData.tempMax ? `${formData.tempMax} °C` : '—' },
            { label: 'Temp End', value: formData.tempEnd ? `${formData.tempEnd} °C` : '—' },
            { label: 'Humidity Start', value: formData.humidityStart ? `${formData.humidityStart} %` : '—' },
            { label: 'Humidity Max', value: formData.humidityMax ? `${formData.humidityMax} %` : '—' },
            { label: 'Humidity End', value: formData.humidityEnd ? `${formData.humidityEnd} %` : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-gray-500">{label}</dt>
              <dd className="font-semibold text-[#0d2137]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Test scope */}
      <div className="p-4 border border-gray-200 rounded-xl bg-white">
        <h3 className="text-sm font-bold text-[#0d2137] mb-2">Test Scope</h3>
        <p className="text-xs text-gray-500 mb-2">
          {applicable.length} applicable tests ·{' '}
          {excluded.length > 0 ? `${excluded.length} optional tests excluded` : 'All optional tests included'}
        </p>
        <div className="flex flex-wrap gap-1">
          {applicable.map((a) => (
            <span
              key={a.testId}
              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                excluded.includes(a.testId)
                  ? 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}
            >
              {TEST_LABELS[a.testId]?.split('.')[0] ?? a.testId}
            </span>
          ))}
        </div>
      </div>

      {/* Equipment */}
      {formData.equipment?.length > 0 && (
        <div className="p-4 border border-gray-200 rounded-xl bg-white">
          <h3 className="text-sm font-bold text-[#0d2137] mb-2">Reference Equipment</h3>
          <div className="flex flex-wrap gap-2">
            {formData.equipment.map((eq, i) => (
              <div key={i} className="text-xs bg-gray-100 rounded-lg px-2 py-1">
                <span className="font-bold">{eq.weightClass}</span> — {eq.certNo || 'No cert'} · Due:{' '}
                {eq.dueDate || '—'}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-800">
          <p className="font-bold mb-1">Before submitting:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Ensure all reference equipment calibration certificates are current.</li>
            <li>Verify environmental conditions are within the instrument's rated range.</li>
            <li>Report will be saved as <strong>Draft</strong> and can be edited before submission for review.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function NewEvaluationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [draftId] = useState(() => uuidv4())
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const instruments = mockDb.getInstruments()

  const form = useForm<WizardForm>({
    defaultValues: {
      instrumentId: '',
      applicationNo: '',
      patternDesignation: '',
      manufacturer: '',
      applicant: '',
      instrumentCategory: '',
      equipment: [],
      tempStart: '',
      tempMax: '',
      tempEnd: '',
      humidityStart: '',
      humidityMax: '',
      humidityEnd: '',
      timeStart: '',
      timeEnd: '',
      barometricPressure: '',
      testOverrides: {},
      remarks: '',
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'equipment' })

  const watchedValues = form.watch()
  const selectedInstrument = instruments.find((i) => i.id === watchedValues.instrumentId)

  // Autosave on form change
  useEffect(() => {
    const sub = form.watch((data) => {
      saveDraft(draftId, data as Partial<WizardForm>, step)
    })
    return () => sub.unsubscribe()
  }, [form, draftId, step])

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft(draftId)
    if (draft) {
      const { __step, ...data } = draft
      Object.entries(data).forEach(([key, val]) => {
        form.setValue(key as keyof WizardForm, val as WizardForm[keyof WizardForm])
      })
      if (__step !== undefined) setStep(__step)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
  }

  const getApplicabilities = useCallback(() => {
    if (!selectedInstrument) return []
    const params: InstrumentParams = {
      accuracyClass: selectedInstrument.accuracy_class as 'I' | 'II' | 'III' | 'IIII',
      max_g: selectedInstrument.max_capacity,
      min_g: selectedInstrument.min_capacity,
      e_g: selectedInstrument.e,
      d_g: selectedInstrument.d,
      isMultiInterval: false,
      maxAdditiveTare_g: selectedInstrument.tare_capacity ?? 0,
      indicationType: 'self',
      powerSupplyType:
        (selectedInstrument.power_supply as InstrumentParams['powerSupplyType']) ?? 'mains',
      isRetail: selectedInstrument.instrument_type === 'retail',
      hasTare: (selectedInstrument.tare_capacity ?? 0) > 0,
      hasZeroTracking: false,
      tempRangeMin_C: selectedInstrument.temperature_range_min,
      tempRangeMax_C: selectedInstrument.temperature_range_max,
      initialZeroRange_pct: 4,
    }
    return getAllTestApplicabilities(params)
  }, [selectedInstrument])

  const validateStep = async (currentStep: number): Promise<boolean> => {
    if (currentStep === 0) {
      if (!watchedValues.instrumentId) {
        alert('Please select an instrument to continue.')
        return false
      }
    }
    if (currentStep === 1) {
      const result = await form.trigger(['applicationNo', 'patternDesignation', 'manufacturer', 'applicant'])
      if (!result) return false
    }
    return true
  }

  const handleNext = async () => {
    const valid = await validateStep(step)
    if (!valid) return
    saveDraft(draftId, watchedValues, step + 1)
    showToast('Draft saved')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const data = form.getValues()
      const instrument = selectedInstrument!
      const now = new Date().toISOString()
      const reportNo = `NAWI/TE/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`

      const applicabilities = getApplicabilities()
      const testResults: TestModuleResult[] = applicabilities
        .filter((a) => a.applicability !== 'not_applicable' && data.testOverrides[a.testId] !== false)
        .map((a) => ({
          moduleId: a.testId,
          moduleName: TEST_LABELS[a.testId] ?? a.testId,
          status: 'not_started' as const,
          pass: null,
          rows: [],
          computedValues: {},
          reasons: [a.reason],
        }))

      const referenceStandards: ReferenceStandard[] = (data.equipment ?? []).map((eq) => ({
        name: `Class ${eq.weightClass} Reference Weight`,
        certNo: eq.certNo,
        traceability: 'NPL/NABL',
        calibrationDate: eq.calibrationDate,
        dueDate: eq.dueDate,
        isExpired: eq.dueDate ? eq.dueDate < now.slice(0, 10) : false,
      }))

      const auditEntry: AuditLogEntry = {
        id: uuidv4(),
        reportId: draftId,
        userId: user?.id ?? 'unknown',
        userName: user?.name ?? 'Unknown',
        action: 'Report created as draft',
        toStatus: 'draft',
        createdAt: now,
      }

      const report: Report = {
        id: draftId,
        reportNo,
        instrumentId: instrument.id,
        instrument,
        labId: instrument.labId,
        createdBy: user?.id ?? 'unknown',
        createdByUser: user ?? undefined,
        status: 'draft',
        rulesetVersion: 'R76-1:2006',
        environment: [
          {
            temperature: parseFloat(data.tempStart) || 25,
            humidity: parseFloat(data.humidityStart) || 50,
            pressure: parseFloat(data.barometricPressure) || 1013.25,
            recordedAt: data.timeStart || now,
            location: instrument.labId,
          },
        ],
        referenceStandards,
        testResults,
        attachments: [],
        overallPass: null,
        verdictReasons: [],
        remarks: data.remarks,
        auditLog: [auditEntry],
        createdAt: now,
        updatedAt: now,
      }

      mockDb.saveReport(report)
      // Clear draft from localStorage
      localStorage.removeItem(`nawi_draft_${draftId}`)
      showToast('Report saved successfully!')
      setTimeout(() => navigate(`/reports/${draftId}`), 500)
    } finally {
      setSubmitting(false)
    }
  }

  const applicabilities = getApplicabilities()

  const handleTestOverrideChange = (testId: string, val: boolean) => {
    form.setValue('testOverrides', {
      ...(form.getValues('testOverrides') || {}),
      [testId]: val,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back and Home */}
      <header className="bg-[#0d2137] text-white px-6 py-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="p-1.5 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Back to Reports"
            >
              <ArrowLeft size={18} />
            </button>
            <Link
              to="/dashboard"
              className="p-1.5 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Dashboard Home"
            >
              <Home size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight">New Type Evaluation Report</h1>
              <p className="text-xs text-gray-300 mt-0.5">NAWI — OIML R 76-1:2006 / R 76-2:1993</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="text-xs text-gray-300 hover:text-white underline"
          >
            Cancel Evaluation
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <ProgressBar step={step} total={STEPS.length} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
          {step === 0 && (
            <Step1SelectInstrument
              instruments={instruments}
              selectedId={watchedValues.instrumentId}
              onSelect={(id) => form.setValue('instrumentId', id)}
            />
          )}
          {step === 1 && (
            <Step2GeneralInfo
              instrument={selectedInstrument}
              register={form.register}
              errors={form.formState.errors}
            />
          )}
          {step === 2 && (
            <Step3TestEquipment
              fields={fields}
              append={append}
              remove={remove}
              control={form.control}
            />
          )}
          {step === 3 && (
            <Step4Environment
              register={form.register}
              accuracyClass={selectedInstrument?.accuracy_class ?? ''}
            />
          )}
          {step === 4 && (
            <Step5Applicability
              instrument={selectedInstrument}
              overrides={watchedValues.testOverrides ?? {}}
              onChange={handleTestOverrideChange}
            />
          )}
          {step === 5 && (
            <Step6TestModules
              applicabilities={applicabilities}
              testResults={[]}
            />
          )}
          {step === 6 && (
            <Step7Review
              formData={watchedValues}
              instrument={selectedInstrument}
              applicabilities={applicabilities}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                saveDraft(draftId, watchedValues, step)
                showToast('Draft saved')
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0d2137] text-sm font-semibold text-[#0d2137] hover:bg-[#0d2137]/5 transition-colors"
            >
              <Save size={14} />
              Save Draft
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF9933] text-white text-sm font-bold hover:bg-orange-500 transition-colors shadow-sm"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0d2137] text-white text-sm font-bold hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-60"
              >
                <Send size={14} />
                {submitting ? 'Saving...' : 'Create Report'}
              </button>
            )}
          </div>
        </div>
      </main>

      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}
    </div>
  )
}
