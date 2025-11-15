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
    <header className="bg-white dark:bg-neutral-900 shadow-sm fixed w-full top-0 z-fixed border-b border-neutral-200 dark:border-neutral-700 h-20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              {showLogo ? (
                <img 
                  src={logo} 
                  alt="Management Reporting Logo" 
                  className="h-20 w-auto"
                  onError={() => {
                    // If image fails to load, show fallback icon
                    setLogoError(true);
                  }}
                />
              ) : (
                <BarChart3 className="h-8 w-8 text-primary-700 dark:text-primary-400" />
              )}
              <span className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                Management reporting
              </span>
            </Link>
            
            <nav className="hidden md:flex gap-4">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-fast ${
                  isActive('/dashboard')
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/reports"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-fast ${
                  isActive('/reports')
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                Reports
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-fast"
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
