// hooks/useAudioRecorder.ts
import { useState, useRef, useCallback } from 'react';
import { AudioRecorderState } from '@/types/voice-recorder';

export const useAudioRecorder = () => {
  const [state, setState] = useState<AudioRecorderState>({
    status: 'idle',
    error: null,
  });
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start(1000); // Collect data every second
      setState({ status: 'recording', error: null });
    } catch (error) {
      setState({ status: 'idle', error: error as Error });
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && state.status === 'recording') {
      mediaRecorder.current.pause();
      setState(prev => ({ ...prev, status: 'paused' }));
    } else if (mediaRecorder.current && state.status === 'paused') {
      mediaRecorder.current.resume();
      setState(prev => ({ ...prev, status: 'recording' }));
    }
  }, [state.status]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorder.current && state.status !== 'idle') {
        setState(prev => ({ ...prev, status: 'processing' }));
        
        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          audioChunks.current = [];
          setState({ status: 'idle', error: null });
          resolve(audioBlob);
        };

        mediaRecorder.current.stop();
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      } else {
        resolve(null);
      }
    });
  }, [state.status]);

  return {
    status: state.status,
    error: state.error,
    startRecording,
    pauseRecording,
    stopRecording,
  };
};