import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TagInput = ({ tags = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPopularTags();
  }, []);

  useEffect(() => {
    if (inputValue.length > 1) {
      loadSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  const loadPopularTags = async () => {
    try {
      const response = await api.get('/api/seo/tags/popular');
      setPopularTags(response.data.slice(0, 10)); // Top 10 popular tags
    } catch (err) {
      console.error('Error loading popular tags:', err);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/seo/tags?search=${inputValue}&limit=5`);
      const allTags = response.data || [];
      
      // Filter out already selected tags
      const filteredSuggestions = allTags
        .filter(tag => !tags.includes(tag.name))
        .filter(tag => tag.name.toLowerCase().includes(inputValue.toLowerCase()));
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } catch (err) {
      console.error('Error loading tag suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tagName) => {
    if (tagName && !tags.includes(tagName)) {
      onChange([...tags, tagName]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion.name);
  };

  const handlePopularTagClick = (popularTag) => {
    addTag(popularTag.name);
  };

  return (
    <div className="tag-input-container">
      {/* Selected Tags Display */}
      {tags.length > 0 && (
        <div className="tags-display">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="tag-remove"
                title="Remove tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag Input */}
      <div className="relative">
        <input
          type="text"
          className="admin-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Type to add tags..."
        />

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div>
                  <strong>{suggestion.name}</strong>
                  <span className="text-gray-500 text-sm ml-2">
                    ({suggestion.count || 0} articles)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <div className="popular-tags">
          <h4>Popular Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {popularTags
              .filter(popularTag => !tags.includes(popularTag.name))
              .slice(0, 8)
              .map((popularTag, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePopularTagClick(popularTag)}
                  className="popular-tag"
                  title={`Used in ${popularTag.count || 0} articles`}
                >
                  {popularTag.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-500 mt-2">
        Press Enter to add a tag, or click on suggestions/popular tags. Backspace to remove the last tag.
      </div>
    </div>
  );
};

export default TagInput;