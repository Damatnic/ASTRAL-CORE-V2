/**
 * Offline Storage Service
 * Manages offline data persistence and sync for crisis resources
 * ASTRAL_CORE 2.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface OfflineResource {
  id: string;
  type: 'crisis_technique' | 'emergency_contact' | 'coping_strategy' | 'meditation' | 'article';
  title: string;
  content: string;
  priority: number;
  lastUpdated: string;
  metadata?: any;
}

export interface OfflineSession {
  id: string;
  startTime: string;
  endTime?: string;
  type: 'crisis' | 'chat' | 'self_help';
  notes: string[];
  mood?: number;
  synced: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'personal' | 'professional' | 'hotline';
  available247: boolean;
}

class OfflineStorageService {
  private static instance: OfflineStorageService;
  private isOnline: boolean = true;
  private syncQueue: any[] = [];
  private readonly STORAGE_KEYS = {
    RESOURCES: '@astral_offline_resources',
    SESSIONS: '@astral_offline_sessions',
    EMERGENCY_CONTACTS: '@astral_emergency_contacts',
    USER_PREFERENCES: '@astral_user_preferences',
    CRISIS_PLAN: '@astral_crisis_plan',
    SYNC_QUEUE: '@astral_sync_queue',
    CACHED_MESSAGES: '@astral_cached_messages',
  };

  private constructor() {
    this.initializeNetworkListener();
    this.loadSyncQueue();
  }

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Check network status
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected || false;

      // Load essential offline resources if not already cached
      await this.ensureEssentialResources();

      // Process any pending sync items
      if (this.isOnline) {
        await this.processSyncQueue();
      }

      console.log('Offline storage initialized. Online status:', this.isOnline);
    } catch (error) {
      console.error('Error initializing offline storage:', error);
    }
  }

  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected || false;

      if (wasOffline && this.isOnline) {
        // Back online - process sync queue
        console.log('Network restored - syncing offline data');
        this.processSyncQueue();
      } else if (!this.isOnline) {
        console.log('Network lost - operating in offline mode');
      }
    });
  }

  // Essential Resources Management
  private async ensureEssentialResources(): Promise<void> {
    const essentialResources: OfflineResource[] = [
      {
        id: 'breathing_exercise',
        type: 'crisis_technique',
        title: 'Box Breathing Exercise',
        content: 'Inhale for 4 counts, hold for 4 counts, exhale for 4 counts, hold for 4 counts. Repeat 4-8 times.',
        priority: 1,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'grounding_5_4_3_2_1',
        type: 'crisis_technique',
        title: '5-4-3-2-1 Grounding Technique',
        content: 'Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, 1 thing you can taste.',
        priority: 1,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'crisis_hotline',
        type: 'emergency_contact',
        title: 'National Crisis Hotline',
        content: 'Call 988 or text "HELLO" to 741741',
        priority: 1,
        lastUpdated: new Date().toISOString(),
        metadata: {
          phone: '988',
          text: '741741',
          available247: true,
        },
      },
      {
        id: 'safety_plan_template',
        type: 'coping_strategy',
        title: 'Crisis Safety Plan',
        content: '1. Warning signs\n2. Coping strategies\n3. Social contacts\n4. Professional contacts\n5. Make environment safe',
        priority: 1,
        lastUpdated: new Date().toISOString(),
      },
    ];

    const existingResources = await this.getOfflineResources();
    if (!existingResources || existingResources.length === 0) {
      await this.saveOfflineResources(essentialResources);
    }
  }

  // Offline Resources
  async saveOfflineResources(resources: OfflineResource[]): Promise<void> {
    try {
      const existingResources = await this.getOfflineResources();
      const merged = this.mergeResources(existingResources, resources);
      await AsyncStorage.setItem(this.STORAGE_KEYS.RESOURCES, JSON.stringify(merged));
    } catch (error) {
      console.error('Error saving offline resources:', error);
    }
  }

  async getOfflineResources(): Promise<OfflineResource[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.RESOURCES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline resources:', error);
      return [];
    }
  }

  private mergeResources(existing: OfflineResource[], new_resources: OfflineResource[]): OfflineResource[] {
    const resourceMap = new Map(existing.map(r => [r.id, r]));
    new_resources.forEach(r => resourceMap.set(r.id, r));
    return Array.from(resourceMap.values()).sort((a, b) => a.priority - b.priority);
  }

  // Session Management
  async saveSession(session: OfflineSession): Promise<void> {
    try {
      const sessions = await this.getSessions();
      sessions.push(session);
      await AsyncStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

      if (!this.isOnline) {
        await this.addToSyncQueue({ type: 'session', data: session });
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  async getSessions(): Promise<OfflineSession[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  async getUnsyncedSessions(): Promise<OfflineSession[]> {
    const sessions = await this.getSessions();
    return sessions.filter(s => !s.synced);
  }

  // Emergency Contacts
  async saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving emergency contacts:', error);
    }
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.EMERGENCY_CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      return [];
    }
  }

  // Crisis Plan
  async saveCrisisPlan(plan: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.CRISIS_PLAN, JSON.stringify(plan));
    } catch (error) {
      console.error('Error saving crisis plan:', error);
    }
  }

  async getCrisisPlan(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.CRISIS_PLAN);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting crisis plan:', error);
      return null;
    }
  }

  // Message Caching
  async cacheMessage(message: any): Promise<void> {
    try {
      const messages = await this.getCachedMessages();
      messages.push({
        ...message,
        cached: true,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 100 messages
      const trimmed = messages.slice(-100);
      await AsyncStorage.setItem(this.STORAGE_KEYS.CACHED_MESSAGES, JSON.stringify(trimmed));

      if (!this.isOnline) {
        await this.addToSyncQueue({ type: 'message', data: message });
      }
    } catch (error) {
      console.error('Error caching message:', error);
    }
  }

  async getCachedMessages(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.CACHED_MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cached messages:', error);
      return [];
    }
  }

  // Sync Queue Management
  private async addToSyncQueue(item: any): Promise<void> {
    this.syncQueue.push({
      ...item,
      queuedAt: new Date().toISOString(),
    });
    await this.saveSyncQueue();
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SYNC_QUEUE);
      this.syncQueue = data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading sync queue:', error);
      this.syncQueue = [];
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(`Processing ${this.syncQueue.length} items in sync queue`);

    const failedItems = [];
    for (const item of this.syncQueue) {
      try {
        await this.syncItem(item);
      } catch (error) {
        console.error('Failed to sync item:', error);
        failedItems.push(item);
      }
    }

    this.syncQueue = failedItems;
    await this.saveSyncQueue();
  }

  private async syncItem(item: any): Promise<void> {
    // This would integrate with your API
    console.log('Syncing item:', item.type);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  // User Preferences
  async saveUserPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  async getUserPreferences(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {};
    }
  }

  // Storage Management
  async getStorageInfo(): Promise<{ used: number; available: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        used: totalSize,
        available: 10 * 1024 * 1024, // Assuming 10MB limit
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, available: 0 };
    }
  }

  async clearOldData(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Clear old sessions
      const sessions = await this.getSessions();
      const recentSessions = sessions.filter(s => 
        new Date(s.startTime) > cutoffDate || !s.synced
      );
      await AsyncStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(recentSessions));

      // Clear old messages
      const messages = await this.getCachedMessages();
      const recentMessages = messages.filter(m => 
        new Date(m.timestamp) > cutoffDate
      );
      await AsyncStorage.setItem(this.STORAGE_KEYS.CACHED_MESSAGES, JSON.stringify(recentMessages));

      console.log('Old data cleared');
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  }

  isNetworkAvailable(): boolean {
    return this.isOnline;
  }
}

export default OfflineStorageService;