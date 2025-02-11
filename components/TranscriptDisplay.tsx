// components/TranscriptDisplay.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { TranscriptionResponse } from '@/types/voice-recorder';

interface TranscriptDisplayProps {
  transcript: TranscriptionResponse | null;
  isTranscribing: boolean;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  isTranscribing,
}) => {
  if (!transcript && !isTranscribing) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Transcript</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTranscribing ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Transcribing your audio...
          </div>
        ) : transcript?.utterances && transcript.utterances.length > 0 ? (
          transcript.utterances.map((utterance, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm font-medium">Speaker {utterance.speaker}</p>
              <p className="text-sm text-muted-foreground pl-4">
                {utterance.text}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            {transcript?.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
};