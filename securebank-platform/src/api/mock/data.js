// Mock data for local development (VITE_ENABLE_MOCK_DATA=true)

export const mockUser = {
  id: 1,
  username: 'analyst@securebank.com',
  full_name: 'Alex Johnson',
  role: 'Risk Analyst',
  department: 'Compliance',
  avatar: null,
  permissions: ['view_risks', 'edit_risks', 'view_controls', 'view_evidence', 'view_reports'],
}

export const mockKPIs = {
  total_risks: 142,
  critical_risks: 8,
  high_risks: 23,
  open_controls: 67,
  compliance_score: 84,
  evidence_pending: 12,
  risks_trend: +3,
  compliance_trend: +2,
}

export const mockRisks = [
  { id: 1, title: 'SQL Injection Vulnerability', category: 'Technical', likelihood: 4, impact: 5, status: 'open',    owner: 'IT Security',   created_at: '2026-06-01' },
  { id: 2, title: 'Weak Password Policy',        category: 'Technical', likelihood: 3, impact: 4, status: 'mitigated', owner: 'IT Security', created_at: '2026-05-15' },
  { id: 3, title: 'Third-party Vendor Risk',     category: 'Operational', likelihood: 3, impact: 3, status: 'open',  owner: 'Procurement',   created_at: '2026-06-10' },
  { id: 4, title: 'Regulatory Non-compliance',   category: 'Compliance', likelihood: 2, impact: 5, status: 'open',   owner: 'Legal',         created_at: '2026-06-12' },
  { id: 5, title: 'Data Breach Exposure',        category: 'Technical', likelihood: 4, impact: 5, status: 'open',    owner: 'CISO Office',   created_at: '2026-06-14' },
  { id: 6, title: 'Insider Threat',              category: 'Operational', likelihood: 2, impact: 4, status: 'open',  owner: 'HR',            created_at: '2026-06-15' },
  { id: 7, title: 'DDoS Attack Surface',         category: 'Technical', likelihood: 3, impact: 3, status: 'open',    owner: 'Network Ops',   created_at: '2026-06-16' },
  { id: 8, title: 'Outdated Software Libraries', category: 'Technical', likelihood: 4, impact: 3, status: 'mitigated', owner: 'DevOps',      created_at: '2026-05-20' },
  { id: 9, title: 'Audit Log Gaps',              category: 'Compliance', likelihood: 3, impact: 4, status: 'open',   owner: 'Compliance',    created_at: '2026-06-18' },
  { id: 10, title: 'Business Continuity Gap',    category: 'Operational', likelihood: 2, impact: 5, status: 'open',  owner: 'Operations',    created_at: '2026-06-19' },
]

export const mockHeatmapData = Array.from({ length: 25 }, (_, i) => {
  const likelihood = (i % 5) + 1
  const impact = Math.floor(i / 5) + 1
  const count = mockRisks.filter(
    (r) => r.likelihood === likelihood && r.impact === impact
  ).length
  return { likelihood, impact, count }
})

export const mockControls = [
  { id: 1, title: 'Multi-Factor Authentication',    framework: 'ISO 27001', control_id: 'A.9.4.2',  status: 'implemented', effectiveness: 92, risk_ids: [2, 6] },
  { id: 2, title: 'Data Encryption at Rest',        framework: 'PCI-DSS',   control_id: 'Req 3.5',  status: 'implemented', effectiveness: 88, risk_ids: [5] },
  { id: 3, title: 'Vulnerability Scanning',         framework: 'NIST CSF',  control_id: 'DE.CM-8',  status: 'in_progress', effectiveness: 70, risk_ids: [1, 8] },
  { id: 4, title: 'Vendor Risk Assessments',        framework: 'ISO 27001', control_id: 'A.15.2.1', status: 'implemented', effectiveness: 75, risk_ids: [3] },
  { id: 5, title: 'Access Control Policy',          framework: 'ISO 27001', control_id: 'A.9.1.1',  status: 'implemented', effectiveness: 85, risk_ids: [6] },
  { id: 6, title: 'Incident Response Plan',         framework: 'NIST CSF',  control_id: 'RS.RP-1',  status: 'in_progress', effectiveness: 60, risk_ids: [5, 7] },
  { id: 7, title: 'Audit Log Monitoring',           framework: 'PCI-DSS',   control_id: 'Req 10.2', status: 'not_started', effectiveness: 0,  risk_ids: [9] },
  { id: 8, title: 'Business Continuity Planning',   framework: 'ISO 22301', control_id: 'BCP-01',   status: 'in_progress', effectiveness: 55, risk_ids: [10] },
]

