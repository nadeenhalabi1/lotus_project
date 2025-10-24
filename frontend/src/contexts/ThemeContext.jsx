import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    colorblindFriendly: false,
    highContrast: false,
    largeFont: false,
    keyboardNav: false,
    reducedMotion: false,
  });

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedAccessibility = localStorage.getItem('accessibilitySettings');
    
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      // Check system preference
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    if (savedAccessibility) {
      try {
        setAccessibilitySettings(JSON.parse(savedAccessibility));
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error);
      }
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAccessibilitySettings(prev => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // Apply theme to HTML element
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  // Apply accessibility settings to body
  useEffect(() => {
    const body = document.body;
    const classes = [];
    
    if (accessibilitySettings.colorblindFriendly) classes.push('colorblind-friendly');
    if (accessibilitySettings.highContrast) classes.push('high-contrast');
    if (accessibilitySettings.largeFont) classes.push('large-font');
    if (accessibilitySettings.keyboardNav) classes.push('keyboard-nav');
    if (accessibilitySettings.reducedMotion) classes.push('motion-reduce');

    // Remove old classes
    body.className = body.className.replace(/colorblind-friendly|high-contrast|large-font|keyboard-nav|motion-reduce/g, '').trim();
    
    // Add new classes
    if (classes.length > 0) {
      body.classList.add(...classes);
    }
  }, [accessibilitySettings]);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Save accessibility settings to localStorage
  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(accessibilitySettings));
  }, [accessibilitySettings]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const updateAccessibilitySetting = (setting, value) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const resetAccessibilitySettings = () => {
    setAccessibilitySettings({
      colorblindFriendly: false,
      highContrast: false,
      largeFont: false,
      keyboardNav: false,
      reducedMotion: false,
    });
  };

  const value = {
    isDark,
    toggleTheme,
    accessibilitySettings,
    updateAccessibilitySetting,
    resetAccessibilitySettings,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
