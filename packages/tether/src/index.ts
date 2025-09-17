/**
 * ASTRAL_CORE 2.0 Tether Connection System
 * 
 * REVOLUTIONARY PEER SUPPORT INNOVATION:
 * - Persistent emotional connections between users
 * - Real-time heartbeat monitoring for wellbeing
 * - Emergency pulse system for instant help
 * - AI-powered compatibility matching
 * - Privacy-first design with optional data sharing
 * 
 * CORE CONCEPT:
 * A "Tether" is a persistent emotional bond between a person seeking support 
 * and a trusted peer supporter. Unlike traditional crisis intervention that 
 * ends when the session ends, Tethers create lasting connections that provide 
 * ongoing emotional security and immediate access to help when needed.
 * 
 * PERFORMANCE TARGETS:
 * - Pulse response: <100ms
 * - Emergency activation: <50ms
 * - Connection establishment: <500ms
 * - Heartbeat monitoring: 99.99% uptime
 */

export { TetherEngine } from './engines/TetherEngine';
export { TetherMatchingSystem } from './matching/TetherMatchingSystem';
export { EmergencyPulseSystem } from './emergency/EmergencyPulseSystem';
export { TetherHeartbeatMonitor } from './monitoring/TetherHeartbeatMonitor';
export { TetherEncryption } from './encryption/TetherEncryption';

// Zero-Knowledge Encryption System
export { 
  ZeroKnowledgeEncryption, 
  zeroKnowledgeEncryption 
} from './encryption';
export { 
  BrowserZeroKnowledgeEncryption, 
  browserZeroKnowledgeEncryption 
} from './browser-encryption';

// Types
export * from './types/tether.types';
export * from './types/pulse.types';
export * from './types/emergency.types';
export * from './types/matching.types';
export * from './types/encryption.types';

// Constants
export const TETHER_CONSTANTS = {
  // Connection parameters
  DEFAULT_PULSE_INTERVAL_SECONDS: 30,
  MAX_MISSED_PULSES: 3,
  EMERGENCY_PULSE_TIMEOUT_MS: 5000,
  
  // Matching thresholds
  MIN_COMPATIBILITY_SCORE: 0.7,
  MAX_CONNECTIONS_PER_USER: 5,
  MATCHING_TIMEOUT_MS: 10000,
  
  // Emergency response
  EMERGENCY_ESCALATION_TIME_MS: 120000, // 2 minutes
  MAX_EMERGENCY_RESPONDERS: 3,
  EMERGENCY_BROADCAST_RADIUS: 50, // km
  
  // Security
  TETHER_DATA_ENCRYPTION: 'aes-256-gcm',
  MAX_TETHER_DURATION_DAYS: 90,
  PULSE_ENCRYPTION_ENABLED: true,
  
  // Performance
  HEARTBEAT_BATCH_SIZE: 100,
  PULSE_PROCESSING_TIMEOUT_MS: 1000,
  CONNECTION_HEALTH_CHECK_INTERVAL_MS: 60000,
} as const;

// Tether strength calculation algorithm
export function calculateTetherStrength(interactions: {
  totalMessages: number;
  averageResponseTime: number;
  positiveInteractions: number;
  emergencyResponseTime?: number;
  durationDays: number;
}): number {
  let strength = 0.5; // Base strength
  
  // Message frequency contribution (0-0.2)
  const messageFrequency = Math.min(interactions.totalMessages / 100, 1);
  strength += messageFrequency * 0.2;
  
  // Response time contribution (0-0.15)
  const responseScore = Math.max(0, 1 - (interactions.averageResponseTime / 3600000)); // 1 hour max
  strength += responseScore * 0.15;
  
  // Positive interaction ratio (0-0.2)
  const positivityScore = interactions.totalMessages > 0 
    ? interactions.positiveInteractions / interactions.totalMessages 
    : 0;
  strength += positivityScore * 0.2;
  
  // Emergency response bonus (0-0.1)
  if (interactions.emergencyResponseTime !== undefined) {
    const emergencyScore = Math.max(0, 1 - (interactions.emergencyResponseTime / 300000)); // 5 minutes max
    strength += emergencyScore * 0.1;
  }
  
  // Duration stability (0-0.15)
  const durationScore = Math.min(interactions.durationDays / 30, 1); // 30 days for max
  strength += durationScore * 0.15;
  
  // Trust building over time (0-0.2)
  const trustScore = Math.min(interactions.durationDays / 60, 1); // 60 days for max trust
  strength += trustScore * 0.2;
  
  return Math.min(Math.max(strength, 0), 1);
}