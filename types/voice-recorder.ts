// types/voice-recorder.ts
export interface Utterance {
    speaker: string;
    text: string;
  }
  
  export interface TranscriptionResponse {
    text: string;
    utterances?: Utterance[];
  }
  
  export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'processing';
  
  export interface AudioRecorderState {
    status: RecordingStatus;
    error: Error | null;
  }
  
  export interface TranscriptionState {
    transcript: TranscriptionResponse | null;
    isTranscribing: boolean;
    error: Error | null;
  }
  
  export interface NetworkState {
    isOnline: boolean;
    queue: Blob[];
  }