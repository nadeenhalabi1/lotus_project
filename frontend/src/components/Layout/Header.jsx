import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, BarChart3 } from 'lucide-react';
import { useState } from 'react';

// Import logos
import logoLight from '../../assets/images/logo-light.jpg';
import logoDark from '../../assets/images/logo-dark.jpg';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [logoError, setLogoError] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  // Select logo based on theme
  const logo = theme === 'dark' ? logoDark : logoLight;
  const showLogo = logo && !logoError;

  return (
    <header className="bg-gray-50 dark:bg-gray-900 shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              {showLogo ? (
                <img 
                  src={logo} 
                  alt="Management Reporting Logo" 
                  className="h-12 w-auto"
                  onError={() => {
                    // If image fails to load, show fallback icon
                    setLogoError(true);
                  }}
                />
              ) : (
                <BarChart3 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              )}
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Management reporting
              </span>
            </Link>
            
            <nav className="hidden md:flex space-x-4">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/reports"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/reports')
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Reports
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
