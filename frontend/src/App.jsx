import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './hooks/useAuth.jsx';
import { ReportsProvider } from './hooks/useReports.jsx';
import { AIInsightsProvider } from './hooks/useAIInsights.jsx';
import { ThemeProvider } from './contexts/ThemeContext';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ChartsDashboardPage from './pages/ChartsDashboardPage';
import DataInsightsDashboard from './pages/DataInsightsDashboard';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';

import ErrorBoundary from './components/Common/ErrorBoundary';
import LoadingSpinner from './components/Common/LoadingSpinner';

import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ReportsProvider>
            <AIInsightsProvider>
              <Router>
                <div className="min-h-screen bg-neutral-bg dark:bg-dark-bg text-neutral-text dark:text-dark-text transition-colors duration-300">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/charts" element={<ChartsDashboardPage />} />
                    <Route path="/insights" element={<DataInsightsDashboard />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                        iconTheme: {
                          primary: '#10B981',
                          secondary: '#fff',
                        },
                      },
                      error: {
                        duration: 5000,
                        iconTheme: {
                          primary: '#EF4444',
                          secondary: '#fff',
                        },
                      },
                    }}
                  />
                </div>
              </Router>
            </AIInsightsProvider>
          </ReportsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
