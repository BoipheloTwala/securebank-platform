export default function Input({
  label,
  error,
  helper,
  icon: Icon,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-slate-400" />
          </span>
        )}
        <input
          className={`
            w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            transition-colors duration-150
            ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'}
            ${Icon ? 'pl-9' : ''}
            ${inputClassName}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {helper && !error && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={`
          w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          disabled:bg-slate-50 disabled:cursor-not-allowed
          transition-colors duration-150
          ${error ? 'border-red-400' : 'border-slate-300'}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
