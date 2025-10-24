import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const AccessibilityControls = () => {
  const { 
    isDark, 
    toggleTheme, 
    accessibilitySettings, 
    updateAccessibilitySetting, 
    resetAccessibilitySettings 
  } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const announceChange = (message) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 3000);
  };

  const handleToggle = (setting, value) => {
    updateAccessibilitySetting(setting, value);
    const settingNames = {
      colorblindFriendly: 'Colorblind-friendly mode',
      highContrast: 'High contrast mode',
      largeFont: 'Large font mode',
      keyboardNav: 'Keyboard navigation mode',
      reducedMotion: 'Reduced motion mode',
    };
    announceChange(`${settingNames[setting]} ${value ? 'enabled' : 'disabled'}`);
  };

  const accessibilityOptions = [
    {
      key: 'colorblindFriendly',
      label: 'Colorblind Friendly',
      description: 'Optimize colors for colorblind users',
      icon: '🎨',
    },
    {
      key: 'highContrast',
      label: 'High Contrast',
      description: 'Increase contrast for better visibility',
      icon: '🔍',
    },
    {
      key: 'largeFont',
      label: 'Large Font',
      description: 'Increase font size for better readability',
      icon: '🔤',
    },
    {
      key: 'keyboardNav',
      label: 'Keyboard Navigation',
      description: 'Enhanced keyboard navigation support',
      icon: '⌨️',
    },
    {
      key: 'reducedMotion',
      label: 'Reduced Motion',
      description: 'Minimize animations and transitions',
      icon: '🎬',
    },
  ];

  return (
    <>
      {/* ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Floating Controls Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-secondary rounded-full shadow-glow hover:shadow-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 z-50"
        aria-label="Open accessibility controls"
      >
        <div className="w-full h-full flex items-center justify-center text-white text-xl">
          ♿
        </div>
      </button>

      {/* Controls Panel */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-80 bg-neutral-card dark:bg-dark-card rounded-2xl shadow-card border border-neutral-bg3 dark:border-dark-bg3 z-50">
          {/* Header */}
          <div className="bg-gradient-secondary p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">♿</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Accessibility</h3>
                <p className="text-white/80 text-xs">Customize your experience</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close accessibility controls"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 bg-neutral-bg2 dark:bg-neutral-bg3 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{isDark ? '🌙' : '☀️'}</span>
                <div>
                  <div className="text-sm font-medium text-neutral-text dark:text-neutral-text">
                    Dark Mode
                  </div>
                  <div className="text-xs text-neutral-text2 dark:text-neutral-text2">
                    {isDark ? 'Currently enabled' : 'Currently disabled'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  toggleTheme();
                  announceChange(`Dark mode ${!isDark ? 'enabled' : 'disabled'}`);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue ${
                  isDark ? 'bg-gradient-primary' : 'bg-neutral-bg3 dark:bg-neutral-bg3'
                }`}
                aria-pressed={isDark}
                aria-label={`Toggle dark mode (currently ${isDark ? 'on' : 'off'})`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    isDark ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Accessibility Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-neutral-text dark:text-neutral-text">
                Accessibility Options
              </h4>
              {accessibilityOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center justify-between p-3 bg-neutral-bg2 dark:bg-neutral-bg3 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{option.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-neutral-text dark:text-neutral-text">
                        {option.label}
                      </div>
                      <div className="text-xs text-neutral-text2 dark:text-neutral-text2">
                        {option.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(option.key, !accessibilitySettings[option.key])}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue ${
                      accessibilitySettings[option.key] 
                        ? 'bg-gradient-primary' 
                        : 'bg-neutral-bg3 dark:bg-neutral-bg3'
                    }`}
                    aria-pressed={accessibilitySettings[option.key]}
                    aria-label={`Toggle ${option.label} (currently ${accessibilitySettings[option.key] ? 'on' : 'off'})`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        accessibilitySettings[option.key] ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                resetAccessibilitySettings();
                announceChange('All accessibility settings reset to default');
              }}
              className="w-full py-2 px-4 bg-neutral-bg3 dark:bg-neutral-bg3 text-neutral-text2 dark:text-neutral-text2 rounded-lg hover:bg-neutral-bg3 dark:hover:bg-neutral-bg3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              Reset to Defaults
            </button>

            {/* Keyboard Shortcuts Info */}
            <div className="p-3 bg-gradient-primary/10 rounded-lg border border-primary-blue/20">
              <h5 className="text-sm font-semibold text-neutral-text dark:text-neutral-text mb-2">
                Keyboard Shortcuts
              </h5>
              <div className="space-y-1 text-xs text-neutral-text2 dark:text-neutral-text2">
                <div><kbd className="px-1 py-0.5 bg-neutral-bg3 dark:bg-neutral-bg3 rounded text-xs">Tab</kbd> Navigate</div>
                <div><kbd className="px-1 py-0.5 bg-neutral-bg3 dark:bg-neutral-bg3 rounded text-xs">Enter</kbd> Activate</div>
                <div><kbd className="px-1 py-0.5 bg-neutral-bg3 dark:bg-neutral-bg3 rounded text-xs">Esc</kbd> Close</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default AccessibilityControls;
