import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { boxAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import BOXChartList from './BOXChartList';

const BOXSidebar = ({ isOpen, onClose, onChartClick }) => {
  const [charts, setCharts] = useState([]);
  const [filteredCharts, setFilteredCharts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        setLoading(true);
        const response = await boxAPI.getCharts();
        setCharts(response.data || []);
        setFilteredCharts(response.data || []);
      } catch (error) {
        console.error('Error fetching BOX charts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCharts();
    }
  }, [isOpen]);

  useEffect(() => {
    let filtered = charts;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(chart =>
        chart.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chart.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chart.dataSource?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(chart => chart.category === selectedCategory);
    }

    setFilteredCharts(filtered);
  }, [searchQuery, selectedCategory, charts]);

  const categories = ['all', ...new Set(charts.map(c => c.category).filter(Boolean))];

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-20 h-[calc(100vh-5rem)] w-80 bg-white dark:bg-neutral-800 shadow-lg z-40 flex flex-col">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">BOX</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-fast"
            aria-label="Close BOX"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search charts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-md text-sm transition-colors duration-fast ${
                selectedCategory === category
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <LoadingSpinner />
        ) : filteredCharts.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400 text-center">No charts found</p>
        ) : (
          <BOXChartList charts={filteredCharts} onChartClick={onChartClick} />
        )}
      </div>
    </div>
  );
};

export default BOXSidebar;

