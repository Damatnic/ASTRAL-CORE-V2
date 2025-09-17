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
}): Promise<{
    id: string;
    emergencyContact: boolean;
    seekerId: string;
    supporterId: string;
    strength: number;
    trustScore: number;
    established: Date;
    lastActivity: Date;
    pulseInterval: number;
    lastPulse: Date;
    missedPulses: number;
    emergencyActive: boolean;
    emergencyType: import("packages/database/generated/client").$Enums.EmergencyType | null;
    lastEmergency: Date | null;
    matchingScore: number | null;
    specialties: string | null;
    languages: string | null;
    timezone: string | null;
    dataSharing: import("packages/database/generated/client").$Enums.TetherDataSharing;
    locationSharing: boolean;
    encryptedMeta: Uint8Array | null;
} | {
    id: string;
    emergencyContact: boolean;
    seekerId: string;
    supporterId: string;
    strength: number;
    trustScore: number;
    established: Date;
    lastActivity: Date;
    pulseInterval: number;
    lastPulse: Date;
    missedPulses: number;
    emergencyActive: boolean;
    emergencyType: import("packages/database/generated/client").$Enums.EmergencyType | null;
    lastEmergency: Date | null;
    matchingScore: number | null;
    specialties: string | null;
    languages: string | null;
    timezone: string | null;
    dataSharing: import("packages/database/generated/client").$Enums.TetherDataSharing;
    locationSharing: boolean;
    encryptedMeta: Uint8Array | null;
}>;
export declare function updateTetherStrength(tetherId: string, newStrength: number): Promise<{
    id: string;
    emergencyContact: boolean;
    seekerId: string;
    supporterId: string;
    strength: number;
    trustScore: number;
    established: Date;
    lastActivity: Date;
    pulseInterval: number;
    lastPulse: Date;
    missedPulses: number;
    emergencyActive: boolean;
    emergencyType: import("packages/database/generated/client").$Enums.EmergencyType | null;
    lastEmergency: Date | null;
    matchingScore: number | null;
    specialties: string | null;
    languages: string | null;
    timezone: string | null;
    dataSharing: import("packages/database/generated/client").$Enums.TetherDataSharing;
    locationSharing: boolean;
    encryptedMeta: Uint8Array | null;
} | {
    id: string;
    emergencyContact: boolean;
    seekerId: string;
    supporterId: string;
    strength: number;
    trustScore: number;
    established: Date;
    lastActivity: Date;
    pulseInterval: number;
    lastPulse: Date;
    missedPulses: number;
    emergencyActive: boolean;
    emergencyType: import("packages/database/generated/client").$Enums.EmergencyType | null;
    lastEmergency: Date | null;
    matchingScore: number | null;
    specialties: string | null;
    languages: string | null;
    timezone: string | null;
    dataSharing: import("packages/database/generated/client").$Enums.TetherDataSharing;
    locationSharing: boolean;
    encryptedMeta: Uint8Array | null;
}>;
export declare function recordTetherPulse(data: {
    tetherId: string;
    pulseType: string;
    strength: number;
    mood?: number;
    status?: string;
    message?: string;
}): Promise<{
    timestamp: Date;
    id: string;
    status: import("packages/database/generated/client").$Enums.UserStatus;
    strength: number;
    tetherId: string;
    pulseType: import("packages/database/generated/client").$Enums.PulseType;
    mood: number | null;
    message: string | null;
    emergencySignal: boolean;
    urgencyLevel: import("packages/database/generated/client").$Enums.UrgencyLevel;
    acknowledged: boolean;
    acknowledgedAt: Date | null;
} | {
    timestamp: Date;
    id: string;
    status: import("packages/database/generated/client").$Enums.UserStatus;
    strength: number;
    tetherId: string;
    pulseType: import("packages/database/generated/client").$Enums.PulseType;
    mood: number | null;
    message: string | null;
    emergencySignal: boolean;
    urgencyLevel: import("packages/database/generated/client").$Enums.UrgencyLevel;
    acknowledged: boolean;
    acknowledgedAt: Date | null;
}>;
//# sourceMappingURL=tether.d.ts.map