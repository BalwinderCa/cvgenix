'use client';

import { useCanvasDimensions } from '@/hooks/useCanvasDimensions';

interface CanvasDimensionsDebugProps {
  className?: string;
}

export function CanvasDimensionsDebug({ className = '' }: CanvasDimensionsDebugProps) {
  const { dimensions } = useCanvasDimensions({
    maxWidth: 750,
    aspectRatio: 0.8,
    padding: 32,
    minHeight: 400
  });

  return (
    <div className={`fixed top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono z-50 ${className}`}>
      <div className="space-y-1">
        <div>Screen: {typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : 'N/A'}</div>
        <div>Canvas: {dimensions.width}×{dimensions.height}</div>
        <div>Scale: {dimensions.scale.toFixed(2)}</div>
        <div>Container: {dimensions.containerWidth}×{dimensions.containerHeight}</div>
      </div>
    </div>
  );
}