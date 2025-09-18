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

import { prisma } from '../';
import { User, VerificationStatus } from '../generated/client';
import { encryptUserData, decryptUserData } from '../utils/encryption';
import { randomBytes } from 'crypto';

export interface ProfessionalVerificationData {
  professionalType: string; // 'therapist', 'counselor', 'psychologist', 'psychiatrist', 'peer_support'
  licenseNumber: string;
  licenseState: string;
  licenseCountry: string;
  issueDate: Date;
  expirationDate: Date;
  
  // Professional details
  degree: string;
  institution: string;
  graduationYear: number;
  specializations: string[];
  certifications: string[];
  
  // Practice information
  practiceType: string; // 'private', 'hospital', 'clinic', 'community', 'academic'
  practiceName?: string;
  practiceAddress?: string;
  practicePhone?: string;
  
  // Verification documents
  documentIds: string[]; // References to uploaded documents
  
  // Background check
  backgroundCheckConsent: boolean;
  backgroundCheckDate?: Date;
  backgroundCheckStatus?: 'pending' | 'clear' | 'concerns' | 'failed';
  
  // Professional references
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
export function encryptVerificationData(
  verificationData: ProfessionalVerificationData,
  userId: string
): {
  encryptedData: Buffer;
  salt: Buffer;
  dataHash: string;
} {
  const salt = randomBytes(32);
  const jsonData = JSON.stringify(verificationData);
  
  // Encrypt sensitive professional data
  const encryption = encryptUserData(jsonData, userId);
  
  return {
    encryptedData: encryption.encryptedData,
    salt,
    dataHash: require('crypto').createHash('sha256').update(jsonData).digest('hex'),
  };
}

/**
 * Decrypts professional verification data
 */
export function decryptVerificationData(
  encryptedData: Buffer,
  userId: string,
  salt: Buffer,
  dataHash: string
): ProfessionalVerificationData {
  try {
    const decryptedJson = decryptUserData(
      encryptedData,
      userId,
      salt,
      Buffer.alloc(16), // IV - would be stored separately in production
      Buffer.alloc(16)  // Auth tag - would be stored separately in production
    );
    
    // Verify data integrity
    const computedHash = require('crypto').createHash('sha256').update(decryptedJson).digest('hex');
    if (computedHash !== dataHash) {
      throw new Error('Data integrity check failed');
    }
    
    return JSON.parse(decryptedJson) as ProfessionalVerificationData;
  } catch (error) {
    console.error('Failed to decrypt verification data:', error);
    throw new Error('Unable to decrypt professional verification data');
  }
}

/**
 * Submits professional verification application
 */
export async function submitProfessionalVerification(params: CreateVerificationParams): Promise<User> {
  const start = Date.now();
  
  try {
    // Encrypt the verification data
    const encrypted = encryptVerificationData(params.verificationData, params.userId);
    
    // Update user with professional information
    const user = await prisma.user.update({
      where: { id: params.userId },
      data: {
        verificationStatus: 'IN_PROGRESS',
        professionalType: params.verificationData.professionalType,
        licenseNumber: encrypted.encryptedData.toString('base64'), // Store encrypted
        verifiedAt: null, // Will be set when verified
        
        // Update other relevant fields
        updatedAt: new Date(),
      },
    });
    
    // Log the verification submission
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: 'PROFESSIONAL_VERIFICATION_SUBMITTED',
        resource: 'user_verification',
        resourceId: params.userId,
        details: {
          professionalType: params.verificationData.professionalType,
          licenseState: params.verificationData.licenseState,
          submissionTime: new Date(),
        },
        success: true,
      },
    });
    
    const executionTime = Date.now() - start;
    
    console.log(`✅ Professional verification submitted for user ${params.userId}: ${params.verificationData.professionalType}`);
    
    if (executionTime > 200) {
      console.warn(`⚠️ submitProfessionalVerification took ${executionTime}ms (target: <200ms)`);
    }
    
    return user;
  } catch (error) {
    console.error('Failed to submit professional verification:', error);
    
    // Log the failure
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: 'PROFESSIONAL_VERIFICATION_FAILED',
        resource: 'user_verification',
        resourceId: params.userId,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    }).catch(() => {
      // Don't fail if audit logging fails
    });
    
    throw new Error('Unable to submit professional verification');
  }
}

/**
 * Updates verification status (admin/reviewer function)
 */
export async function updateVerificationStatus(params: UpdateVerificationParams): Promise<User> {
  const start = Date.now();
  
  try {
    const updateData: any = {
      verificationStatus: params.status,
      updatedAt: new Date(),
    };
    
    // If approving, set verification date
    if (params.status === 'APPROVED') {
      updateData.verifiedAt = new Date();
    }
    
    const user = await prisma.user.update({
      where: { id: params.userId },
      data: updateData,
    });
    
    // Log the status update
    await prisma.auditLog.create({
      data: {
        userId: params.reviewedBy || 'system',
        action: 'PROFESSIONAL_VERIFICATION_UPDATED',
        resource: 'user_verification',
        resourceId: params.userId,
        details: {
          newStatus: params.status,
          reviewNotes: params.reviewNotes,
          reviewedBy: params.reviewedBy,
          reviewTime: new Date(),
        },
        success: true,
      },
    });
    
    const executionTime = Date.now() - start;
    
    console.log(`✅ Verification status updated for user ${params.userId}: ${params.status}`);
    
    return user;
  } catch (error) {
    console.error('Failed to update verification status:', error);
    throw new Error('Unable to update verification status');
  }
}

