/**
 * Offline Storage Service
 * Manages offline data persistence and sync for crisis resources
 * ASTRAL_CORE 2.0
 */
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
declare class OfflineStorageService {
    private static instance;
    private isOnline;
    private syncQueue;
    private readonly STORAGE_KEYS;
    private constructor();
    static getInstance(): OfflineStorageService;
    initialize(): Promise<void>;
    private initializeNetworkListener;
    private ensureEssentialResources;
    saveOfflineResources(resources: OfflineResource[]): Promise<void>;
    getOfflineResources(): Promise<OfflineResource[]>;
    private mergeResources;
    saveSession(session: OfflineSession): Promise<void>;
    getSessions(): Promise<OfflineSession[]>;
    getUnsyncedSessions(): Promise<OfflineSession[]>;
    saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void>;
    getEmergencyContacts(): Promise<EmergencyContact[]>;
    saveCrisisPlan(plan: any): Promise<void>;
    getCrisisPlan(): Promise<any>;
    cacheMessage(message: any): Promise<void>;
    getCachedMessages(): Promise<any[]>;
    private addToSyncQueue;
    private saveSyncQueue;
    private loadSyncQueue;
    private processSyncQueue;
    private syncItem;
    saveUserPreferences(preferences: any): Promise<void>;
    getUserPreferences(): Promise<any>;
    getStorageInfo(): Promise<{
        used: number;
        available: number;
    }>;
    clearOldData(daysOld?: number): Promise<void>;
    isNetworkAvailable(): boolean;
}
export default OfflineStorageService;
//# sourceMappingURL=OfflineStorageService.d.ts.map