/**
 * ASTRAL_CORE 2.0 Database Utilities - Tether Operations
 * Utility functions for tether-related database operations
 */
export declare function createTetherLink(data: {
    seekerId: string;
    supporterId: string;
    strength?: number;
    specialties?: string[];
    languages?: string[];
    timezone?: string;
}): Promise<any>;
export declare function updateTetherStrength(tetherId: string, newStrength: number): Promise<any>;
export declare function recordTetherPulse(data: {
    tetherId: string;
    pulseType: string;
    strength: number;
    mood?: number;
    status?: string;
    message?: string;
}): Promise<any>;
//# sourceMappingURL=tether.d.ts.map