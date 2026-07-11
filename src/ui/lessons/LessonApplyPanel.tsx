type LessonApplyButtonProps = {
  buttonLabel: string;
  disabled: boolean;
  onApply: () => void;
  fullWidth?: boolean;
};

export function LessonApplyButton({
  buttonLabel,
  disabled,
  onApply,
  fullWidth = false,
}: LessonApplyButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 ${
        fullWidth ? 'w-full justify-center' : 'shrink-0'
      }`}
      onClick={onApply}
    >
      {buttonLabel}
    </button>
  );
}

type LessonApplyPanelProps = LessonApplyButtonProps & {
  hint: string;
};

export function LessonApplyPanel({ hint }: Pick<LessonApplyPanelProps, 'hint'>) {
  return <p className="mt-4 text-sm text-slate-400">{hint}</p>;
}
