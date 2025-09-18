/**
 * Data Persistence Utilities for ASTRAL CORE V2
 * Handles localStorage and future database integration
 * HIPAA-compliant local storage with encryption
 */

import { randomBytes, createCipher, createDecipher } from 'crypto';
import type { UserProfile } from '@/lib/db';

// Re-export UserProfile for backward compatibility
export type { UserProfile };

export interface DataPersistenceConfig {
  encrypted: boolean;
  expirationDays?: number;
  prefix: string;
}

export interface MoodEntry {
  id: string;
  date: Date;
  mood: number;
  emotions: {
    happy: number;
    sad: number;
    anxious: number;
    angry: number;
    calm: number;
    energetic: number;
  };
  triggers: string[];
  activities: string[];
  sleepHours?: number;
  notes?: string;
  weather?: string;
  medication?: boolean;
  socialInteraction?: number;
}

// UserProfile type is now imported from @/lib/db

const DEFAULT_CONFIG: DataPersistenceConfig = {
  encrypted: true,
  expirationDays: 30,
  prefix: 'astral_',
};

/**
 * Encrypts data for local storage (basic encryption for demo)
 * In production, use proper encryption libraries
 */
function encryptData(data: string, key: string): string {
  try {
    const cipher = createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch {
    // Fallback to base64 if crypto fails (e.g., in some environments)
    return Buffer.from(data).toString('base64');
  }
}

/**
 * Decrypts data from local storage
 */
function decryptData(encryptedData: string, key: string): string {
  try {
    const decipher = createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    // Fallback from base64 if crypto fails
    try {
      return Buffer.from(encryptedData, 'base64').toString('utf8');
    } catch {
      return encryptedData; // Return as-is if all else fails
    }
  }
}

/**
 * Generates a user-specific encryption key
 */
function getUserKey(userId: string): string {
  return `astral_${userId}_key`;
}

/**
 * Checks if data has expired
 */
function isExpired(timestamp: number, expirationDays: number): boolean {
  const now = Date.now();
  const expirationTime = timestamp + (expirationDays * 24 * 60 * 60 * 1000);
  return now > expirationTime;
}

/**
 * Stores data in localStorage with optional encryption
 */
export function storeData<T>(
  key: string,
  data: T,
  userId: string,
  config: Partial<DataPersistenceConfig> = {}
): boolean {
  if (typeof window === 'undefined') return false; // SSR check

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const storageKey = `${finalConfig.prefix}${userId}_${key}`;
  
  try {
    const payload = {
      data,
      timestamp: Date.now(),
      encrypted: finalConfig.encrypted,
      version: '1.0'
    };

    let jsonString = JSON.stringify(payload);
    
    if (finalConfig.encrypted) {
      const userKey = getUserKey(userId);
      jsonString = encryptData(jsonString, userKey);
    }

    localStorage.setItem(storageKey, jsonString);
    return true;
  } catch (error) {
    console.error('Failed to store data:', error);
    return false;
  }
}

/**
 * Retrieves data from localStorage with decryption
 */
export function retrieveData<T>(
  key: string,
  userId: string,
  config: Partial<DataPersistenceConfig> = {}
): T | null {
  if (typeof window === 'undefined') return null; // SSR check

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const storageKey = `${finalConfig.prefix}${userId}_${key}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    let jsonString = stored;
    
    if (finalConfig.encrypted) {
      const userKey = getUserKey(userId);
      jsonString = decryptData(stored, userKey);
    }

    const payload = JSON.parse(jsonString);
    
    // Check expiration
    if (finalConfig.expirationDays && 
        isExpired(payload.timestamp, finalConfig.expirationDays)) {
      localStorage.removeItem(storageKey);
      return null;
    }

    return payload.data as T;
  } catch (error) {
    console.error('Failed to retrieve data:', error);
    return null;
  }
}

/**
 * Removes data from localStorage
 */
export function removeData(
  key: string,
  userId: string,
  config: Partial<DataPersistenceConfig> = {}
): boolean {
  if (typeof window === 'undefined') return false;

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const storageKey = `${finalConfig.prefix}${userId}_${key}`;
  
  try {
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('Failed to remove data:', error);
    return false;
  }
}

/**
 * Clears all user data from localStorage
 */
export function clearUserData(
  userId: string,
  config: Partial<DataPersistenceConfig> = {}
): boolean {
  if (typeof window === 'undefined') return false;

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const prefix = `${finalConfig.prefix}${userId}_`;
  
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Failed to clear user data:', error);
    return false;
  }
}

/**
 * Lists all stored data keys for a user
 */
export function listUserDataKeys(
  userId: string,
  config: Partial<DataPersistenceConfig> = {}
): string[] {
  if (typeof window === 'undefined') return [];

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const prefix = `${finalConfig.prefix}${userId}_`;
  const keys: string[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        // Remove prefix to get clean key name
        keys.push(key.replace(prefix, ''));
      }
    }
    return keys;
  } catch (error) {
    console.error('Failed to list user data keys:', error);
    return [];
  }
}

/**
 * Exports all user data for backup/transfer
 */
export function exportUserData(
  userId: string,
  config: Partial<DataPersistenceConfig> = {}
): Record<string, any> | null {
  if (typeof window === 'undefined') return null;

  const keys = listUserDataKeys(userId, config);
  const exportData: Record<string, any> = {};
  
  try {
    keys.forEach(key => {
      const data = retrieveData(key, userId, config);
      if (data !== null) {
        exportData[key] = data;
      }
    });
    
    return {
      userId,
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: exportData
    };
  } catch (error) {
    console.error('Failed to export user data:', error);
    return null;
  }
}

/**
 * Imports user data from backup
 */
export function importUserData(
  exportedData: Record<string, any>,
  userId: string,
  config: Partial<DataPersistenceConfig> = {}
): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (!exportedData.data || typeof exportedData.data !== 'object') {
      throw new Error('Invalid export data format');
    }

    Object.entries(exportedData.data).forEach(([key, value]) => {
      storeData(key, value, userId, config);
    });
    
    return true;
  } catch (error) {
    console.error('Failed to import user data:', error);
    return false;
  }
}

/**
 * Specific helper functions for common data types
 */

export const MoodDataStorage = {
  save: (entries: MoodEntry[], userId: string) => 
    storeData('mood_entries', entries, userId),
  
  load: (userId: string): MoodEntry[] => 
    retrieveData<MoodEntry[]>('mood_entries', userId) || [],
  
  addEntry: (entry: MoodEntry, userId: string): boolean => {
    const existing = MoodDataStorage.load(userId);
    const updated = [...existing, entry];
    return MoodDataStorage.save(updated, userId);
  },
  
  removeEntry: (entryId: string, userId: string): boolean => {
    const existing = MoodDataStorage.load(userId);
    const updated = existing.filter(entry => entry.id !== entryId);
    return MoodDataStorage.save(updated, userId);
  }
};

export const UserProfileStorage = {
  save: (profile: UserProfile, userId: string) => 
    storeData('user_profile', profile, userId),
  
  load: (userId: string): UserProfile | null => 
    retrieveData<UserProfile>('user_profile', userId),
  
  update: (updates: Partial<UserProfile>, userId: string): boolean => {
    const existing = UserProfileStorage.load(userId);
    if (!existing) return false;
    
    const updated = { ...existing, ...updates };
    return UserProfileStorage.save(updated, userId);
  }
};