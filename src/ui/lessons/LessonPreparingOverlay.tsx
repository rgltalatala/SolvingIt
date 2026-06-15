type LessonPreparingOverlayProps = {
  subtitle?: string
}

export function LessonPreparingOverlay({
  subtitle = 'Finding a short demo sequence for this cube.',
}: LessonPreparingOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-950/75 px-4 text-center">
      <p className="text-sm font-semibold text-slate-100">Preparing next example…</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  )
}
