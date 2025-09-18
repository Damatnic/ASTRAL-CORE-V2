/**
 * Database-backed Data Persistence Context
 * Provides centralized data management with offline support
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { DatabasePersistence, SyncStatus, getDatabasePersistence } from '@/lib/database-persistence';
import { MoodEntry, UserProfile } from '@/lib/data-persistence';

// State interface
interface DataPersistenceState {
  moodEntries: MoodEntry[];
  userProfile: UserProfile | null;
  safetyPlans: any[];
  gamificationData: any;
  syncStatus: SyncStatus;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Action types
type DataPersistenceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MOOD_ENTRIES'; payload: MoodEntry[] }
  | { type: 'ADD_MOOD_ENTRY'; payload: MoodEntry }
  | { type: 'UPDATE_MOOD_ENTRY'; payload: { id: string; updates: Partial<MoodEntry> } }
  | { type: 'REMOVE_MOOD_ENTRY'; payload: string }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_SYNC_STATUS'; payload: SyncStatus }
  | { type: 'SET_LAST_UPDATED'; payload: Date };

// Context interface
interface DataPersistenceContextType {
  state: DataPersistenceState;
  actions: {
    // Mood entries
    loadMoodEntries: (options?: { startDate?: Date; endDate?: Date; limit?: number }) => Promise<MoodEntry[]>;
    saveMoodEntry: (entry: MoodEntry) => Promise<boolean>;
    updateMoodEntry: (id: string, updates: Partial<MoodEntry>) => Promise<boolean>;
    deleteMoodEntry: (id: string) => Promise<boolean>;
    
    // User profile
    loadUserProfile: () => Promise<UserProfile | null>;
    saveUserProfile: (profile: UserProfile) => Promise<boolean>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
    
    // Sync management
    forceSync: () => Promise<boolean>;
    getSyncStatus: () => SyncStatus;
    clearCache: () => void;
    
    // Migration utilities
    migrateFromLocalStorage: () => Promise<boolean>;
  };
  persistence: DatabasePersistence;
}

// Initial state
const initialState: DataPersistenceState = {
  moodEntries: [],
  userProfile: null,
  safetyPlans: [],
  gamificationData: null,
  syncStatus: {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSync: null,
    pendingChanges: 0,
    syncInProgress: false,
  },
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Reducer
function dataPersistenceReducer(state: DataPersistenceState, action: DataPersistenceAction): DataPersistenceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_MOOD_ENTRIES':
      return { 
        ...state, 
        moodEntries: action.payload,
        lastUpdated: new Date(),
      };
    
    case 'ADD_MOOD_ENTRY':
      return {
        ...state,
        moodEntries: [action.payload, ...state.moodEntries],
        lastUpdated: new Date(),
      };
    
    case 'UPDATE_MOOD_ENTRY':
      return {
        ...state,
        moodEntries: state.moodEntries.map(entry =>
          entry.id === action.payload.id 
            ? { ...entry, ...action.payload.updates }
            : entry
        ),
        lastUpdated: new Date(),
      };
    
    case 'REMOVE_MOOD_ENTRY':
      return {
        ...state,
        moodEntries: state.moodEntries.filter(entry => entry.id !== action.payload),
        lastUpdated: new Date(),
      };
    
    case 'SET_USER_PROFILE':
      return { 
        ...state, 
        userProfile: action.payload,
        lastUpdated: new Date(),
      };
    
    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        userProfile: state.userProfile 
          ? { ...state.userProfile, ...action.payload }
          : null,
        lastUpdated: new Date(),
      };
    
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
    
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload };
    
    default:
      return state;
  }
}

// Create context
const DataPersistenceContext = createContext<DataPersistenceContextType | undefined>(undefined);

// Provider component
interface DataPersistenceProviderProps {
  children: React.ReactNode;
  config?: {
    enableOfflineMode?: boolean;
    syncInterval?: number;
    retryAttempts?: number;
  };
}

export function DataPersistenceProvider({ children, config = {} }: DataPersistenceProviderProps) {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(dataPersistenceReducer, initialState);
  
  // Initialize persistence instance
  const persistence = React.useMemo(() => {
    return getDatabasePersistence(config);
  }, [config]);

  // Set up sync status listener
  useEffect(() => {
    const handleStatusChange = (syncStatus: SyncStatus) => {
      dispatch({ type: 'SET_SYNC_STATUS', payload: syncStatus });
    };

    persistence.on('statusChange', handleStatusChange);
    
    // Set initial sync status
    dispatch({ type: 'SET_SYNC_STATUS', payload: persistence.getSyncStatus() });

    return () => {
      // Clean up listeners would go here if persistence supported removal
    };
  }, [persistence]);

  // Initialize data when session is available
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user?.id) {
      initializeUserData();
    }
  }, [session, status]);

  const initializeUserData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Load initial data
      const moodEntries = await persistence.loadMoodEntries({ limit: 100 });
      
      dispatch({ type: 'SET_MOOD_ENTRIES', payload: moodEntries });
      
      // Would implement user profile loading later
      const userProfile = null;
      if (userProfile) {
        dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
      }
      
    } catch (error) {
      console.error('Failed to initialize user data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Actions object
  const actions = {
    // Mood entries
    loadMoodEntries: useCallback(async (options = {}) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      try {
        const entries = await persistence.loadMoodEntries(options);
        dispatch({ type: 'SET_MOOD_ENTRIES', payload: entries });
        return entries;
      } catch (error) {
        console.error('Failed to load mood entries:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load mood entries' });
        return [];
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [persistence]),

    saveMoodEntry: useCallback(async (entry: MoodEntry) => {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      try {
        const success = await persistence.saveMoodEntry(entry);
        if (success) {
          dispatch({ type: 'ADD_MOOD_ENTRY', payload: entry });
        }
        return success;
      } catch (error) {
        console.error('Failed to save mood entry:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save mood entry' });
        return false;
      }
    }, [persistence]),

    updateMoodEntry: useCallback(async (id: string, updates: Partial<MoodEntry>) => {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      try {
        const success = await persistence.updateMoodEntry(id, updates);
        if (success) {
          dispatch({ type: 'UPDATE_MOOD_ENTRY', payload: { id, updates } });
        }
        return success;
      } catch (error) {
        console.error('Failed to update mood entry:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update mood entry' });
        return false;
      }
    }, [persistence]),

    deleteMoodEntry: useCallback(async (id: string) => {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      try {
        const success = await persistence.deleteMoodEntry(id);
        if (success) {
          dispatch({ type: 'REMOVE_MOOD_ENTRY', payload: id });
        }
        return success;
      } catch (error) {
        console.error('Failed to delete mood entry:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete mood entry' });
        return false;
      }
    }, [persistence]),

    // User profile (placeholder implementations)
    loadUserProfile: useCallback(async () => {
      // TODO: Implement user profile loading
      return null;
    }, []),

    saveUserProfile: useCallback(async (profile: UserProfile) => {
      // TODO: Implement user profile saving
      return true;
    }, []),

    updateUserProfile: useCallback(async (updates: Partial<UserProfile>) => {
      // TODO: Implement user profile updating
      return true;
    }, []),

    // Sync management
    forceSync: useCallback(async () => {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      try {
        const success = await persistence.forceSync();
        if (!success) {
          dispatch({ type: 'SET_ERROR', payload: 'Sync failed' });
        }
        return success;
      } catch (error) {
        console.error('Force sync failed:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Sync failed' });
        return false;
      }
    }, [persistence]),

    getSyncStatus: useCallback(() => {
      return persistence.getSyncStatus();
    }, [persistence]),

    clearCache: useCallback(() => {
      persistence.clearCache();
      dispatch({ type: 'SET_MOOD_ENTRIES', payload: [] });
      dispatch({ type: 'SET_ERROR', payload: null });
    }, [persistence]),

    // Migration from localStorage
    migrateFromLocalStorage: useCallback(async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      try {
        // Import existing localStorage data
        const { MoodDataStorage, UserProfileStorage } = await import('@/lib/data-persistence');
        
        if (!session?.user?.id) {
          throw new Error('No user session available for migration');
        }
        
        // Load data from localStorage
        const existingMoodEntries = MoodDataStorage.load(session.user.id);
        const existingProfile = UserProfileStorage.load(session.user.id);
        
        // Migrate mood entries
        for (const entry of existingMoodEntries) {
          await persistence.saveMoodEntry(entry);
        }
        
        // Migrate user profile
        if (existingProfile) {
          // TODO: Implement profile migration
          console.log('Profile migration not yet implemented');
        }
        
        // Update local state
        dispatch({ type: 'SET_MOOD_ENTRIES', payload: existingMoodEntries });
        if (existingProfile) {
          dispatch({ type: 'SET_USER_PROFILE', payload: existingProfile });
        }
        
        console.log(`Successfully migrated ${existingMoodEntries.length} mood entries from localStorage`);
        return true;
        
      } catch (error) {
        console.error('Migration failed:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Migration from localStorage failed' });
        return false;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [persistence, session]),
  };

  const contextValue: DataPersistenceContextType = {
    state,
    actions,
    persistence,
  };

  return (
    <DataPersistenceContext.Provider value={contextValue}>
      {children}
    </DataPersistenceContext.Provider>
  );
}

// Hook to use the context
export function useDataPersistence() {
  const context = useContext(DataPersistenceContext);
  if (context === undefined) {
    throw new Error('useDataPersistence must be used within a DataPersistenceProvider');
  }
  return context;
}

// Helper hooks for specific data types
export function useMoodEntries() {
  const { state, actions } = useDataPersistence();
  
  return {
    moodEntries: state.moodEntries,
    isLoading: state.isLoading,
    error: state.error,
    loadMoodEntries: actions.loadMoodEntries,
    saveMoodEntry: actions.saveMoodEntry,
    updateMoodEntry: actions.updateMoodEntry,
    deleteMoodEntry: actions.deleteMoodEntry,
  };
}

export function useUserProfile() {
  const { state, actions } = useDataPersistence();
  
  return {
    userProfile: state.userProfile,
    isLoading: state.isLoading,
    error: state.error,
    loadUserProfile: actions.loadUserProfile,
    saveUserProfile: actions.saveUserProfile,
    updateUserProfile: actions.updateUserProfile,
  };
}

export function useSyncStatus() {
  const { state, actions } = useDataPersistence();
  
  return {
    syncStatus: state.syncStatus,
    forceSync: actions.forceSync,
    clearCache: actions.clearCache,
  };
}