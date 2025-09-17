/**
 * ASTRAL_CORE 2.0 Content Moderation Types
 * Type definitions for content moderation and filtering systems
 */

export interface ModerationResult {
  id: string;
  content: string;
  contentType: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE';
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'NEEDS_REVIEW';
  score: number;
  violations: ModerationViolation[];
  categories: ModerationCategory[];
  confidence: number;
  processingTime: number;
  reviewedBy?: string;
  reviewedAt?: Date;
  metadata: ModerationMetadata;
}

export interface ModerationViolation {
  type: 'TOXICITY' | 'HARASSMENT' | 'HATE_SPEECH' | 'VIOLENCE' | 'SEXUAL_CONTENT' | 'SPAM' | 'MISINFORMATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  confidence: number;
  location?: {
    start: number;
    end: number;
    context: string;
  };
}

export interface ModerationCategory {
  name: string;
  score: number;
  threshold: number;
  subcategories?: string[];
}

export interface ModerationMetadata {
  sourceIp?: string;
  userAgent?: string;
  sessionId?: string;
  userId?: string;
  timestamp: Date;
  contentLength: number;
  language?: string;
  geoLocation?: {
    country: string;
    region: string;
    city?: string;
  };
}

export interface ContentFilterRule {
  id: string;
  name: string;
  description: string;
  pattern: string | RegExp;
  action: 'BLOCK' | 'FLAG' | 'REPLACE' | 'ESCALATE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  enabled: boolean;
  categories: string[];
  replacement?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModerationQueue {
  id: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  contentId: string;
  content: string;
  submittedAt: Date;
  assignedTo?: string;
  estimatedReviewTime: number;
  tags: string[];
  context?: Record<string, any>;
}

export interface ModeratorAction {
  id: string;
  moderatorId: string;
  contentId: string;
  action: 'APPROVE' | 'REJECT' | 'EDIT' | 'ESCALATE' | 'REQUEST_MORE_INFO';
  reason: string;
  notes?: string;
  timestamp: Date;
  reviewDuration: number;
}

export interface ModerationStats {
  totalItems: number;
  approved: number;
  rejected: number;
  pending: number;
  averageReviewTime: number;
  accuracyRate: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  throughputPerHour: number;
}