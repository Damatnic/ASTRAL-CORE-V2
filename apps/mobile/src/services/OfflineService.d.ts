/**
 * ASTRAL_CORE 2.0 Mobile Offline Service
 *
 * Provides offline functionality with emergency contacts, crisis tips, and data sync
 */
export interface EmergencyContact {
    id: string;
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
}
export interface CrisisTip {
    id: string;
    category: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface OfflineData {
    emergencyContacts: EmergencyContact[];
    crisisTips: CrisisTip[];
    lastSync: Date;
    userPreferences: Record<string, any>;
}
export declare class OfflineService {
    private static instance;
    private offlineData;
    static getInstance(): OfflineService;
    initialize(): Promise<void>;
    private loadOfflineData;
    private saveOfflineData;
    private initializeDefaultData;
    getEmergencyContacts(): EmergencyContact[];
    addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<void>;
    removeEmergencyContact(contactId: string): Promise<void>;
    getCrisisTips(category?: string): CrisisTip[];
    getCriticalTips(): CrisisTip[];
    syncWithServer(): Promise<void>;
    getLastSyncTime(): Date;
    isDataStale(): boolean;
    updateUserPreference(key: string, value: any): Promise<void>;
    getUserPreference(key: string, defaultValue?: any): any;
}
export default OfflineService;
//# sourceMappingURL=OfflineService.d.ts.map