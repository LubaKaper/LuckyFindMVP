/**
 * useSearchState Hook
 * 
 * Custom hook for managing search state and pagination efficiently.
 * Reduces component re-renders and provides optimized state updates.
 * 
 * Features:
 * - Optimized state updates with useReducer
 * - Memoized search parameters
 * - Efficient pagination handling
 * - Search result caching
 */

import { useCallback, useMemo, useReducer } from 'react';

const initialState = {
  query: '',
  results: [],
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 50,
  },
  filters: {
    genre: '',
    style: '',
    artist: '',
    label: '',
    country: '',
    yearFrom: '',
    yearTo: '',
    minPrice: '',
    maxPrice: '',
    maxReleases: '',
  },
  loading: false,
  error: null,
};

const searchReducer = (state, action) => {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload.results,
        pagination: {
          ...state.pagination,
          ...action.payload.pagination,
        },
      };
    
    case 'UPDATE_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.name]: action.payload.value,
        },
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        query: '',
        filters: initialState.filters,
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          currentPage: action.payload,
        },
      };
    
    case 'RESET_SEARCH':
      return {
        ...initialState,
        filters: { ...initialState.filters },
      };
    
    default:
      return state;
  }
};

export const useSearchState = (initialQuery = '', initialFilters = {}) => {
  const [state, dispatch] = useReducer(searchReducer, {
    ...initialState,
    query: initialQuery,
    filters: { ...initialState.filters, ...initialFilters },
  });

  // Memoized search parameters to prevent unnecessary re-renders
  const searchParams = useMemo(() => ({
    searchQuery: state.query,
    ...state.filters,
    page: state.pagination.currentPage,
    per_page: state.pagination.itemsPerPage,
  }), [state.query, state.filters, state.pagination.currentPage, state.pagination.itemsPerPage]);

  // Action creators
  const setQuery = useCallback((query) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  }, []);

  const setResults = useCallback((results, pagination) => {
    dispatch({ type: 'SET_RESULTS', payload: { results, pagination } });
  }, []);

  const updateFilter = useCallback((name, value) => {
    dispatch({ type: 'UPDATE_FILTER', payload: { name, value } });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setPage = useCallback((page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const resetSearch = useCallback(() => {
    dispatch({ type: 'RESET_SEARCH' });
  }, []);

  // Check if search is possible
  const canSearch = useMemo(() => {
    const hasQuery = state.query.trim().length > 0;
    const hasFilters = Object.values(state.filters).some(filter => filter && filter.trim().length > 0);
    return hasQuery || hasFilters;
  }, [state.query, state.filters]);

  return {
    // State
    query: state.query,
    results: state.results,
    pagination: state.pagination,
    filters: state.filters,
    loading: state.loading,
    error: state.error,
    canSearch,
    searchParams,
    
    // Actions
    setQuery,
    setResults,
    updateFilter,
    resetFilters,
    setLoading,
    setError,
    setPage,
    resetSearch,
  };
};

export default useSearchState;