import { useState, useCallback } from 'react';
import { openaiAPI } from '../services/api';

export function useChartNarration() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  // Legacy method - uses old endpoint without caching
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

  // Legacy method - uses old endpoint without caching
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

  // Optimized method with Supabase caching
  const transcribeChart = useCallback(async (chartId, image, topic, chartData, force = false) => {
    if (!chartId) {
      console.warn('chartId is required for transcription');
      return null;
    }

    if (!image) {
      console.warn('Image is required for transcription');
      return null;
    }

    setLoading(true);
    try {
      const res = await openaiAPI.transcribeChart(chartId, image, topic, chartData, force);
      const transcriptionText = res.data.text;
      setText(transcriptionText);
      
      // Log cache hit/miss for debugging
      if (res.data.source === 'cache') {
        console.log(`✅ Chart ${chartId} transcription from cache`);
      } else {
        console.log(`🔄 Chart ${chartId} transcription from OpenAI (saved to cache)`);
      }
      
      return transcriptionText;
    } catch (error) {
      console.error('Chart transcription error:', error);
      setText('');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized method for canvas with caching
  const transcribeFromCanvas = useCallback(async (chartId, canvas, topic, chartData, force = false) => {
    if (!canvas) {
      console.warn('Canvas is required for transcription');
      return null;
    }

    const dataUrl = canvas.toDataURL('image/png');
    return transcribeChart(chartId, dataUrl, topic, chartData, force);
  }, [transcribeChart]);

  // Optimized method for URL with caching
  const transcribeFromUrl = useCallback(async (chartId, imageUrl, topic, chartData, force = false) => {
    if (!imageUrl) {
      console.warn('Image URL is required for transcription');
      return null;
    }

    return transcribeChart(chartId, imageUrl, topic, chartData, force);
  }, [transcribeChart]);

  const clearNarration = useCallback(() => {
    setText('');
  }, []);

  return { 
    loading, 
    text, 
    // Legacy methods (no caching)
    narrateFromCanvas, 
    narrateFromUrl,
    // Optimized methods (with Supabase caching)
    transcribeChart,
    transcribeFromCanvas,
    transcribeFromUrl,
    clearNarration 
  };
}

