/**
 * ASTRAL_CORE 2.0 Mobile Crisis Service
 *
 * Handles crisis session management and emergency protocols
 */
export interface CrisisSession {
    id: string;
    userId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'active' | 'resolved';
    createdAt: Date;
    volunteerId?: string;
}
export declare class CrisisService {
    private static instance;
    private currentSession;
    static getInstance(): CrisisService;
    static initialize(): Promise<void>;
    static enableBackgroundMode(): void;
    startCrisisSession(severity: CrisisSession['severity']): Promise<CrisisSession>;
    escalateToEmergency(): Promise<void>;
    getCurrentSession(): CrisisSession | null;
    endSession(): Promise<void>;
}
export default CrisisService;
//# sourceMappingURL=CrisisService.d.ts.map