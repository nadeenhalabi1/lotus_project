import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Logo = ({ className = "w-16 h-16" }) => {
  const { isDark } = useTheme();

  return (
    <div className={`${className} relative`}>
      <img
        src={isDark ? '/logo-dark.jpg' : '/logo-light.jpg'}
        alt="educoreAI Logo"
        className="w-full h-full object-contain"
        onError={(e) => {
          console.error('Failed to load logo:', e);
          // Fallback to a simple text logo if image fails
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback text logo */}
      <div
        className="w-full h-full flex items-center justify-center bg-primary-blue dark:bg-primary-purple rounded-lg text-white font-bold text-lg"
        style={{ display: 'none' }}
      >
        E
      </div>
    </div>
  );
};

export default Logo;
