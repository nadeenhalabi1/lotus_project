import { useState, useCallback } from 'react';
import { chartTranscriptionAPI } from '../services/api';

export function useChartNarration() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  /**
   * Render flow: Get transcription from DB only (no OpenAI call)
   * Use this for displaying transcriptions on screen
   */
  const getTranscription = useCallback(async (chartId) => {
    if (!chartId) {
      console.warn('chartId is required');
      return null;
    }

    setLoading(true);
    try {
      console.log(`[useChartNarration] Fetching transcription from DB for ${chartId}...`);
      const res = await chartTranscriptionAPI.getTranscription(chartId);
      const transcriptionText = res.data.data?.text || null;
      
      // Always update text with what's in DB (even if null)
      setText(transcriptionText || '');
      
      console.log(`[useChartNarration] Transcription from DB for ${chartId}:`, transcriptionText ? `${transcriptionText.substring(0, 50)}...` : 'None');
      return transcriptionText;
    } catch (error) {
      if (error.response?.status === 404) {
        // No transcription found - this is OK, clear text
        console.log(`[useChartNarration] No transcription found in DB for ${chartId}`);
        setText('');
        return null;
      }
      console.error(`[useChartNarration] Error fetching transcription for ${chartId}:`, error);
      setText('');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Startup fill: Batch process all charts (runs OpenAI only if needed)
   * @param {Array} charts - Array of { chartId, topic?, chartData, imageUrl }
   */
  const startupFill = useCallback(async (charts) => {
    if (!Array.isArray(charts) || charts.length === 0) {
      console.warn('charts array is required');
      return null;
    }

    setLoading(true);
    try {
      const res = await chartTranscriptionAPI.startupFill(charts);
      console.log(`✅ Startup fill completed: ${res.data.results.length} charts processed`);
      return res.data.results;
    } catch (error) {
      console.error('Startup fill error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh flow: Always runs OpenAI and overwrites DB
   * @param {string} chartId - Chart identifier
   * @param {string} imageUrl - Chart image URL or data URL
   * @param {string} topic - Optional context
   * @param {any} chartData - Chart data/configuration
   */
  const refreshTranscription = useCallback(async (chartId, imageUrl, topic, chartData) => {
    if (!chartId || !imageUrl) {
      console.warn('chartId and imageUrl are required');
      return null;
    }

    setLoading(true);
    try {
      const res = await chartTranscriptionAPI.refreshTranscription(chartId, imageUrl, topic, chartData);
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
    getTranscription,           // Render: Read from DB only
    startupFill,                // Startup: Batch fill all charts
    refreshTranscription,       // Refresh/Morning: always overwrite
    refreshFromCanvas,          // Helper for canvas
    clearNarration 
  };
}

