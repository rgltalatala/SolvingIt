type LessonApplyPanelProps = {
  hint: string
  buttonLabel: string
  disabled: boolean
  onApply: () => void
}

export function LessonApplyPanel({
  hint,
  buttonLabel,
  disabled,
  onApply,
}: LessonApplyPanelProps) {
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-400">{hint}</p>
      <button
        type="button"
        disabled={disabled}
        className="inline-flex shrink-0 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onApply}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
