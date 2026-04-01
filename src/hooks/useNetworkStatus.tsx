import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export const OfflineBanner: React.FC = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[200] bg-amber-500 text-black px-4 py-3 text-center text-sm font-medium"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.828-2.828m2.828 2.828L21 21M15.556 10a5 5 0 010 7.072m0 0l-2.828-2.828m2.828 2.828L17 17M12 7a5 5 0 010 7.072m0 0L9.172 11.24m2.828 2.828L12 14" />
        </svg>
        <span>You appear to be offline. Some features may not work.</span>
      </div>
    </div>
  );
};
