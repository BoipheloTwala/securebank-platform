const variants = {
  critical:    'bg-red-50 text-red-700 border-red-200',
  high:        'bg-orange-50 text-orange-700 border-orange-200',
  medium:      'bg-yellow-50 text-yellow-700 border-yellow-200',
  low:         'bg-green-50 text-green-700 border-green-200',
  minimal:     'bg-cyan-50 text-cyan-700 border-cyan-200',
  danger:      'bg-red-50 text-red-700 border-red-200',
  warning:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  success:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  info:        'bg-blue-50 text-blue-700 border-blue-200',
  open:        'bg-red-50 text-red-700 border-red-200',
  mitigated:   'bg-green-50 text-green-700 border-green-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  not_started: 'bg-slate-50 text-slate-600 border-slate-200',
  implemented: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  approved:    'bg-green-50 text-green-700 border-green-200',
  pending:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  review:      'bg-blue-50 text-blue-700 border-blue-200',
  rejected:    'bg-red-50 text-red-700 border-red-200',
  ready:       'bg-green-50 text-green-700 border-green-200',
  generating:  'bg-blue-50 text-blue-700 border-blue-200',
  default:     'bg-slate-50 text-slate-600 border-slate-200',
}

const sizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-xs',
}

export default function Badge({ label, children, variant = 'default', size = 'md', className = '' }) {
  const style = variants[variant] ?? variants.default
  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${sizes[size]} ${style} ${className}`}>
      {children ?? label}
    </span>
  )
}

export function RiskLevelBadge({ likelihood, impact }) {
  const score = likelihood * impact
  let variant, label
  if (score >= 20)      { variant = 'critical'; label = 'Critical' }
  else if (score >= 12) { variant = 'high';     label = 'High'     }
  else if (score >= 6)  { variant = 'medium';   label = 'Medium'   }
  else if (score >= 3)  { variant = 'low';      label = 'Low'      }
  else                  { variant = 'minimal';  label = 'Minimal'  }
  return <Badge label={label} variant={variant} />
}
