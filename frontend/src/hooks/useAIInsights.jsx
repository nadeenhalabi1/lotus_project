import React, { createContext, useContext, useState } from 'react';

const AIInsightsContext = createContext();

export const useAIInsights = () => {
  const context = useContext(AIInsightsContext);
  if (!context) {
    throw new Error('useAIInsights must be used within an AIInsightsProvider');
  }
  return context;
};

export const AIInsightsProvider = ({ children }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeReport = async (reportData) => {
    setLoading(true);
    try {
      // Mock AI analysis
      const newInsight = {
        id: `insight-${Date.now()}`,
        reportId: reportData.id,
        insightType: 'trend',
        confidenceScore: 0.85 + Math.random() * 0.1,
        explanation: 'AI analysis detected significant patterns in the data',
        recommendation: 'Consider implementing the suggested improvements',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setInsights(prev => [...prev, newInsight]);
      return newInsight;
    } catch (error) {
      console.error('Failed to analyze report:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveInsight = async (insightId) => {
    setLoading(true);
    try {
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, status: 'approved', approvedAt: new Date().toISOString() }
            : insight
        )
      );
    } catch (error) {
      console.error('Failed to approve insight:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rejectInsight = async (insightId) => {
    setLoading(true);
    try {
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, status: 'rejected', rejectedAt: new Date().toISOString() }
            : insight
        )
      );
    } catch (error) {
      console.error('Failed to reject insight:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    insights,
    loading,
    analyzeReport,
    approveInsight,
    rejectInsight
  };

  return (
    <AIInsightsContext.Provider value={value}>
      {children}
    </AIInsightsContext.Provider>
  );
};
