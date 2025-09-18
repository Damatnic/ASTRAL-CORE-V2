/**
 * Type definitions for the self-help module
 */

// Re-export all type modules
export * from './mood';
export * from './exercises';
export * from './crisis';
// The following exports are not yet implemented:
// export * from './journal';
// export * from './therapy';
// export * from './content';
// export * from './progress';
// export * from './user';

// Common types
export type UUID = string;
export type Timestamp = Date | string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Timestamp;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: Timestamp;
  version: string;
  duration?: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Date range
export interface DateRange {
  start: Timestamp;
  end: Timestamp;
}

// Effectiveness tracking
export interface EffectivenessRating {
  score: number; // 1-5 scale
  timestamp: Timestamp;
  context?: string;
  notes?: string;
}

// Media content
export interface MediaContent {
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  duration?: number; // seconds for video/audio
  size?: number; // bytes
  mimeType?: string;
  alt?: string;
  transcript?: string; // for audio/video
}

// Location data
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  address?: string;
}

// Weather data
export interface WeatherData {
  temperature: number;
  condition: string;
  humidity?: number;
  pressure?: number;
  windSpeed?: number;
}