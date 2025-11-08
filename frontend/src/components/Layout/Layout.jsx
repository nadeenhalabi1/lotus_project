import Header from './Header';
import { useTheme } from '../../context/ThemeContext';

const Layout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

