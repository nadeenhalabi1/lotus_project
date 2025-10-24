import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../Common/Logo';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Reports', href: '/reports' },
    { name: 'Insights', href: '/insights' },
  ];

  return (
    <>
      {/* Skip Link */}
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header className="sticky top-0 backdrop-blur-xl bg-white/90 dark:bg-dark-bg/90 border-b border-black/10 dark:border-white/10 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center space-x-3">
                <Logo className="w-8 h-8" />
                <span className="text-gradient font-display font-bold text-xl">
                  educoreAI
                </span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="relative px-3 py-2 text-sm font-medium text-neutral-text2 hover:text-neutral-text transition-colors duration-200 group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-2 rounded-lg bg-neutral-bg2 dark:bg-neutral-bg3 hover:bg-neutral-bg3 dark:hover:bg-neutral-bg2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                aria-pressed={isDark}
              >
                <div className="w-5 h-5 relative">
                  {/* Sun Icon */}
                  <svg
                    className={`absolute inset-0 w-5 h-5 transition-opacity duration-300 ${
                      isDark ? 'opacity-0' : 'opacity-100'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  {/* Moon Icon */}
                  <svg
                    className={`absolute inset-0 w-5 h-5 transition-opacity duration-300 ${
                      isDark ? 'opacity-100' : 'opacity-0'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </div>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">U</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-neutral-text">John Doe</p>
                  <p className="text-xs text-neutral-muted">Administrator</p>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-neutral-bg2 dark:bg-neutral-bg3 hover:bg-neutral-bg3 dark:hover:bg-neutral-bg2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                aria-label="Toggle navigation menu"
                aria-expanded={isMenuOpen}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-black/10 dark:border-white/10">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-base font-medium text-neutral-text2 hover:text-neutral-text hover:bg-neutral-bg2 dark:hover:bg-neutral-bg3 rounded-md transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
