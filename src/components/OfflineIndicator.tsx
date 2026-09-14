import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl shadow-black/40 border border-amber-400/40 animate-pulse"
    >
      <WifiOff className="w-4 h-4 text-white" />
      <span>Offline Mode — Checklist progress is securely saved locally.</span>
    </div>
  );
};
