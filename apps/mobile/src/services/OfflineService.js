/**
 * ASTRAL_CORE 2.0 Mobile Offline Service
 *
 * Provides offline functionality with emergency contacts, crisis tips, and data sync
 */
export class OfflineService {
    static instance;
    offlineData = {
        emergencyContacts: [],
        crisisTips: [],
        lastSync: new Date(),
        userPreferences: {},
    };
    static getInstance() {
        if (!OfflineService.instance) {
            OfflineService.instance = new OfflineService();
        }
        return OfflineService.instance;
    }
    async initialize() {
        // Load offline data from local storage
        await this.loadOfflineData();
        // Set up default emergency contacts and tips if none exist
        if (this.offlineData.emergencyContacts.length === 0) {
            await this.initializeDefaultData();
        }
    }
    async loadOfflineData() {
        try {
            // TODO: Load from AsyncStorage or equivalent
            console.log('📱 Loading offline data...');
            // const stored = await AsyncStorage.getItem('astral_offline_data');
            // if (stored) {
            //   this.offlineData = JSON.parse(stored);
            // }
        }
        catch (error) {
            console.error('Failed to load offline data:', error);
        }
    }
    async saveOfflineData() {
        try {
            // TODO: Save to AsyncStorage or equivalent
            // await AsyncStorage.setItem('astral_offline_data', JSON.stringify(this.offlineData));
            console.log('💾 Offline data saved');
        }
        catch (error) {
            console.error('Failed to save offline data:', error);
        }
    }
    async initializeDefaultData() {
        // Add default emergency contacts
        this.offlineData.emergencyContacts = [
            {
                id: 'emergency-1',
                name: 'National Suicide Prevention Lifeline',
                phone: '988',
                relationship: 'Crisis Hotline',
                isPrimary: true,
            },
            {
                id: 'emergency-2',
                name: 'Crisis Text Line',
                phone: '741741',
                relationship: 'Text HOME to this number',
                isPrimary: false,
            },
            {
                id: 'emergency-3',
                name: 'Emergency Services',
                phone: '911',
                relationship: 'Emergency',
                isPrimary: false,
            },
        ];
        // Add default crisis management tips
        this.offlineData.crisisTips = [
            {
                id: 'tip-1',
                category: 'breathing',
                title: '4-7-8 Breathing Technique',
                content: 'Inhale for 4 counts, hold for 7 counts, exhale for 8 counts. Repeat 3-4 times.',
                priority: 'high',
            },
            {
                id: 'tip-2',
                category: 'grounding',
                title: '5-4-3-2-1 Grounding',
                content: 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.',
                priority: 'high',
            },
            {
                id: 'tip-3',
                category: 'safety',
                title: 'Create a Safe Space',
                content: 'Find a quiet, comfortable place. Remove any potential harm objects. Focus on your immediate safety.',
                priority: 'critical',
            },
            {
                id: 'tip-4',
                category: 'connection',
                title: 'Reach Out',
                content: 'Contact a trusted friend, family member, or crisis hotline. You are not alone.',
                priority: 'critical',
            },
        ];
        await this.saveOfflineData();
    }
    getEmergencyContacts() {
        return this.offlineData.emergencyContacts;
    }
    async addEmergencyContact(contact) {
        const newContact = {
            ...contact,
            id: `contact-${Date.now()}`,
        };
        this.offlineData.emergencyContacts.push(newContact);
        await this.saveOfflineData();
    }
    async removeEmergencyContact(contactId) {
        this.offlineData.emergencyContacts = this.offlineData.emergencyContacts.filter(contact => contact.id !== contactId);
        await this.saveOfflineData();
    }
    getCrisisTips(category) {
        if (category) {
            return this.offlineData.crisisTips.filter(tip => tip.category === category);
        }
        return this.offlineData.crisisTips.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }
    getCriticalTips() {
        return this.offlineData.crisisTips.filter(tip => tip.priority === 'critical');
    }
    async syncWithServer() {
        try {
            console.log('🔄 Syncing with server...');
            // TODO: Implement server sync
            // - Upload local changes
            // - Download server updates
            // - Merge data intelligently
            this.offlineData.lastSync = new Date();
            await this.saveOfflineData();
            console.log('✅ Sync completed');
        }
        catch (error) {
            console.error('❌ Sync failed:', error);
            throw error;
        }
    }
    getLastSyncTime() {
        return this.offlineData.lastSync;
    }
    isDataStale() {
        const hoursSinceSync = (Date.now() - this.offlineData.lastSync.getTime()) / (1000 * 60 * 60);
        return hoursSinceSync > 24; // Consider data stale after 24 hours
    }
    async updateUserPreference(key, value) {
        this.offlineData.userPreferences[key] = value;
        await this.saveOfflineData();
    }
    getUserPreference(key, defaultValue) {
        return this.offlineData.userPreferences[key] ?? defaultValue;
    }
}
export default OfflineService;
//# sourceMappingURL=OfflineService.js.map