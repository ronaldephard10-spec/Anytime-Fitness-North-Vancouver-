import { useState, useEffect } from 'react';

export type TextSize = 'normal' | 'large' | 'xl';

const STORAGE_KEY = 'af_app_text_size';

export function useTextSize() {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as TextSize | null;
      if (saved && (saved === 'normal' || saved === 'large' || saved === 'xl')) {
        return saved;
      }
    } catch (e) {}
    return 'normal';
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-text-size', textSize);
      localStorage.setItem(STORAGE_KEY, textSize);
    } catch (e) {}
  }, [textSize]);

  const cycleTextSize = () => {
    setTextSizeState((prev) => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xl';
      return 'normal';
    });
  };

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
  };

  return {
    textSize,
    setTextSize,
    cycleTextSize,
  };
}
