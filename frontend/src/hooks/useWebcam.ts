// src/hooks/useWebcam.ts
import { useRef, useEffect, useState, useCallback } from 'react';

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);

  const startWebcam = useCallback(async (
    constraints: MediaStreamConstraints = { video: true, audio: false }
  ) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera and microphone are not supported in this browser.');
    }

    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      }

      try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints.video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
        audio: constraints.audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
      });

      streamRef.current = stream;
      setIsActive(true);

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        
        // Force play
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Try again
            setTimeout(() => {
              videoRef.current?.play().catch(() => {});
            }, 100);
          });
        }
      }

      return stream;
    } catch (err: any) {
      setIsActive(false);
      let errorMessage = 'Failed to access camera and microphone. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera and microphone permissions.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera or microphone found.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera or microphone is already in use.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }

      throw new Error(errorMessage);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
  }, []);

  // Effect to ensure video plays when ref changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && streamRef.current && video.srcObject !== streamRef.current) {
      video.srcObject = streamRef.current;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.play().catch(() => {});
    }
  });

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return { videoRef, startWebcam, stopWebcam, isActive };
}