export const mockEvidence = [
  { id: 1, title: 'MFA Configuration Screenshot',    type: 'image',    control_id: 1, uploaded_by: 'Alex Johnson', uploaded_at: '2026-06-10', status: 'approved', file_size: '245 KB' },
  { id: 2, title: 'Encryption Policy Document',      type: 'document', control_id: 2, uploaded_by: 'Sarah Lee',   uploaded_at: '2026-06-12', status: 'approved', file_size: '1.2 MB' },
  { id: 3, title: 'Vulnerability Scan Report Q2',    type: 'report',   control_id: 3, uploaded_by: 'Tom Brown',   uploaded_at: '2026-06-20', status: 'pending',  file_size: '890 KB' },
  { id: 4, title: 'Vendor Contract — CloudOps Ltd',  type: 'document', control_id: 4, uploaded_by: 'Alex Johnson', uploaded_at: '2026-06-22', status: 'approved', file_size: '3.4 MB' },
  { id: 5, title: 'Access Control Audit Log',        type: 'log',      control_id: 5, uploaded_by: 'Sarah Lee',   uploaded_at: '2026-07-01', status: 'review',   file_size: '560 KB' },
  { id: 6, title: 'IR Tabletop Exercise Results',    type: 'report',   control_id: 6, uploaded_by: 'Tom Brown',   uploaded_at: '2026-07-05', status: 'pending',  file_size: '720 KB' },
]

export const mockReports = [
  { id: 1, title: 'Q2 2026 Risk Assessment Report', type: 'risk',       generated_at: '2026-07-01', generated_by: 'Alex Johnson', status: 'ready',      format: 'pdf' },
  { id: 2, title: 'PCI-DSS Compliance Report',      type: 'compliance', generated_at: '2026-07-05', generated_by: 'Sarah Lee',   status: 'ready',      format: 'pdf' },
  { id: 3, title: 'ISO 27001 Control Mapping',       type: 'controls',   generated_at: '2026-07-10', generated_by: 'Tom Brown',   status: 'ready',      format: 'xlsx' },
  { id: 4, title: 'Evidence Collection Summary',     type: 'evidence',   generated_at: '2026-07-15', generated_by: 'Alex Johnson', status: 'generating', format: 'pdf' },
  { id: 5, title: 'Monthly Audit Trail Export',      type: 'audit',      generated_at: '2026-07-19', generated_by: 'System',      status: 'ready',      format: 'csv' },
]

export const mockTrendData = [
  { month: 'Feb', critical: 12, high: 28, medium: 45, low: 30 },
  { month: 'Mar', critical: 10, high: 25, medium: 48, low: 28 },
  { month: 'Apr', critical: 9,  high: 24, medium: 42, low: 31 },
  { month: 'May', critical: 11, high: 22, medium: 40, low: 29 },
  { month: 'Jun', critical: 8,  high: 23, medium: 38, low: 27 },
  { month: 'Jul', critical: 8,  high: 23, medium: 36, low: 25 },
]

export const mockComplianceScores = [
  { framework: 'ISO 27001', score: 84, total: 114 },
  { framework: 'PCI-DSS',   score: 79, total: 251 },
  { framework: 'NIST CSF',  score: 91, total: 108 },
  { framework: 'SOX',       score: 88, total: 62  },
]

export const mockActivity = [
  { id: 1, type: 'risk_created',    message: 'New risk "Data Breach Exposure" created',          user: 'Alex Johnson', time: '2 hours ago' },
  { id: 2, type: 'evidence_added',  message: 'Evidence uploaded for MFA Configuration',           user: 'Sarah Lee',    time: '4 hours ago' },
  { id: 3, type: 'control_updated', message: 'Vulnerability Scanning control updated to 70%',     user: 'Tom Brown',    time: '1 day ago'   },
  { id: 4, type: 'report_ready',    message: 'Q2 2026 Risk Assessment Report is ready',           user: 'System',       time: '1 day ago'   },
  { id: 5, type: 'risk_mitigated',  message: 'Risk "Weak Password Policy" marked as mitigated',   user: 'Alex Johnson', time: '2 days ago'  },
]
