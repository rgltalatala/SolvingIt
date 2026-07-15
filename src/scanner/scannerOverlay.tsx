import { SCAN_GRID_FRACTION } from './scannerConstants';
import { scannerOverlay as scannerCopy, ui } from '../content/ui';

interface ScannerOverlayProps {
  videoRef: (node: HTMLVideoElement | null) => void;
  isReady: boolean;
  error: string | null;
  onCapture: () => void;
}

export function ScannerOverlay({
  videoRef,
  isReady,
  error,
  onCapture,
}: ScannerOverlayProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-600 bg-slate-950">
        <video
          ref={videoRef}
          className="aspect-4/3 w-full object-cover"
          autoPlay
          muted
          playsInline
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="grid aspect-square grid-cols-3 grid-rows-3"
            style={{ height: `${SCAN_GRID_FRACTION * 100}%` }}
          >
            {Array.from({ length: 9 }).map((_, idx) => (
              <div key={idx} className="border border-white/90 bg-white/5" />
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-300">{scannerCopy.lightingTip}</p>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {!error && !isReady ? (
        <p className="text-sm text-slate-300">{scannerCopy.startingCamera}</p>
      ) : null}

      <button
        type="button"
        className="rounded-md bg-cyan-500 px-5 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-500"
        disabled={!isReady || Boolean(error)}
        onClick={onCapture}
      >
        {ui.capture}
      </button>
    </div>
  );
}
