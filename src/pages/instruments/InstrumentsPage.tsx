/**
 * InstrumentsPage.tsx
 * List of all registered weighing instruments undergoing or eligible for type evaluation.
 */
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Scale, Search, History, Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import mockDb, { SEED_INSTRUMENTS, SEED_LABS } from '@/data/mockDb'
import type { AccuracyClass, InstrumentType } from '@/types'

export default function InstrumentsPage() {
  const [search, setSearch] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const instruments = mockDb.getInstruments()
  const labs = SEED_LABS

  const filtered = instruments.filter((inst) => {
    if (selectedClass !== 'all' && inst.accuracy_class !== selectedClass) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      inst.model.toLowerCase().includes(q) ||
      inst.manufacturer.toLowerCase().includes(q) ||
      inst.serial_no.toLowerCase().includes(q) ||
      inst.type_designation.toLowerCase().includes(q)
    )
  })

  return (
    <Layout title="Registered Instruments">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
              <Scale className="w-6 h-6 text-navy-700" />
              Registered NAWI Instruments
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Non-Automatic Weighing Instruments registered for pattern evaluation and verification.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="card grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by model, manufacturer, serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 text-sm"
            />
          </div>
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-input text-sm"
            >
              <option value="all">All Accuracy Classes</option>
              <option value="I">Class I (Special)</option>
              <option value="II">Class II (High)</option>
              <option value="III">Class III (Medium)</option>
              <option value="IIII">Class IIII (Ordinary)</option>
            </select>
          </div>
        </div>

        {/* Instruments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((inst) => {
            const lab = labs.find((l) => l.id === inst.labId)
            const reports = mockDb.getReports().filter((r) => r.instrumentId === inst.id)

            return (
              <div key={inst.id} className="card hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-xs font-mono font-semibold text-gray-400">
                        S/N: {inst.serial_no}
                      </span>
                      <h3 className="text-lg font-bold text-navy-900 leading-snug">{inst.model}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{inst.manufacturer}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-navy-100 text-navy-800">
                      Class {inst.accuracy_class}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-400 block">Max Capacity</span>
                      <span className="font-semibold text-navy-900">
                        {inst.max_capacity >= 1000000
                          ? `${inst.max_capacity / 1000000} t`
                          : inst.max_capacity >= 1000
                          ? `${inst.max_capacity / 1000} kg`
                          : `${inst.max_capacity} g`}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-400 block">Verification Scale e</span>
                      <span className="font-semibold text-navy-900">
                        {inst.e >= 1000 ? `${inst.e / 1000} kg` : `${inst.e} g`}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-400 block">Scale Interval d</span>
                      <span className="font-semibold text-navy-900">
                        {inst.d >= 1000 ? `${inst.d / 1000} kg` : `${inst.d} g`}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-400 block">Divisions (n)</span>
                      <span className="font-semibold text-navy-900">{inst.n.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      <strong className="text-gray-600">Assigned Lab:</strong> {lab?.name || 'Central Lab'}
                    </div>
                    <div>
                      <strong className="text-gray-600">Operating Temp:</strong>{' '}
                      {inst.temperature_range_min}°C to {inst.temperature_range_max}°C
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {reports.length} Evaluation{reports.length === 1 ? '' : 's'}
                  </span>
                  <Link
                    to={`/instruments/${inst.id}/history`}
                    className="btn btn-sm btn-outline inline-flex items-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" />
                    Test History
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
