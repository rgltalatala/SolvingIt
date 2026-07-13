import type { Move } from '../../cube/cubeState';
import type { NotationMoveKind } from './useNotationCube';
import { notationCardId } from './notationMoves';

type NotationMoveCardProps = {
  move: Move;
  kind: NotationMoveKind;
  description: string;
  isActive: boolean;
  isAnimating: boolean;
  prefersHover: boolean;
  onActivate: (move: Move, kind: NotationMoveKind) => void;
  onDeactivate: () => void;
  onSelect: (move: Move, kind: NotationMoveKind) => void;
  variant?: 'face' | 'rotation';
};

function notationMoveRingClassName(options: {
  isAnimating: boolean;
  variant: 'face' | 'rotation';
}): string {
  const { isAnimating, variant } = options;
  if (!isAnimating) return '';
  if (variant === 'rotation') return 'ring-1 ring-violet-600/60';
  return 'ring-1 ring-amber-700/60';
}

export function NotationMoveCard({
  move,
  kind,
  description,
  isActive,
  isAnimating,
  prefersHover,
  onActivate,
  onDeactivate,
  onSelect,
  variant = kind,
}: NotationMoveCardProps) {
  const ringClass = notationMoveRingClassName({
    isAnimating,
    variant,
  });

  const borderClass = isActive
    ? 'border-cyan-300 text-cyan-100'
    : 'border-slate-600 text-slate-100';

  return (
    <button
      type="button"
      className={`flex flex-col items-start gap-1 rounded-lg border bg-slate-950/40 px-3 py-2 text-left transition-colors hover:border-slate-500 ${borderClass} ${ringClass}`}
      aria-pressed={isActive}
      onMouseEnter={
        prefersHover ? () => onActivate(move, kind) : undefined
      }
      onMouseLeave={prefersHover ? onDeactivate : undefined}
      onClick={() => {
        if (prefersHover) return;
        onSelect(move, kind);
      }}
      data-testid={notationCardId(kind, move)}
    >
      <span className="font-mono text-sm font-semibold">{move}</span>
      <span className="text-xs leading-snug text-slate-400">{description}</span>
    </button>
  );
}
