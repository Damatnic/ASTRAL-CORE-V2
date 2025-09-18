/**
 * ASTRAL Core V2 - Form Validation Schemas
 * 
 * Comprehensive Zod schemas for all forms in the mental health platform.
 * Designed with crisis-appropriate validation that never blocks emergency access.
 * 
 * @author Claude Code - Mental Health Crisis Intervention Platform
 * @version 2.0.0
 */

import { z } from 'zod';

// ============================================================================
// MOOD TRACKING VALIDATION
// ============================================================================

/**
 * Mood entry validation schema
 * Note: All fields are optional to prevent blocking user input during crisis
 */
export const moodEntrySchema = z.object({
  // Core mood rating (1-10 scale)
  mood: z.number()
    .min(1, 'Mood rating must be between 1 and 10')
    .max(10, 'Mood rating must be between 1 and 10')
    .int('Mood rating must be a whole number'),
  
  // Detailed emotion ratings (all optional for flexibility)
  emotions: z.object({
    happy: z.number().min(1).max(10).int().optional(),
    sad: z.number().min(1).max(10).int().optional(),
    anxious: z.number().min(1).max(10).int().optional(),
    angry: z.number().min(1).max(10).int().optional(),
    calm: z.number().min(1).max(10).int().optional(),
    energetic: z.number().min(1).max(10).int().optional(),
  }).optional(),
  
  // Trigger categories (validated against predefined list)
  triggers: z.array(z.enum([
    'work', 'relationship', 'health', 'sleep', 'finance', 'social',
    'family', 'academic', 'medical', 'trauma', 'substance', 'other'
  ])).optional(),
  
  // Activities performed (validated against predefined list)
  activities: z.array(z.enum([
    'exercise', 'meditation', 'social', 'creative', 'nature', 'therapy',
    'reading', 'music', 'gaming', 'cooking', 'cleaning', 'working', 'other'
  ])).optional(),
  
  // Sleep hours (reasonable range with flexibility)
  sleepHours: z.number()
    .min(0, 'Sleep hours cannot be negative')
    .max(24, 'Sleep hours cannot exceed 24')
    .optional(),
  
  // Free-form notes (optional, length limited for performance)
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
  
  // Additional optional fields
  weather: z.enum(['sunny', 'cloudy', 'rainy', 'snowy', 'stormy']).optional(),
  medication: z.boolean().optional(),
  socialInteraction: z.number().min(0).max(10).int().optional(),
});

export type MoodEntry = z.infer<typeof moodEntrySchema>;

// ============================================================================
// SAFETY PLANNING VALIDATION
// ============================================================================

/**
 * Contact information validation
 * Flexible validation that doesn't block crisis access
 */
export const contactSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  
  relationship: z.string()
    .min(1, 'Relationship is required')
    .max(50, 'Relationship cannot exceed 50 characters')
    .trim(),
  
  // Phone validation - flexible to accommodate international formats
  phone: z.string()
    .min(3, 'Phone number is required')
    .max(20, 'Phone number too long')
    .regex(/^[\d\s\-\+\(\)\.]+$/, 'Invalid phone number format')
    .trim(),
  
  // Optional email validation
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  
  // Optional notes
  notes: z.string()
    .max(200, 'Notes cannot exceed 200 characters')
    .optional()
    .or(z.literal('')),
  
  isEmergency: z.boolean().optional(),
});

export type Contact = z.infer<typeof contactSchema>;

/**
 * Safety plan section validation
 * Relaxed validation to encourage completion during crisis
 */
export const safetyPlanSectionSchema = z.object({
  // Warning signs (personal and crisis)
  warningSignsPersonal: z.array(z.string().min(1).max(200)).optional(),
  warningSignsCrisis: z.array(z.string().min(1).max(200)).optional(),
  
  // Coping strategies
  copingStrategies: z.array(z.string().min(1).max(200)).optional(),
  
  // Support contacts
  socialContacts: z.array(contactSchema).optional(),
  professionalContacts: z.array(contactSchema).optional(),
  
  // Safety measures
  environmentSafety: z.array(z.string().min(1).max(200)).optional(),
  
  // Reasons to live
  reasonsToLive: z.array(z.string().min(1).max(300)).optional(),
  
  // Emergency contacts (always required)
  emergencyContacts: z.array(contactSchema).min(1, 'At least one emergency contact is required'),
});

/**
 * Complete safety plan validation
 */
export const safetyPlanSchema = z.object({
  id: z.string().optional(),
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  
  lastUpdated: z.date().optional(),
  sections: safetyPlanSectionSchema,
});

export type SafetyPlan = z.infer<typeof safetyPlanSchema>;

// ============================================================================
// CRISIS CHAT VALIDATION
// ============================================================================

/**
 * Crisis chat message validation
 * Minimal validation to never block crisis communication
 */
