'use client'

import { useState, useMemo } from 'react';
import type { FrameFinish, PosterSize, FrameOption } from '@/lib/types';
import { FRAME_OPTIONS, POSTER_SIZES } from '@/lib/constants';

export const useProductOptions = () => {
  const [quantity, setQuantity] = useState(1);
  const [showFrames, setShowFrames] = useState(false);
  const [selectedPosterSize, setSelectedPosterSize] = useState<PosterSize>('A4');
  const [selectedFinish, setSelectedFinish] = useState<FrameFinish>('Black');

  const posterSizes = POSTER_SIZES;
  const frameOptions = FRAME_OPTIONS;
  
  const availableFinishes = useMemo(() => 
    [...new Set(frameOptions.filter(f => f.size === selectedPosterSize).map(f => f.finish))]
  , [selectedPosterSize, frameOptions]);

  const selectedFrame: FrameOption | undefined = useMemo(() => 
    showFrames
      ? frameOptions.find(f => f.size === selectedPosterSize && f.finish === selectedFinish)
      : undefined
  , [showFrames, selectedPosterSize, selectedFinish, frameOptions]);

  const totalItemPrice = useMemo(() => {
    const posterPrice = posterSizes[selectedPosterSize]?.price || 0;
    const framePrice = selectedFrame?.price || 0;
    return posterPrice + framePrice;
  }, [selectedPosterSize, selectedFrame, posterSizes]);

  // Ensure selected finish is valid when size changes
  useState(() => {
    if (!availableFinishes.includes(selectedFinish)) {
      setSelectedFinish(availableFinishes[0]);
    }
  });

  return {
    quantity,
    setQuantity,
    showFrames,
    setShowFrames,
    selectedPosterSize,
    setSelectedPosterSize,
    selectedFinish,
    setSelectedFinish,
    availableFinishes,
    selectedFrame,
    totalItemPrice,
    posterSizes,
    frameOptions,
  };
};
