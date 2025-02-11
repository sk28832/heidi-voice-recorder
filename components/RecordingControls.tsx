// components/RecordingControls.tsx
import { Button } from '@/components/ui/button';
import { Mic, Pause, Square } from 'lucide-react';
import { RecordingStatus } from '@/types/voice-recorder';

interface RecordingControlsProps {
  status: RecordingStatus;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  status,
  onStart,
  onPause,
  onStop,
}) => (
  <div className="flex gap-2 justify-center">
    <Button
      onClick={onStart}
      disabled={status !== 'idle'}
      variant="default"
      size="lg"
      className="w-32"
    >
      <Mic className="mr-2 h-4 w-4" />
      Record
    </Button>
    
    <Button
      onClick={onPause}
      disabled={status !== 'recording' && status !== 'paused'}
      variant="outline"
      size="lg"
      className="w-32"
    >
      <Pause className="mr-2 h-4 w-4" />
      {status === 'paused' ? 'Resume' : 'Pause'}
    </Button>
    
    <Button
      onClick={onStop}
      disabled={status === 'idle' || status === 'processing'}
      variant="destructive"
      size="lg"
      className="w-32"
    >
      <Square className="mr-2 h-4 w-4" />
      Stop
    </Button>
  </div>
);