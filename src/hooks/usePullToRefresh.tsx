import { useState, useEffect, useCallback } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export const usePullToRefresh = ({ onRefresh, threshold = 100 }: UsePullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY === 0 || window.scrollY > 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 2));
    }
  }, [startY, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  }, [pullDistance, threshold, refreshing, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { refreshing, pullDistance };
};

// Pull-to-refresh indicator component
export const PullToRefreshIndicator: React.FC<{ distance: number; refreshing: boolean }> = ({ distance, refreshing }) => {
  const opacity = Math.min(distance / 100, 1);
  const rotation = distance * 0.5;

  if (distance === 0 && !refreshing) return null;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${refreshing ? 0 : distance - 60}px)`,
        transition: refreshing ? 'transform 0.2s' : 'none'
      }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
    >
      <div className="bg-[#141414] border border-gray-800 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
        {refreshing ? (
          <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
        ) : (
          <div
            style={{ transform: `rotate(${rotation}deg)` }}
            className="w-5 h-5 border-2 border-gray-600 border-t-[#7C3AED] rounded-full"
          />
        )}
        <span className="text-xs text-gray-400">{refreshing ? 'Refreshing...' : 'Pull to refresh'}</span>
      </div>
    </div>
  );
};
