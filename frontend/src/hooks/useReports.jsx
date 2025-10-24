import React, { createContext, useContext, useState } from 'react';

const ReportsContext = createContext();

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

export const ReportsProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateReport = async (reportData) => {
    setLoading(true);
    try {
      // Mock API call
      const newReport = {
        id: `report-${Date.now()}`,
        ...reportData,
        createdAt: new Date().toISOString(),
        status: 'generated'
      };
      
      setReports(prev => [...prev, newReport]);
      return newReport;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshReport = async (reportId) => {
    setLoading(true);
    try {
      // Mock API call
      const updatedReport = {
        id: reportId,
        lastRefreshed: new Date().toISOString(),
        status: 'refreshed'
      };
      
      setReports(prev => 
        prev.map(report => 
          report.id === reportId ? { ...report, ...updatedReport } : report
        )
      );
      return updatedReport;
    } catch (error) {
      console.error('Failed to refresh report:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    reports,
    loading,
    generateReport,
    refreshReport
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
};
