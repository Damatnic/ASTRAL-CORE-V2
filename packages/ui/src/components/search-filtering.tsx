'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Badge, Input } from './base';
import { ScreenReaderOnly, LiveRegion } from './accessibility';
import { designTokens } from '../design-system';

// Search Types
interface SearchFilters {
  query: string;
  category: string[];
  priority: string[];
  status: string[];
  location: string;
  dateRange: {
    start?: Date;
    end?: Date;
  };
  availability: string[];
  skills: string[];
  languages: string[];
  rating: {
    min: number;
    max: number;
  };
  isEmergency?: boolean;
  isVerified?: boolean;
}

interface SearchResult {
  id: string;
  type: 'crisis' | 'volunteer' | 'resource' | 'client';
  title: string;
  description: string;
  category: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: string;
  location?: string;
  skills?: string[];
  languages?: string[];
  rating?: number;
  availability?: string;
  isEmergency?: boolean;
  isVerified?: boolean;
  lastUpdated: Date;
  metadata: Record<string, any>;
}

interface FilterOption {
  key: string;
  label: string;
  count?: number;
  color?: string;
}

// Advanced Search Component
interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onFiltersChange,
  initialFilters = {},
  className = ''
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: [],
    priority: [],
    status: [],
    location: '',
    dateRange: {},
    availability: [],
    skills: [],
    languages: [],
    rating: { min: 0, max: 5 },
    ...initialFilters
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Filter Options
  const categoryOptions: FilterOption[] = [
    { key: 'mental_health', label: 'Mental Health', color: 'bg-blue-100 text-blue-800' },
    { key: 'domestic_violence', label: 'Domestic Violence', color: 'bg-red-100 text-red-800' },
    { key: 'substance_abuse', label: 'Substance Abuse', color: 'bg-purple-100 text-purple-800' },
    { key: 'crisis_counseling', label: 'Crisis Counseling', color: 'bg-green-100 text-green-800' },
    { key: 'emergency_response', label: 'Emergency Response', color: 'bg-orange-100 text-orange-800' },
    { key: 'financial_aid', label: 'Financial Aid', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'legal_help', label: 'Legal Help', color: 'bg-indigo-100 text-indigo-800' },
    { key: 'housing', label: 'Housing', color: 'bg-pink-100 text-pink-800' }
  ];

  const priorityOptions: FilterOption[] = [
    { key: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
    { key: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { key: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'low', label: 'Low', color: 'bg-green-100 text-green-800' }
  ];

  const statusOptions: FilterOption[] = [
    { key: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { key: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
    { key: 'escalated', label: 'Escalated', color: 'bg-red-100 text-red-800' }
  ];

  const availabilityOptions: FilterOption[] = [
    { key: '24/7', label: '24/7 Available', color: 'bg-green-100 text-green-800' },
    { key: 'business_hours', label: 'Business Hours', color: 'bg-blue-100 text-blue-800' },
    { key: 'weekends', label: 'Weekends', color: 'bg-purple-100 text-purple-800' },
    { key: 'evenings', label: 'Evenings', color: 'bg-indigo-100 text-indigo-800' }
  ];

  const skillOptions: FilterOption[] = [
    { key: 'crisis_intervention', label: 'Crisis Intervention' },
    { key: 'active_listening', label: 'Active Listening' },
    { key: 'de_escalation', label: 'De-escalation' },
    { key: 'trauma_informed', label: 'Trauma-Informed Care' },
    { key: 'suicide_prevention', label: 'Suicide Prevention' },
    { key: 'cultural_competency', label: 'Cultural Competency' },
    { key: 'youth_counseling', label: 'Youth Counseling' },
    { key: 'family_therapy', label: 'Family Therapy' }
  ];

  const languageOptions: FilterOption[] = [
    { key: 'english', label: 'English' },
    { key: 'spanish', label: 'Spanish' },
    { key: 'french', label: 'French' },
    { key: 'mandarin', label: 'Mandarin' },
    { key: 'arabic', label: 'Arabic' },
    { key: 'russian', label: 'Russian' },
    { key: 'portuguese', label: 'Portuguese' },
    { key: 'german', label: 'German' }
  ];

  // Handle filter changes
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  }, [filters, onFiltersChange]);

  const toggleArrayFilter = useCallback((filterKey: keyof SearchFilters, value: string) => {
    const currentArray = filters[filterKey] as string[];
    const updated = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [filterKey]: updated });
  }, [filters, updateFilters]);

  const handleSearch = useCallback(() => {
    onSearch(filters);
    
    // Add to recent searches
    if (filters.query && !recentSearches.includes(filters.query)) {
      setRecentSearches(prev => [filters.query, ...prev.slice(0, 4)]);
    }
  }, [filters, onSearch, recentSearches]);

  const clearFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      query: '',
      category: [],
      priority: [],
      status: [],
      location: '',
      dateRange: {},
      availability: [],
      skills: [],
      languages: [],
      rating: { min: 0, max: 5 }
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  const getActiveFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    count += filters.category.length;
    count += filters.priority.length;
    count += filters.status.length;
    if (filters.location) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    count += filters.availability.length;
    count += filters.skills.length;
    count += filters.languages.length;
    if (filters.rating.min > 0 || filters.rating.max < 5) count++;
    if (filters.isEmergency !== undefined) count++;
    if (filters.isVerified !== undefined) count++;
    return count;
  }, [filters]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
      }
      if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
        handleSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSearch]);

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Main Search Bar */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search crises, volunteers, resources... (Ctrl+K)"
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
              data-search-input
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <Button 
            onClick={handleSearch}
            className="bg-blue-600 text-white hover:bg-blue-700 px-6"
          >
            Search
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <span>Filters</span>
            {getActiveFilterCount > 0 && (
              <Badge variant="default" className="ml-1 bg-blue-600 text-white">
                {getActiveFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !isExpanded && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilters({ query: search })}
                  className="text-xs bg-gray-100 hover:bg-gray-200"
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="border-t pt-6 space-y-6">
            {/* Category Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={filters.category.includes(option.key) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('category', option.key)}
                    className={filters.category.includes(option.key) ? option.color : ''}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Priority Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Priority</h3>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={filters.priority.includes(option.key) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('priority', option.key)}
                    className={filters.priority.includes(option.key) ? option.color : ''}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={filters.status.includes(option.key) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('status', option.key)}
                    className={filters.status.includes(option.key) ? option.color : ''}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location and Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
                <Input
                  type="text"
                  placeholder="City, State, or ZIP code"
                  value={filters.location}
                  onChange={(e) => updateFilters({ location: e.target.value })}
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Date Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilters({
                      dateRange: { 
                        ...filters.dateRange, 
                        start: e.target.value ? new Date(e.target.value) : undefined 
                      }
                    })}
                  />
                  <Input
                    type="date"
                    value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilters({
                      dateRange: { 
                        ...filters.dateRange, 
                        end: e.target.value ? new Date(e.target.value) : undefined 
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Availability Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
              <div className="flex flex-wrap gap-2">
                {availabilityOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={filters.availability.includes(option.key) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('availability', option.key)}
                    className={filters.availability.includes(option.key) ? option.color : ''}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Skills Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={filters.skills.includes(option.key) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('skills', option.key)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Language Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={filters.languages.includes(option.key) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('languages', option.key)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Rating Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Rating Range</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Min:</label>
                  <select
                    value={filters.rating.min}
                    onChange={(e) => updateFilters({
                      rating: { ...filters.rating, min: parseInt(e.target.value) }
                    })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {[0, 1, 2, 3, 4].map(value => (
                      <option key={value} value={value}>{value}+ stars</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Max:</label>
                  <select
                    value={filters.rating.max}
                    onChange={(e) => updateFilters({
                      rating: { ...filters.rating, max: parseInt(e.target.value) }
                    })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {[1, 2, 3, 4, 5].map(value => (
                      <option key={value} value={value}>{value} stars</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Special Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Special Filters</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.isEmergency || false}
                    onChange={(e) => updateFilters({ 
                      isEmergency: e.target.checked ? true : undefined 
                    })}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Emergency resources only</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.isVerified || false}
                    onChange={(e) => updateFilters({ 
                      isVerified: e.target.checked ? true : undefined 
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Verified resources only</span>
                </label>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                {getActiveFilterCount > 0 && `${getActiveFilterCount} active filters`}
              </div>
              <div className="space-x-3">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button 
                  onClick={handleSearch}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Search Results Component
interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  onResultSelect: (result: SearchResult) => void;
  onResultAction: (result: SearchResult, action: string) => void;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  onResultSelect,
  onResultAction,
  className = ''
}) => {
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'rating' | 'priority'>('relevance');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'crisis':
        return (
          <div className="p-2 bg-red-100 rounded-full">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'volunteer':
        return (
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'resource':
        return (
          <div className="p-2 bg-green-100 rounded-full">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return sorted.sort((a, b) => 
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        );
      default:
        return sorted; // Relevance order from search engine
    }
  }, [results, sortBy]);

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results ({results.length})
            </h2>
            <LiveRegion message={`Found ${results.length} results`} />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="rating">Rating</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none border-l"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {results.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 text-lg mb-2">No results found</p>
            <p className="text-gray-400">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {sortedResults.map((result) => (
              <div
                key={result.id}
                className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  result.isEmergency ? 'border-red-300 bg-red-50' : ''
                }`}
                onClick={() => onResultSelect(result)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onResultSelect(result);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  {getTypeIcon(result.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{result.title}</h3>
                          {result.isEmergency && (
                            <Badge variant="destructive" className="text-xs">
                              Emergency
                            </Badge>
                          )}
                          {result.isVerified && (
                            <Badge variant="success" className="text-xs bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {result.description}
                        </p>
                      </div>
                      
                      {result.rating && (
                        <div className="flex items-center ml-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < result.rating! ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="capitalize">
                          {result.type}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {result.category}
                        </Badge>
                        {result.priority && (
                          <Badge variant="secondary" className={getPriorityColor(result.priority)}>
                            {result.priority}
                          </Badge>
                        )}
                        {result.location && (
                          <span>📍 {result.location}</span>
                        )}
                      </div>
                      <span>{new Date(result.lastUpdated).toLocaleDateString()}</span>
                    </div>

                    {/* Skills/Languages */}
                    {(result.skills || result.languages) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {result.skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill.replace('_', ' ')}
                          </Badge>
                        ))}
                        {result.languages?.slice(0, 3).map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-3 flex space-x-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onResultAction(result, 'view');
                        }}
                      >
                        View Details
                      </Button>
                      {result.type === 'volunteer' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResultAction(result, 'assign');
                          }}
                        >
                          Assign
                        </Button>
                      )}
                      {result.type === 'resource' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResultAction(result, 'contact');
                          }}
                        >
                          Contact
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdvancedSearch;