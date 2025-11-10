import { useState, useCallback } from 'react';
import { openaiAPI } from '../services/api';

export function useChartNarration() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  const narrateFromCanvas = useCallback(async (canvas, context) => {
    if (!canvas) {
      console.warn('Canvas is required for narration');
      return null;
    }

    setLoading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const res = await openaiAPI.describeChart(dataUrl, context);
      setText(res.data.text);
      return res.data.text;
    } catch (error) {
      console.error('Chart narration error:', error);
      setText('');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const narrateFromUrl = useCallback(async (imageUrl, context) => {
    if (!imageUrl) {
      console.warn('Image URL is required for narration');
      return null;
    }

    setLoading(true);
    try {
      const res = await openaiAPI.describeChart(imageUrl, context);
      setText(res.data.text);
      return res.data.text;
    } catch (error) {
      console.error('Chart narration error:', error);
      setText('');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearNarration = useCallback(() => {
    setText('');
  }, []);

  return { loading, text, narrateFromCanvas, narrateFromUrl, clearNarration };
}

