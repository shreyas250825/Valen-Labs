// src/hooks/useSpeech.ts
// Improved wrapper around the browser Web Speech API with better error handling.

export type OnResult = (text: string) => void;

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export function useSpeechRecognition() {
  const SpeechRecognitionCtor =
    (typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
    null;

  if (!SpeechRecognitionCtor) {
    console.warn('SpeechRecognition not supported');
    return {
      start: (_: OnResult) => {},
      stop: () => {},
      supported: false,
    transcript: '',
    };
  }

  let recognition: any | null = null;
  let listening = false;
  let currentTranscript = '';

  function init() {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
    }

    recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = true; // Enable interim results for real-time feedback
    recognition.maxAlternatives = 1;
    recognition.continuous = true; // Enable continuous recognition
  }

  function start(onResult: OnResult) {
    // Stop any existing recognition first
    if (recognition && listening) {
    try {
        recognition.stop();
      } catch (e) {
        // Ignore
      }
    }

    // Reset transcript completely
    currentTranscript = '';

    if (!recognition) {
      init();
      }

    // Reset recognition state
    recognition.onresult = (e: any) => {
      try {
        let interimTranscript = '';
        let finalTranscript = '';

        // Only process new results (from resultIndex onwards)
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
        }
        }

        // Update current transcript only with new final results
        if (finalTranscript) {
          currentTranscript += finalTranscript;
          // Send the complete accumulated transcript
          onResult(currentTranscript.trim());
        } else if (interimTranscript) {
          // For interim results, show current + interim
          onResult((currentTranscript + interimTranscript).trim());
        }
      } catch (err) {
        console.error('STT parse error', err);
    }
    };

    recognition.onerror = (e: any) => {
      // Only log non-critical errors
      if (e.error === 'no-speech' || e.error === 'audio-capture') {
        // These are expected and can be ignored in continuous mode
      return;
    }

      if (e.error === 'aborted') {
        // User stopped or restarted recognition
        listening = false;
        return;
      }

      if (e.error === 'not-allowed') {
        console.error('Microphone permission denied. Please allow microphone access.');
        listening = false;
        return;
      }

      // For other errors, try to restart if still supposed to be listening
      if (listening && e.error !== 'network') {
        try {
          recognition.stop();
          setTimeout(() => {
            if (listening) {
              try {
                recognition.start();
              } catch (restartErr) {
                console.error('Failed to restart recognition:', restartErr);
                listening = false;
              }
            }
          }, 100);
        } catch (stopErr) {
          // Ignore stop errors
      }
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (listening) {
        try {
          recognition.start();
        } catch (err) {
          console.error('Auto-restart failed:', err);
          listening = false;
        }
      }
    };

    try {
      recognition.start();
      listening = true;
    } catch (err: any) {
      // If already started, try stopping and restarting
      if (err.message?.includes('already started')) {
        try {
          recognition.stop();
          setTimeout(() => {
            try {
              recognition.start();
              listening = true;
            } catch (restartErr) {
              console.error('Failed to restart after stop:', restartErr);
            }
          }, 100);
        } catch (stopErr) {
          console.error('Failed to stop before restart:', stopErr);
        }
      } else {
        console.error('Failed to start SpeechRecognition:', err);
      }
    }
  }

  function stop() {
    listening = false;
    if (recognition) {
      try {
        recognition.onend = null; // Prevent auto-restart
        recognition.stop();
      } catch (err) {
        // Ignore errors when stopping
      }
    }
    currentTranscript = ''; // Reset transcript when stopping
  }

  function reset() {
    // Completely reset the recognition instance
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore
      }
    }
    recognition = null;
    listening = false;
    currentTranscript = '';
  }

  return { start, stop, reset, supported: true, transcript: currentTranscript };
}
