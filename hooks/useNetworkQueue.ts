// hooks/useNetworkQueue.ts
import { useState, useEffect, useCallback } from 'react';
import { NetworkState } from '@/types/voice-recorder';

const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff

export const useNetworkQueue = () => {
  const [state, setState] = useState<NetworkState>({
    isOnline: true,
    queue: [],
  });

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    setState(prev => ({ ...prev, isOnline: navigator.onLine }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = useCallback((blob: Blob) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, blob],
    }));
  }, []);

  const processQueue = useCallback(async (processor: (blob: Blob) => Promise<void>) => {
    if (state.queue.length === 0) return;

    const queueCopy = [...state.queue];
    setState(prev => ({ ...prev, queue: [] }));

    for (const blob of queueCopy) {
      let lastError = null;
      
      // Try each item with exponential backoff
      for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
        try {
          if (!navigator.onLine) {
            // If we're offline, put the item back in the queue and stop processing
            setState(prev => ({
              ...prev,
              queue: [...prev.queue, blob],
            }));
            return;
          }

          await processor(blob);
          break; // Success, move to next item
        } catch (error) {
          lastError = error;
          
          // If we've run out of retries, or if it's a 4xx error (client error), 
          // don't retry
          if (
            attempt === RETRY_DELAYS.length - 1 || 
            (error instanceof Error && error.message.includes('400'))
          ) {
            console.error('Failed to process queued item after all retries:', error);
            continue; // Move to next item
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
        }
      }
    }
  }, [state.queue]);

  return {
    isOnline: state.isOnline,
    queue: state.queue,
    addToQueue,
    processQueue,
  };
};