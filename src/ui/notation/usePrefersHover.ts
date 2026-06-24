import { useEffect, useState } from 'react';

/** True when the device supports hover (mouse/trackpad). */
export function usePrefersHover(): boolean {
  const [prefersHover, setPrefersHover] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(hover: hover)').matches
      : true,
  );

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)');
    const onChange = () => setPrefersHover(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return prefersHover;
}
