import { useState } from 'react'
import { mockReports } from '../api/mock/data'
import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input, { Select } from '../components/ui/Input'
import MockDataBanner from '../components/ui/MockDataBanner'

const REPORT_TYPES = [
  { value: 'risk',       label: 'Risk Assessment',  description: 'Full risk register with scores, trends and owners' },
  { value: 'compliance', label: 'Compliance Report', description: 'Framework compliance status and gap analysis' },
  { value: 'controls',   label: 'Control Mapping',  description: 'Controls by framework with effectiveness scores' },
  { value: 'evidence',   label: 'Evidence Summary',  description: 'Evidence collection and approval status' },
  { value: 'audit',      label: 'Audit Trail',       description: 'Full platform activity log export' },
]

const FORMAT_OPTIONS = [
  { value: 'pdf',  label: 'PDF' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'csv',  label: 'CSV' },
]

const TYPE_COLORS = {
  risk:       'bg-red-50 text-red-700',
  compliance: 'bg-blue-50 text-blue-700',
  controls:   'bg-purple-50 text-purple-700',
  evidence:   'bg-amber-50 text-amber-700',
  audit:      'bg-slate-100 text-slate-600',
}

const FORMAT_ICONS = {
  pdf:  '📄',
  xlsx: '📊',
  csv:  '📋',
}

function GenerateModal({ open, onClose, onGenerate }) {
  const [form, setForm] = useState({ type: 'risk', format: 'pdf', title: '', dateFrom: '', dateTo: '' })
  const [generating, setGenerating] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 1200))
    onGenerate({
      ...form,
      id: Date.now(),
      title: form.title || `${REPORT_TYPES.find((t) => t.value === form.type)?.label} — ${new Date().toLocaleDateString()}`,
      generated_at: new Date().toISOString().split('T')[0],
      generated_by: 'Alex Johnson',
      status: 'ready',
    })
    setGenerating(false)
    onClose()
  }

  const typeInfo = REPORT_TYPES.find((t) => t.value === form.type)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate Report"
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={generating}>Cancel</Button>
          <Button size="sm" loading={generating} onClick={handle}>Generate</Button>
        </>
      }
    >
      <form onSubmit={handle} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Report Type</label>
          <div className="grid grid-cols-1 gap-2">
            {REPORT_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  form.type === type.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={form.type === type.value}
                  onChange={() => setForm((f) => ({ ...f, type: type.value }))}
                  className="mt-0.5 accent-brand-600"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{type.label}</p>
                  <p className="text-xs text-slate-500">{type.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Input
          label="Report Title (optional)"
          placeholder={`${typeInfo?.label} Report`}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date From"
            type="date"
            value={form.dateFrom}
            onChange={(e) => setForm((f) => ({ ...f, dateFrom: e.target.value }))}
          />
          <Input
            label="Date To"
            type="date"
            value={form.dateTo}
            onChange={(e) => setForm((f) => ({ ...f, dateTo: e.target.value }))}
          />
        </div>

        <Select
          label="Export Format"
          value={form.format}
          onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
        >
          {FORMAT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </form>
    </Modal>
  )
}

export default function Reports() {
  const [reports, setReports] = useState(mockReports)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [downloading, setDownloading] = useState(null)

  const filtered = reports.filter((r) => typeFilter === 'all' || r.type === typeFilter)

  const handleGenerate = (newReport) => {
    setReports((prev) => [newReport, ...prev])
  }

  const handleDownload = async (report) => {
    setDownloading(report.id)
    await new Promise((r) => setTimeout(r, 800))
    setDownloading(null)
    // In production: trigger real blob download via reportsApi.download(report.id, report.format)
  }

  return (
    <div className="space-y-5">
      <MockDataBanner />
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: reports.length,                              bg: 'bg-white' },
          { label: 'Ready',         value: reports.filter((r) => r.status === 'ready').length,      bg: 'bg-emerald-50', color: 'text-emerald-700' },
          { label: 'Generating',    value: reports.filter((r) => r.status === 'generating').length, bg: 'bg-blue-50',    color: 'text-blue-700' },
          { label: 'Scheduled',     value: 2,                                            bg: 'bg-purple-50',  color: 'text-purple-700' },
        ].map((stat) => (
          <Card key={stat.label} className={`${stat.bg} border-0`}>
            <p className={`text-2xl font-bold ${stat.color ?? 'text-slate-800'}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[{ value: 'all', label: 'All' }, ...REPORT_TYPES].map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                typeFilter === t.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setGenerateOpen(true)}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Generate Report
        </Button>
      </div>

      {/* Report list */}
      <div className="space-y-3">
        {filtered.map((report) => (
          <Card key={report.id} className="hover:shadow-card-hover transition-shadow">
            <div className="flex items-center gap-4">
              <div className="text-2xl shrink-0">{FORMAT_ICONS[report.format]}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[report.type] ?? 'bg-slate-100 text-slate-600'}`}>
                    {report.type}
                  </span>
                  <Badge label={report.status} variant={report.status} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generated {report.generated_at} by {report.generated_by} · {report.format.toUpperCase()}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                {report.status === 'generating' ? (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    Generating…
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={downloading === report.id}
                    onClick={() => handleDownload(report)}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <svg className="h-12 w-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <p className="text-sm">No reports found for this filter.</p>
            <Button size="sm" className="mt-4" onClick={() => setGenerateOpen(true)}>
              Generate your first report
            </Button>
          </div>
        )}
      </div>

      <GenerateModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onGenerate={handleGenerate}
      />
    </div>
  )
}
