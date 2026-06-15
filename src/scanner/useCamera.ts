import { useCallback, useEffect, useRef, useState } from 'react';

const CAMERA_ERROR_MAP: Record<string, string> = {
  NotAllowedError:
    'Camera access was denied. Please allow camera permission and try again.',
  NotFoundError: 'No camera device was found on this device.',
  NotReadableError:
    'Camera is unavailable because it is being used by another app.',
  OverconstrainedError:
    'The selected camera constraints are not supported on this device.',
};

export interface UseCameraResult {
  videoRef: (node: HTMLVideoElement | null) => void;
  isReady: boolean;
  error: string | null;
  captureFrame: () => ImageData | null;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsReady(true);
        }
      } catch (rawError) {
        const err = rawError as DOMException;
        setError(CAMERA_ERROR_MAP[err.name] ?? 'Failed to access camera.');
      }
    }

    setupCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const attachStreamToVideo = useCallback(
    async (videoEl: HTMLVideoElement | null) => {
      if (!videoEl || !streamRef.current) return;
      if (videoEl.srcObject !== streamRef.current) {
        videoEl.srcObject = streamRef.current;
      }
      await videoEl.play();
      setIsReady(true);
    },
    [],
  );

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node && streamRef.current) {
        void attachStreamToVideo(node);
      }
    },
    [attachStreamToVideo],
  );

  const captureFrame = useCallback((): ImageData | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return null;
    }

    let canvas = captureCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      captureCanvasRef.current = canvas;
      captureContextRef.current = canvas.getContext('2d');
    }
    const context = captureContextRef.current;
    if (!context) return null;

    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  return { videoRef: setVideoRef, isReady, error, captureFrame };
}
