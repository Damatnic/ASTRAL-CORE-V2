/**
 * @astral/self-help
 * 
 * Comprehensive self-help resources module for the ASTRAL Core V2 platform.
 * Provides evidence-based therapeutic tools, interactive exercises, educational
 * content, and progress tracking to support users between crisis interventions
 * and therapy sessions.
 */

// Core module exports
export * from './types';
export * from './services';
export * from './components';
export * from './hooks';
export * from './utils';

// Main module interface
import { 
  TherapeuticToolsEngine,
  ProgressTracker,
  EducationalLibrary,
  PreventionSystem,
  PlatformConnector,
  InsightsEngine
} from './services';

export interface SelfHelpModule {
  tools: TherapeuticToolsEngine;
  tracking: ProgressTracker;
  content: EducationalLibrary;
  crisis: PreventionSystem;
  integration: PlatformConnector;
  analytics: InsightsEngine;
}

// Initialize self-help module
export async function initializeSelfHelp(config: SelfHelpConfig): Promise<SelfHelpModule> {
  const tools = new TherapeuticToolsEngine(config);
  const tracking = new ProgressTracker(config);
  const content = new EducationalLibrary(config);
  const crisis = new PreventionSystem(config);
  const integration = new PlatformConnector(config);
  const analytics = new InsightsEngine(config);

  // Initialize all services
  await Promise.all([
    tools.initialize(),
    tracking.initialize(),
    content.initialize(),
    crisis.initialize(),
    integration.initialize(),
    analytics.initialize()
  ]);

  return {
    tools,
    tracking,
    content,
    crisis,
    integration,
    analytics
  };
}

// Configuration interface
export interface SelfHelpConfig {
  database: DatabaseConfig;
  ai: AIConfig;
  crisis: CrisisConfig;
  storage: StorageConfig;
  analytics: AnalyticsConfig;
  features: FeatureFlags;
}

interface DatabaseConfig {
  connectionString: string;
  poolSize?: number;
  timeout?: number;
}

interface AIConfig {
  openaiApiKey: string;
  modelVersion?: string;
  maxTokens?: number;
  temperature?: number;
}

interface CrisisConfig {
  escalationThreshold: number;
  emergencyNumbers: string[];
  volunteerWebsocket: string;
}

interface StorageConfig {
  s3Bucket: string;
  cdnUrl: string;
  maxFileSize?: number;
}

interface AnalyticsConfig {
  trackingId?: string;
  enabledMetrics: string[];
  samplingRate?: number;
}

interface FeatureFlags {
  enableAIInsights?: boolean;
  enableOfflineMode?: boolean;
  enableBetaFeatures?: boolean;
  enableClinicalMode?: boolean;
}