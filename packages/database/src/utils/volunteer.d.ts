/**
 * ASTRAL_CORE 2.0 Database Utilities - Volunteer Operations
 * Utility functions for volunteer-related database operations
 */
export declare function createVolunteer(data: {
    anonymousId: string;
    specializations?: string[];
    languages?: string[];
    timezone?: string;
}): Promise<any>;
export declare function updateVolunteerStatus(volunteerId: string, status: string): Promise<any>;
export declare function assignVolunteerToSession(sessionId: string, volunteerId: string): Promise<any>;
export declare function recordVolunteerSession(data: {
    volunteerId: string;
    sessionType: string;
    crisisSessionId?: string;
}): Promise<any>;
//# sourceMappingURL=volunteer.d.ts.map