// hooks/useTranscription.ts
import { useState, useCallback } from 'react';
import { TranscriptionState, TranscriptionResponse } from '@/types/voice-recorder';

export const useTranscription = () => {
  const [state, setState] = useState<TranscriptionState>({
    transcript: null,
    isTranscribing: false,
    error: null,
  });

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setState(prev => ({ ...prev, isTranscribing: true, error: null }));
    
    try {
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }
  
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
  
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
  
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!data.text && !data.utterances?.length) {
        throw new Error('Invalid transcription response');
      }
  
      setState(prev => ({ 
        ...prev, 
        transcript: data,
        isTranscribing: false 
      }));
      
      return data;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error as Error,
        isTranscribing: false 
      }));
      throw error;
    }
  }, []);

  return {
    transcript: state.transcript,
    isTranscribing: state.isTranscribing,
    error: state.error,
    transcribeAudio,
  };
};