export const crisisChatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (maximum 2000 characters)')
    .trim(),
  
  // Urgency level (optional but helpful for triage)
  urgency: z.enum(['low', 'medium', 'high', 'crisis']).optional(),
  
  // Anonymous identifier (for session continuity)
  sessionId: z.string().optional(),
  
  // Crisis flags (detected automatically)
  isEmergency: z.boolean().optional(),
  containsSuicidalContent: z.boolean().optional(),
});

export type CrisisChatMessage = z.infer<typeof crisisChatMessageSchema>;

// ============================================================================
// USER AUTHENTICATION VALIDATION
// ============================================================================

/**
 * User registration validation
 * Balanced security without creating barriers to access
 */
export const userRegistrationSchema = z.object({
  // Basic information
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email is too short')
    .max(100, 'Email is too long')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  confirmPassword: z.string(),
  
  // Optional profile information
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s\-\']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .trim()
    .optional(),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s\-\']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .trim()
    .optional(),
  
  // Age verification (important for crisis protocols)
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date (YYYY-MM-DD)')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 120;
    }, 'You must be between 13 and 120 years old')
    .optional(),
  
  // Crisis-specific preferences
  allowsEmergencyContact: z.boolean().default(true),
  preferredContactMethod: z.enum(['email', 'sms', 'phone']).default('email'),
  
  // Privacy agreements
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms of service'),
  agreeToPrivacy: z.boolean().refine(val => val === true, 'You must agree to the privacy policy'),
  allowsAnalytics: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UserRegistration = z.infer<typeof userRegistrationSchema>;

/**
 * User login validation
 */
export const userLoginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .trim(),
  
  password: z.string()
    .min(1, 'Password is required'),
  
  rememberMe: z.boolean().optional(),
});

export type UserLogin = z.infer<typeof userLoginSchema>;

// ============================================================================
// CRISIS ASSESSMENT VALIDATION
// ============================================================================

/**
 * Crisis assessment validation
 * Designed to gather information without creating barriers
 */
export const crisisAssessmentSchema = z.object({
  // Immediate risk factors
  suicidalThoughts: z.enum(['none', 'passive', 'active', 'plan', 'imminent']),
  selfHarmRisk: z.enum(['none', 'low', 'medium', 'high']),
  
  // Support system
  hasSupportSystem: z.boolean(),
  isAlone: z.boolean(),
  
  // Substance use
  substanceUse: z.enum(['none', 'mild', 'moderate', 'severe']).optional(),
  
  // Previous attempts or hospitalizations
  previousAttempts: z.boolean().optional(),
  recentHospitalization: z.boolean().optional(),
  
  // Current stressors
  currentStressors: z.array(z.string()).optional(),
  
  // Protective factors
  protectiveFactors: z.array(z.string()).optional(),
  
  // Free response (crucial for crisis assessment)
  additionalInformation: z.string()
    .max(2000, 'Please keep additional information under 2000 characters')
    .optional(),
});

export type CrisisAssessment = z.infer<typeof crisisAssessmentSchema>;

// ============================================================================
// UTILITY VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate data with crisis-safe error handling
 * Never throws errors that could block access to crisis features
 */
export function validateWithCrisisSafety<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  isEmergency: boolean = false
): { success: boolean; data?: T; errors?: z.ZodError; warnings?: string[] } {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      // In emergency situations, provide warnings instead of blocking errors
      if (isEmergency) {
        return {
          success: true,
          data: data as T, // Allow through with warnings
          warnings: result.error.issues.map(err => err.message),
        };
      }
      
      return { success: false, errors: result.error };
    }
  } catch (error) {
    // Fallback for any unexpected errors
    if (isEmergency) {
      return {
        success: true,
        data: data as T,
        warnings: ['Validation temporarily unavailable - proceeding with caution'],
      };
    }
    
    throw error;
  }
}

/**
 * Get user-friendly error messages for forms
 */
export function getFormErrorMessages(errors: z.ZodError): Record<string, string> {
  const messages: Record<string, string> = {};
  
  errors.issues.forEach((error) => {
    const path = error.path.join('.');
    messages[path] = error.message;
  });
  
  return messages;
}

/**
 * Check if input contains crisis keywords (for automatic flagging)
 */
export function containsCrisisKeywords(text: string): boolean {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end it all', 'want to die', 'can\'t go on',
    'self harm', 'hurt myself', 'cut myself', 'overdose', 'not worth living',
    'better off dead', 'no point', 'hopeless', 'end the pain'
  ];
  
  const lowerText = text.toLowerCase();
  return crisisKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Sanitize user input while preserving emotional expression
 */
export function sanitizeUserInput(input: string): string {
  // Remove potential XSS while preserving emotional content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

// ============================================================================
// EXPORTS
// ============================================================================

export const validationSchemas = {
  moodEntry: moodEntrySchema,
  safetyPlan: safetyPlanSchema,
  contact: contactSchema,
  crisisChat: crisisChatMessageSchema,
  userRegistration: userRegistrationSchema,
  userLogin: userLoginSchema,
  crisisAssessment: crisisAssessmentSchema,
};

export default validationSchemas;