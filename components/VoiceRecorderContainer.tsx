// components/VoiceRecorderContainer.tsx
"use client"
import { useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useTranscription } from '@/hooks/useTranscription';
import { useNetworkQueue } from '@/hooks/useNetworkQueue';
import { RecordingControls } from './RecordingControls';
import { TranscriptDisplay } from './TranscriptDisplay';
import { OfflineAlert } from './OfflineAlert';

export const VoiceRecorderContainer = () => {
  const { toast } = useToast();
  const { 
    status,
    error: recordingError,
    startRecording,
    pauseRecording,
    stopRecording,
  } = useAudioRecorder();
  
  const {
    transcript,
    isTranscribing,
    transcribeAudio,
  } = useTranscription();
  
  const {
    isOnline,
    queue,
    addToQueue,
    processQueue,
  } = useNetworkQueue();

  // Handle stopping and transcribing
  const handleStop = useCallback(async () => {
    const audioBlob = await stopRecording();
    if (!audioBlob) return;

    if (isOnline) {
      try {
        await transcribeAudio(audioBlob);
        toast({
          title: "Success",
          description: "Your recording has been transcribed.",
        });
      } catch (_error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to transcribe recording. Please try again.",
        });
      }
    } else {
      addToQueue(audioBlob);
      toast({
        title: "Recording saved",
        description: "Your recording will be transcribed when you're back online.",
      });
    }
  }, [isOnline, stopRecording, transcribeAudio, addToQueue, toast]);

  // Handle recording state changes
  useEffect(() => {
    switch (status) {
      case 'recording':
        toast({
          title: "Recording started",
          description: "Speak clearly into your microphone.",
        });
        break;
      case 'paused':
        toast({
          title: "Recording paused",
          description: "Click resume when you're ready to continue.",
        });
        break;
      case 'processing':
        toast({
          title: "Processing",
          description: "Preparing your recording...",
        });
        break;
    }
  }, [status, toast]);

  // Handle recording errors
  useEffect(() => {
    if (recordingError) {
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: recordingError.message || "Failed to access microphone.",
      });
    }
  }, [recordingError, toast]);

  // Process queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue(async (blob) => {
        await transcribeAudio(blob);
      });
    }
  }, [isOnline, queue.length, processQueue, transcribeAudio]);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="backdrop-blur-sm bg-white/90">
        <CardHeader>
          <CardTitle className="text-xl text-center">Voice Recorder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RecordingControls
            status={status}
            onStart={startRecording}
            onPause={pauseRecording}
            onStop={handleStop}
          />
          
          <OfflineAlert 
            isOffline={!isOnline}
            queueSize={queue.length}
          />

          <TranscriptDisplay
            transcript={transcript}
            isTranscribing={isTranscribing}
          />
        </CardContent>
      </Card>
    </div>
  );
};