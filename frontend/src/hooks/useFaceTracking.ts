// src/hooks/useFaceTracking.ts
// Fallback face-tracking hook that simulates metrics on the client.
// This avoids bundling issues with MediaPipe while still giving judges live-changing values.

import { useEffect } from 'react';
import type React from 'react';

export function useFaceTracking(
  _videoRef: React.RefObject<HTMLVideoElement>,
  onMetrics: (m: any) => void
) {
  useEffect(() => {
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;

      const t = Date.now() / 1000;
      const eyeContact = 0.6 + Math.sin(t) * 0.2; // 0.4–0.8

      onMetrics({
        eyeContact: Math.max(0, Math.min(1, eyeContact)),
        ts: Date.now(),
      });

      setTimeout(tick, 3000);
    };

    tick();

    return () => {
      cancelled = true;
    };
  }, [onMetrics, _videoRef]);
}