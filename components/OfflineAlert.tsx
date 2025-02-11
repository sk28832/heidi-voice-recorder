// src/components/OfflineAlert.tsx
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OfflineAlertProps {
  isOffline: boolean;
  queueSize: number;
}

export const OfflineAlert: React.FC<OfflineAlertProps> = ({
  isOffline,
  queueSize,
}) => {
  if (!isOffline && queueSize === 0) return null;

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertDescription>
        {isOffline 
          ? "You're currently offline. Recordings will be transcribed when your connection is restored."
          : `Processing ${queueSize} queued recording(s)...`
        }
      </AlertDescription>
    </Alert>
  );
};