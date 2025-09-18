/**
 * Professional Verification Service
 * HIPAA-Compliant Professional Verification for Mental Health Platform
 *
 * Features:
 * - Professional license verification
 * - Background check coordination
 * - Credential validation
 * - Compliance tracking
 * - Verification workflow management
 * - Integration with state licensing boards
 */
import { User } from '../generated/client';
export interface ProfessionalVerificationData {
    professionalType: string;
    licenseNumber: string;
    licenseState: string;
    licenseCountry: string;
    issueDate: Date;
    expirationDate: Date;
    degree: string;
    institution: string;
    graduationYear: number;
    specializations: string[];
    certifications: string[];
    practiceType: string;
    practiceName?: string;
    practiceAddress?: string;
    practicePhone?: string;
    documentIds: string[];
    backgroundCheckConsent: boolean;
    backgroundCheckDate?: Date;
    backgroundCheckStatus?: 'pending' | 'clear' | 'concerns' | 'failed';
    references: {
        name: string;
        title: string;
        organization: string;
        email: string;
        phone: string;
        relationship: string;
    }[];
}
export interface CreateVerificationParams {
    userId: string;
    verificationData: ProfessionalVerificationData;
}
export interface UpdateVerificationParams {
    userId: string;
    status: VerificationStatus;
    reviewNotes?: string;
    reviewedBy?: string;
    verificationData?: Partial<ProfessionalVerificationData>;
}
/**
 * Encrypts professional verification data
 */
export declare function encryptVerificationData(verificationData: ProfessionalVerificationData, userId: string): {
    encryptedData: Buffer;
    salt: Buffer;
    dataHash: string;
};
/**
 * Decrypts professional verification data
 */
export declare function decryptVerificationData(encryptedData: Buffer, userId: string, salt: Buffer, dataHash: string): ProfessionalVerificationData;
/**
 * Submits professional verification application
 */
export declare function submitProfessionalVerification(params: CreateVerificationParams): Promise<User>;
/**
 * Updates verification status (admin/reviewer function)
 */
export declare function updateVerificationStatus(params: UpdateVerificationParams): Promise<User>;
/**
 * Gets pending verifications for review
 */
export declare function getPendingVerifications(limit?: number): Promise<any>;
/**
 * Gets verified professionals by type
 */
export declare function getVerifiedProfessionals(professionalType?: string, specializations?: string[]): Promise<any>;
/**
 * Verifies license with state licensing board (mock implementation)
 */
export declare function verifyLicenseWithBoard(licenseNumber: string, licenseState: string, professionalType: string): Promise<{
    isValid: boolean;
    status: string;
    expirationDate?: Date;
    restrictions?: string[];
    error?: string;
}>;
/**
 * Performs background check (mock implementation)
 */
export declare function performBackgroundCheck(userId: string): Promise<{
    status: 'clear' | 'concerns' | 'failed';
    completedAt: Date;
    details?: any;
}>;
/**
 * Gets verification statistics for monitoring
 */
export declare function getVerificationStatistics(): Promise<{
    totalApplications: number;
    pendingReview: number;
    approved: number;
    rejected: number;
    averageProcessingTime: number;
    verificationsByType: {
        [key: string]: number;
    };
}>;
/**
 * Checks if a user is a verified professional
 */
export declare function isVerifiedProfessional(userId: string): Promise<boolean>;
/**
 * Gets professional verification details (admin view)
 */
export declare function getProfessionalVerificationDetails(userId: string): Promise<{
    user: User;
    verificationData?: ProfessionalVerificationData;
    auditLogs: any[];
}>;
//# sourceMappingURL=verification.service.d.ts.map