/**
 * Gets pending verifications for review
 */
export async function getPendingVerifications(limit: number = 50) {
  return await prisma.user.findMany({
    where: {
      verificationStatus: {
        in: ['PENDING', 'IN_PROGRESS'],
      },
      professionalType: {
        not: null,
      },
    },
    orderBy: {
      updatedAt: 'asc', // Oldest first (FIFO)
    },
    take: limit,
    select: {
      id: true,
      email: true,
      professionalType: true,
      verificationStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Gets verified professionals by type
 */
export async function getVerifiedProfessionals(
  professionalType?: string,
  specializations?: string[]
) {
  const where: any = {
    verificationStatus: 'APPROVED',
    professionalType: {
      not: null,
    },
  };
  
  if (professionalType) {
    where.professionalType = professionalType;
  }
  
  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      professionalType: true,
      verificationStatus: true,
      verifiedAt: true,
      // Don't include encrypted license data in general queries
    },
    orderBy: {
      verifiedAt: 'desc',
    },
  });
}

/**
 * Verifies license with state licensing board (mock implementation)
 */
export async function verifyLicenseWithBoard(
  licenseNumber: string,
  licenseState: string,
  professionalType: string
): Promise<{
  isValid: boolean;
  status: string;
  expirationDate?: Date;
  restrictions?: string[];
  error?: string;
}> {
  // This would integrate with actual state licensing boards
  // For now, we'll return a mock response
  
  try {
    // Mock validation logic
    const isValidFormat = /^[A-Z0-9]{6,15}$/.test(licenseNumber);
    const validStates = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
    const isValidState = validStates.includes(licenseState);
    
    if (!isValidFormat || !isValidState) {
      return {
        isValid: false,
        status: 'invalid_format',
        error: 'Invalid license number format or state',
      };
    }
    
    // Mock successful verification
    return {
      isValid: true,
      status: 'active',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      restrictions: [],
    };
  } catch (error) {
    console.error('License verification failed:', error);
    return {
      isValid: false,
      status: 'verification_error',
      error: 'Unable to verify license at this time',
    };
  }
}

/**
 * Performs background check (mock implementation)
 */
export async function performBackgroundCheck(userId: string): Promise<{
  status: 'clear' | 'concerns' | 'failed';
  completedAt: Date;
  details?: any;
}> {
  // This would integrate with background check services
  // For now, we'll return a mock response
  
  try {
    // Mock background check process
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    // Mock result (95% pass rate for demo)
    const passed = Math.random() > 0.05;
    
    return {
      status: passed ? 'clear' : 'concerns',
      completedAt: new Date(),
      details: passed ? {} : { concerns: ['Minor traffic violation'] },
    };
  } catch (error) {
    console.error('Background check failed:', error);
    return {
      status: 'failed',
      completedAt: new Date(),
      details: { error: 'Background check service unavailable' },
    };
  }
}

/**
 * Gets verification statistics for monitoring
 */
export async function getVerificationStatistics(): Promise<{
  totalApplications: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  averageProcessingTime: number;
  verificationsByType: { [key: string]: number };
}> {
  try {
    const [
      totalApplications,
      pendingReview,
      approved,
      rejected,
      verificationsByType,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          professionalType: { not: null },
        },
      }),
      prisma.user.count({
        where: {
          verificationStatus: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),
      prisma.user.count({
        where: {
          verificationStatus: 'APPROVED',
        },
      }),
      prisma.user.count({
        where: {
          verificationStatus: 'REJECTED',
        },
      }),
      prisma.user.groupBy({
        by: ['professionalType'],
        where: {
          professionalType: { not: null },
          verificationStatus: 'APPROVED',
        },
        _count: true,
      }),
    ]);
    
    // Convert groupBy result to object
    const typeStats: { [key: string]: number } = {};
    verificationsByType.forEach((item: any) => {
      if (item.professionalType) {
        typeStats[item.professionalType] = item._count;
      }
    });
    
    // Calculate average processing time (mock calculation)
    const averageProcessingTime = 72; // hours (mock value)
    
    return {
      totalApplications,
      pendingReview,
      approved,
      rejected,
      averageProcessingTime,
      verificationsByType: typeStats,
    };
  } catch (error) {
    console.error('Failed to get verification statistics:', error);
    throw new Error('Unable to retrieve verification statistics');
  }
}

/**
 * Checks if a user is a verified professional
 */
export async function isVerifiedProfessional(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      verificationStatus: true,
      professionalType: true,
    },
  });
  
  return user?.verificationStatus === 'APPROVED' && user?.professionalType !== null;
}

/**
 * Gets professional verification details (admin view)
 */
export async function getProfessionalVerificationDetails(userId: string): Promise<{
  user: User;
  verificationData?: ProfessionalVerificationData;
  auditLogs: any[];
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  let verificationData;
  if (user.licenseNumber) {
    try {
      // Decrypt verification data
      verificationData = decryptVerificationData(
        Buffer.from(user.licenseNumber, 'base64'),
        userId,
        Buffer.alloc(32), // Salt - would be stored separately
        'placeholder_hash' // Hash - would be stored separately
      );
    } catch (error) {
      console.error('Failed to decrypt verification data:', error);
    }
  }
  
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      resourceId: userId,
      action: {
        contains: 'VERIFICATION',
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: 20,
  });
  
  return {
    user,
    verificationData,
    auditLogs,
  };
}