import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

const TagInput = ({ value = [], onChange, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularTags, setPopularTags] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchPopularTags();
  }, []);

  const fetchPopularTags = async () => {
    try {
      const response = await api.get('/seo/tags/popular?limit=10');
      setPopularTags(response.data.popular_tags || []);
    } catch (error) {
      console.error('Failed to fetch popular tags:', error);
    }
  };

  const fetchTagSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await api.get('/seo/tags');
      const allTags = response.data.tags || [];
      const filtered = allTags
        .filter(tag => 
          tag.tag.toLowerCase().includes(query.toLowerCase()) &&
          !value.includes(tag.tag)
        )
        .slice(0, 8);
      setSuggestions(filtered);
    } catch (error) {
      console.error('Failed to fetch tag suggestions:', error);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.trim()) {
      fetchTagSuggestions(newValue);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = (tag) => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (index) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const selectSuggestion = (tag) => {
    addTag(tag.tag);
    inputRef.current?.focus();
  };

  const addPopularTag = (tag) => {
    addTag(tag.tag);
  };

  return (
    <div className="relative">
      {/* Tag Display */}
      <div className="min-h-[42px] p-2 border border-gray-300 rounded-md bg-white flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 outline-none border-none text-sm min-w-[120px]"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((tag, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectSuggestion(tag)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 flex justify-between items-center"
            >
              <span>{tag.tag}</span>
              <span className="text-sm text-gray-500">({tag.count} articles)</span>
            </button>
          ))}
        </div>
      )}

      {/* Popular Tags */}
      {!showSuggestions && popularTags.length > 0 && (
        <div className="mt-2">
          <div className="text-sm text-gray-600 mb-2">Popular tags:</div>
          <div className="flex flex-wrap gap-2">
            {popularTags.slice(0, 6).map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addPopularTag(tag)}
                disabled={value.includes(tag.tag)}
                className={`px-2 py-1 rounded-full text-xs border ${
                  value.includes(tag.tag)
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 cursor-pointer'
                }`}
              >
                {tag.tag} ({tag.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 mt-1">
        Press Enter or comma to add tags. Use popular tags or type your own.
      </div>
    </div>
  );
};

export default TagInput;