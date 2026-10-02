import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Printer, Download, AlertTriangle, FileText, Home } from 'lucide-react'
import mockDb from '@/data/mockDb'
import type { Report } from '@/types'
import { exportReportToDocx } from '@/export/docxExport'
import { generateReportHtml } from '@/export/pdfExport'

export default function ReportPrintPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<Report | undefined>(() => (id ? mockDb.getReport(id) : undefined))
  const [isExportingDocx, setIsExportingDocx] = useState(false)

  useEffect(() => {
    if (id && !report) {
      setReport(mockDb.getReport(id))
    }
  }, [id, report])

  const handlePrint = () => {
    window.print()
  }

  const handleExportDocx = async () => {
    if (!report) return
    try {
      setIsExportingDocx(true)
      await exportReportToDocx(report)
    } catch (err: any) {
      alert(`DOCX export failed: ${err.message}`)
    } finally {
      setIsExportingDocx(false)
    }
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-lg font-bold text-[#0d2137] mb-2">Report Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            The requested report "{id}" could not be located in the local metrology repository.
          </p>
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d2137] text-white rounded-lg text-sm font-semibold hover:bg-opacity-90"
          >
            <ArrowLeft size={16} /> Return to Reports
          </Link>
        </div>
      </div>
    )
  }

  const rawHtml = generateReportHtml(report, false)

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white text-navy-950">
      {/* Top Floating Action Bar (Hidden during print) */}
      <div className="no-print sticky top-0 z-50 bg-[#0d2137] text-white px-6 py-3 shadow-md flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
            title="Dashboard Home"
          >
            <Home size={14} />
            Home
          </Link>
          <div className="border-l border-white/20 pl-3 ml-1">
            <h1 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <FileText size={16} className="text-[#FF9933]" />
              {report.reportNo}
            </h1>
            <p className="text-[11px] text-gray-300">
              OIML R 76-2 Standard Pattern Evaluation Print Preview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-[#FF9933] text-white hover:bg-[#e08528] shadow-sm transition-transform active:scale-95"
          >
            <Printer size={15} />
            Print / Save as PDF (Ctrl+P)
          </button>
          <button
            type="button"
            disabled={isExportingDocx}
            onClick={handleExportDocx}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            {isExportingDocx ? 'Exporting Word…' : 'Export DOCX'}
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="max-w-[210mm] mx-auto my-6 print:my-0 bg-white shadow-2xl print:shadow-none border border-gray-300 print:border-none p-8 sm:p-12">
        <div
          dangerouslySetInnerHTML={{
            __html: rawHtml.substring(
              rawHtml.indexOf('<div class="header-bar"></div>'),
              rawHtml.lastIndexOf('</body>')
            ),
          }}
        />
      </div>
    </div>
  )
}
