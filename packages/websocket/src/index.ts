/**
 * ASTRAL_CORE 2.0 WebSocket Package
 * Real-time communication for crisis intervention
 */

export { CrisisWebSocketClient } from './CrisisWebSocketClient';
export { CrisisWebSocketServer } from './CrisisWebSocketServer';
export { useCrisisWebSocket } from './hooks/useCrisisWebSocket';

export type {
  ConnectionConfig,
  ConnectionState
} from './CrisisWebSocketClient';

export type {
  UseCrisisWebSocketOptions,
  CrisisWebSocketState,
  CrisisWebSocketActions
} from './hooks/useCrisisWebSocket';

export type {
  CrisisMessage,
  EmergencyAlert
} from './CrisisWebSocketServer';