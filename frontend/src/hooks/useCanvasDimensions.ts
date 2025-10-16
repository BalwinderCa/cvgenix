'use client';

import { useState, useEffect, useCallback } from 'react';

interface CanvasDimensions {
  width: number;
  height: number;
  scale: number;
  containerWidth: number;
  containerHeight: number;
}

interface UseCanvasDimensionsOptions {
  maxWidth?: number;
  aspectRatio?: number; // width/height ratio
  padding?: number; // padding around canvas
  minHeight?: number;
}

export function useCanvasDimensions(options: UseCanvasDimensionsOptions = {}) {
  const {
    maxWidth = 750,
    aspectRatio = 0.8, // 4:5 ratio (800:1000)
    padding = 32,
    minHeight = 400
  } = options;

  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: maxWidth,
    height: Math.round(maxWidth / aspectRatio),
    scale: 1,
    containerWidth: maxWidth + padding * 2,
    containerHeight: Math.round(maxWidth / aspectRatio) + padding * 2
  });

  const calculateDimensions = useCallback(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate available width (accounting for sidebar and padding)
    const sidebarWidth = 384; // w-96 = 24rem = 384px
    const availableWidth = screenWidth - sidebarWidth - padding * 2;
    
    // Calculate available height (accounting for header, topbar, footer)
    const headerHeight = 64; // mt-16 = 4rem = 64px
    const topbarHeight = 60; // approximate
    const footerHeight = 48; // h-12 = 3rem = 48px
    const availableHeight = screenHeight - headerHeight - topbarHeight - footerHeight - padding * 2;
    
    // Calculate canvas width (respect maxWidth and available space)
    const canvasWidth = Math.min(maxWidth, availableWidth);
    
    // Calculate canvas height based on aspect ratio and available space
    const aspectHeight = Math.round(canvasWidth / aspectRatio);
    const canvasHeight = Math.max(
      minHeight,
      Math.min(aspectHeight, availableHeight)
    );
    
    // Calculate scale factor if we need to fit within screen
    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    const scale = Math.min(1, Math.min(scaleX, scaleY));
    
    // Apply scale if needed
    const finalWidth = Math.round(canvasWidth * scale);
    const finalHeight = Math.round(canvasHeight * scale);
    
    setDimensions({
      width: finalWidth,
      height: finalHeight,
      scale,
      containerWidth: finalWidth + padding * 2,
      containerHeight: finalHeight + padding * 2
    });
  }, [maxWidth, aspectRatio, padding, minHeight]);

  useEffect(() => {
    // Calculate initial dimensions
    calculateDimensions();

    // Add resize listener
    const handleResize = () => {
      calculateDimensions();
    };

    window.addEventListener('resize', handleResize);
    
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure screen dimensions are updated
      setTimeout(calculateDimensions, 100);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', calculateDimensions);
    };
  }, [calculateDimensions]);

  return {
    dimensions,
    recalculate: calculateDimensions
  };
}