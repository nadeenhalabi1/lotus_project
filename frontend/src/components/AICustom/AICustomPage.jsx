import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const AICustomPage = () => {
  const { theme } = useTheme();
  const [userInput, setUserInput] = useState('');

  const handleGenerate = () => {
    // For now, just log the input (no API calls yet)
    console.log('Generate graph clicked with input:', userInput);
  };

  return (
    <div className="min-h-screen py-8">
      {/* Welcome Message */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          Welcome to AI custom insights
        </h1>
      </div>

      {/* Input Card */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="card">
          {/* Textarea */}
          <div className="mb-6">
            <label htmlFor="ai-custom-input" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Describe your data insight or custom graph
            </label>
            <textarea
              id="ai-custom-input"
              value={userInput}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setUserInput(e.target.value);
                }
              }}
              placeholder="Describe the data insight or custom graph you want..."
              className="w-full min-h-[150px] p-4 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
              maxLength={1000}
            />
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Describe the data insight or custom graph you want (up to 1000 characters).
            </p>
            <div className="text-right text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {userInput.length} / 1000 characters
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={!userInput.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate graph
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder for Future Graph */}
      <div className="max-w-6xl mx-auto">
        <div className="card border-2 border-dashed border-neutral-300 dark:border-neutral-600">
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
              Your custom AI-generated graph will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICustomPage;

