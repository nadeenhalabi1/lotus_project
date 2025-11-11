import { useState, useCallback } from 'react';
import { chartTranscriptionAPI } from '../services/api';

export function useChartNarration() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  /**
   * DB-first: Get transcription from DB only (no OpenAI call)
   * Use this for displaying transcriptions on screen
   */
  const getTranscription = useCallback(async (chartId) => {
    if (!chartId) {
      console.warn('chartId is required');
      return null;
    }

    setLoading(true);
    try {
      const res = await chartTranscriptionAPI.getTranscription(chartId);
      const transcriptionText = res.data.data?.text || null;
      setText(transcriptionText || '');
      return transcriptionText;
    } catch (error) {
      if (error.response?.status === 404) {
        // No transcription found - this is OK
        setText('');
        return null;
      }
      console.error('Get transcription error:', error);
      setText('');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * DB-first: Ensure transcription exists (startup flow)
   * Only runs OpenAI if missing or signature changed/expired
   */
  const ensureTranscription = useCallback(async (chartId, image, topic, chartData) => {
    if (!chartId || !image) {
      console.warn('chartId and image are required');
      return null;
    }

    setLoading(true);
    try {
      const res = await chartTranscriptionAPI.ensureTranscription(chartId, image, topic, chartData);
      const transcriptionText = res.data.text;
      setText(transcriptionText);
      
      // Log source for debugging
      if (res.data.source === 'db') {
        console.log(`✅ Chart ${chartId} transcription from DB (unchanged)`);
      } else {
        console.log(`🔄 Chart ${chartId} transcription from OpenAI (saved to DB)`);
      }
      
      return transcriptionText;
    } catch (error) {
      console.error('Ensure transcription error:', error);
      setText('');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * DB-first: Refresh transcription (refresh/morning flow)
   * Always runs OpenAI and overwrites DB
   */
  const refreshTranscription = useCallback(async (chartId, image, topic, chartData) => {
    if (!chartId || !image) {
      console.warn('chartId and image are required');
      return null;
    }

    setLoading(true);
    try {
      const res = await chartTranscriptionAPI.refreshTranscription(chartId, image, topic, chartData);
      const transcriptionText = res.data.text;
      setText(transcriptionText);
      
      console.log(`🔄 Chart ${chartId} transcription refreshed from OpenAI (overwritten in DB)`);
      
      return transcriptionText;
    } catch (error) {
      console.error('Refresh transcription error:', error);
      setText('');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Helper: Ensure from canvas
   */
  const ensureFromCanvas = useCallback(async (chartId, canvas, topic, chartData) => {
    if (!canvas) {
      console.warn('Canvas is required');
      return null;
    }
    const dataUrl = canvas.toDataURL('image/png');
    return ensureTranscription(chartId, dataUrl, topic, chartData);
  }, [ensureTranscription]);

  /**
   * Helper: Refresh from canvas
   */
  const refreshFromCanvas = useCallback(async (chartId, canvas, topic, chartData) => {
    if (!canvas) {
      console.warn('Canvas is required');
      return null;
    }
    const dataUrl = canvas.toDataURL('image/png');
    return refreshTranscription(chartId, dataUrl, topic, chartData);
  }, [refreshTranscription]);

  const clearNarration = useCallback(() => {
    setText('');
  }, []);

  return { 
    loading, 
    text, 
    // DB-first methods
    getTranscription,           // Read from DB only
    ensureTranscription,         // Startup: only if needed
    refreshTranscription,       // Refresh/Morning: always overwrite
    ensureFromCanvas,           // Helper for canvas
    refreshFromCanvas,          // Helper for canvas
    clearNarration 
  };
}

