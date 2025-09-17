/**
 * Offline Storage Service
 * Manages offline data persistence and sync for crisis resources
 * ASTRAL_CORE 2.0
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
class OfflineStorageService {
    static instance;
    isOnline = true;
    syncQueue = [];
    STORAGE_KEYS = {
        RESOURCES: '@astral_offline_resources',
        SESSIONS: '@astral_offline_sessions',
        EMERGENCY_CONTACTS: '@astral_emergency_contacts',
        USER_PREFERENCES: '@astral_user_preferences',
        CRISIS_PLAN: '@astral_crisis_plan',
        SYNC_QUEUE: '@astral_sync_queue',
        CACHED_MESSAGES: '@astral_cached_messages',
    };
    constructor() {
        this.initializeNetworkListener();
        this.loadSyncQueue();
    }
    static getInstance() {
        if (!OfflineStorageService.instance) {
            OfflineStorageService.instance = new OfflineStorageService();
        }
        return OfflineStorageService.instance;
    }
    async initialize() {
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
        }
        catch (error) {
            console.error('Error initializing offline storage:', error);
        }
    }
    initializeNetworkListener() {
        NetInfo.addEventListener(state => {
            const wasOffline = !this.isOnline;
            this.isOnline = state.isConnected || false;
            if (wasOffline && this.isOnline) {
                // Back online - process sync queue
                console.log('Network restored - syncing offline data');
                this.processSyncQueue();
            }
            else if (!this.isOnline) {
                console.log('Network lost - operating in offline mode');
            }
        });
    }
    // Essential Resources Management
    async ensureEssentialResources() {
        const essentialResources = [
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
    async saveOfflineResources(resources) {
        try {
            const existingResources = await this.getOfflineResources();
            const merged = this.mergeResources(existingResources, resources);
            await AsyncStorage.setItem(this.STORAGE_KEYS.RESOURCES, JSON.stringify(merged));
        }
        catch (error) {
            console.error('Error saving offline resources:', error);
        }
    }
    async getOfflineResources() {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.RESOURCES);
            return data ? JSON.parse(data) : [];
        }
        catch (error) {
            console.error('Error getting offline resources:', error);
            return [];
        }
    }
    mergeResources(existing, new_resources) {
        const resourceMap = new Map(existing.map(r => [r.id, r]));
        new_resources.forEach(r => resourceMap.set(r.id, r));
        return Array.from(resourceMap.values()).sort((a, b) => a.priority - b.priority);
    }
    // Session Management
    async saveSession(session) {
        try {
            const sessions = await this.getSessions();
            sessions.push(session);
            await AsyncStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
            if (!this.isOnline) {
                await this.addToSyncQueue({ type: 'session', data: session });
            }
        }
        catch (error) {
            console.error('Error saving session:', error);
        }
    }
    async getSessions() {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SESSIONS);
            return data ? JSON.parse(data) : [];
        }
        catch (error) {
            console.error('Error getting sessions:', error);
            return [];
        }
    }
    async getUnsyncedSessions() {
        const sessions = await this.getSessions();
        return sessions.filter(s => !s.synced);
    }
    // Emergency Contacts
    async saveEmergencyContacts(contacts) {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
        }
        catch (error) {
            console.error('Error saving emergency contacts:', error);
        }
    }
    async getEmergencyContacts() {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.EMERGENCY_CONTACTS);
            return data ? JSON.parse(data) : [];
        }
        catch (error) {
            console.error('Error getting emergency contacts:', error);
            return [];
        }
    }
    // Crisis Plan
    async saveCrisisPlan(plan) {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.CRISIS_PLAN, JSON.stringify(plan));
        }
        catch (error) {
            console.error('Error saving crisis plan:', error);
        }
    }
    async getCrisisPlan() {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.CRISIS_PLAN);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Error getting crisis plan:', error);
            return null;
        }
    }
    // Message Caching
    async cacheMessage(message) {
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
        }
        catch (error) {
            console.error('Error caching message:', error);
        }
    }
    async getCachedMessages() {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.CACHED_MESSAGES);
            return data ? JSON.parse(data) : [];
        }
        catch (error) {
            console.error('Error getting cached messages:', error);
            return [];
        }
    }
    // Sync Queue Management
    async addToSyncQueue(item) {
        this.syncQueue.push({
            ...item,
            queuedAt: new Date().toISOString(),
        });
        await this.saveSyncQueue();
    }
    async saveSyncQueue() {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
        }
        catch (error) {
            console.error('Error saving sync queue:', error);
        }
    }
    async loadSyncQueue() {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SYNC_QUEUE);
            this.syncQueue = data ? JSON.parse(data) : [];
        }
        catch (error) {
            console.error('Error loading sync queue:', error);
            this.syncQueue = [];
        }
    }
    async processSyncQueue() {
        if (this.syncQueue.length === 0)
            return;
        console.log(`Processing ${this.syncQueue.length} items in sync queue`);
        const failedItems = [];
        for (const item of this.syncQueue) {
            try {
                await this.syncItem(item);
            }
            catch (error) {
                console.error('Failed to sync item:', error);
                failedItems.push(item);
            }
        }
        this.syncQueue = failedItems;
        await this.saveSyncQueue();
    }
    async syncItem(item) {
        // This would integrate with your API
        console.log('Syncing item:', item.type);
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
    }
    // User Preferences
    async saveUserPreferences(preferences) {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
        }
        catch (error) {
            console.error('Error saving user preferences:', error);
        }
    }
    async getUserPreferences() {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
            return data ? JSON.parse(data) : {};
        }
        catch (error) {
            console.error('Error getting user preferences:', error);
            return {};
        }
    }
    // Storage Management
    async getStorageInfo() {
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
        }
        catch (error) {
            console.error('Error getting storage info:', error);
            return { used: 0, available: 0 };
        }
    }
    async clearOldData(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            // Clear old sessions
            const sessions = await this.getSessions();
            const recentSessions = sessions.filter(s => new Date(s.startTime) > cutoffDate || !s.synced);
            await AsyncStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(recentSessions));
            // Clear old messages
            const messages = await this.getCachedMessages();
            const recentMessages = messages.filter(m => new Date(m.timestamp) > cutoffDate);
            await AsyncStorage.setItem(this.STORAGE_KEYS.CACHED_MESSAGES, JSON.stringify(recentMessages));
            console.log('Old data cleared');
        }
        catch (error) {
            console.error('Error clearing old data:', error);
        }
    }
    isNetworkAvailable() {
        return this.isOnline;
    }
}
export default OfflineStorageService;
//# sourceMappingURL=OfflineStorageService.js.map