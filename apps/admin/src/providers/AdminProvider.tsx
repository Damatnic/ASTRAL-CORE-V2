'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { logger } from '@astralcore/shared';
import type {
  AdminStore,
  AdminActions,
  AdminProviderValue,
  CrisisAlert,
  CrisisSession,
  VolunteerStatus,
  SystemHealth,
  EmergencyAction,
  AdminUser
} from '../types/admin.types';

interface AdminContextType {
  store: AdminStore;
  actions: {
    dismissAlert: (alertId: string) => void;
    escalateIncident: (sessionId: string) => void;
    assignVolunteer: (sessionId: string, volunteerId: string) => void;
    refreshData: () => Promise<void>;
  };
}

const AdminContext = createContext<AdminContextType | null>(null);

interface AdminProviderProps {
  children: React.ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [store, setStore] = useState<AdminStore>({
    sessions: [],
    volunteers: [],
    systemHealth: {
      timestamp: new Date().toISOString(),
      infrastructure: {
        cpu_usage: 0,
        memory_usage: 0,
        disk_usage: 0,
        network_latency: 0
      },
      services: {
        database: {
          status: 'healthy',
          response_time: 0,
          last_check: new Date().toISOString(),
          error_rate: 0
        },
        websocket: {
          status: 'healthy',
          response_time: 0,
          last_check: new Date().toISOString(),
          error_rate: 0
        },
        ai_moderation: {
          status: 'healthy',
          response_time: 0,
          last_check: new Date().toISOString(),
          error_rate: 0
        },
        crisis_detection: {
          status: 'healthy',
          response_time: 0,
          last_check: new Date().toISOString(),
          error_rate: 0
        },
        volunteer_matching: {
          status: 'healthy',
          response_time: 0,
          last_check: new Date().toISOString(),
          error_rate: 0
        }
      },
      metrics: {
        active_sessions: 0,
        total_volunteers_online: 0,
        average_response_time: 0,
        system_uptime: 0
      }
    },
    alerts: [],
    stats: {
      activeSessions: 0,
      onlineVolunteers: 0,
      criticalAlerts: 0,
      averageResponseTime: 0
    },
    connectionStatus: 'disconnected',
    isLoading: false,
    lastUpdated: new Date().toISOString()
  });

  // WebSocket connection
  const [ws, setWs] = useState<WebSocket | null>(null);

  const dismissAlert = (alertId: string) => {
    setStore(prev => ({
      ...prev,
      alerts: prev.alerts.filter(alert => alert.id !== alertId)
    }));
  };

  const escalateIncident = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/escalate`, {
        method: 'POST'
      });
      if (response.ok) {
        // Update session status
        setStore(prev => ({
          ...prev,
          sessions: prev.sessions.map(session =>
            session.id === sessionId
              ? { ...session, status: 'escalated' as CrisisStatusType }
              : session
          )
        }));
      }
    } catch (error) {
      logger.error('AdminProvider', 'Failed to escalate incident', error as Error, { sessionId });
    }
  };

  const assignVolunteer = async (sessionId: string, volunteerId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId })
      });
      if (response.ok) {
        // Update session assignment
        setStore(prev => ({
          ...prev,
          sessions: prev.sessions.map(session =>
            session.id === sessionId
              ? { ...session, assignedVolunteer: volunteerId }
              : session
          )
        }));
      }
    } catch (error) {
      logger.error('AdminProvider', 'Failed to assign volunteer', error as Error, { sessionId, volunteerId });
    }
  };

  const refreshData = async () => {
    try {
      const [sessionsRes, volunteersRes, healthRes, alertsRes] = await Promise.all([
        fetch('/api/admin/sessions'),
        fetch('/api/admin/volunteers'),
        fetch('/api/admin/system-health'),
        fetch('/api/admin/alerts')
      ]);

      if (sessionsRes.ok && volunteersRes.ok && healthRes.ok && alertsRes.ok) {
        const [sessions, volunteers, systemHealth, alerts] = await Promise.all([
          sessionsRes.json(),
          volunteersRes.json(),
          healthRes.json(),
          alertsRes.json()
        ]);

        const stats: QuickStats = {
          activeSessions: sessions.filter((s: CrisisSession) => s.status === 'active').length,
          onlineVolunteers: volunteers.filter((v: VolunteerInfo) => v.status === 'online').length,
          criticalAlerts: alerts.filter((a: Alert) => a.priority === 'critical').length,
          averageResponseTime: sessions.reduce((acc: number, s: CrisisSession) => acc + (s.created_at ? Date.now() - new Date(s.created_at).getTime() : 0), 0) / sessions.length || 0
        };

        setStore(prev => ({
          ...prev,
          sessions,
          volunteers,
          systemHealth,
          alerts,
          stats
        }));
      }
    } catch (error) {
      logger.error('AdminProvider', 'Failed to refresh admin data', error as Error);
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const websocket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
      
      websocket.onopen = () => {
        logger.info('AdminProvider', 'Admin WebSocket connected successfully');
        setStore(prev => ({ ...prev, connectionStatus: 'connected' }));
      };

      websocket.onclose = () => {
        logger.warn('AdminProvider', 'Admin WebSocket disconnected, attempting reconnect');
        setStore(prev => ({ ...prev, connectionStatus: 'disconnected' }));
        
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      websocket.onerror = (error) => {
        logger.error('AdminProvider', 'Admin WebSocket error occurred', error as any);
        setStore(prev => ({ ...prev, connectionStatus: 'error' }));
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'session_update':
              setStore(prev => ({
                ...prev,
                sessions: prev.sessions.map(session =>
                  session.id === data.session.id ? data.session : session
                )
              }));
              break;
              
            case 'new_session':
              setStore(prev => ({
                ...prev,
                sessions: [...prev.sessions, data.session],
                stats: {
                  ...prev.stats,
                  activeSessions: prev.stats.activeSessions + 1
                }
              }));
              break;
              
            case 'volunteer_status':
              setStore(prev => ({
                ...prev,
                volunteers: prev.volunteers.map(volunteer =>
                  volunteer.id === data.volunteer.id ? data.volunteer : volunteer
                )
              }));
              break;
              
            case 'system_health':
              setStore(prev => ({
                ...prev,
                systemHealth: data.health
              }));
              break;
              
            case 'new_alert':
              setStore(prev => ({
                ...prev,
                alerts: [...prev.alerts, data.alert],
                stats: data.alert.priority === 'critical'
                  ? { ...prev.stats, criticalAlerts: prev.stats.criticalAlerts + 1 }
                  : prev.stats
              }));
              break;
              
            default:
              logger.warn('AdminProvider', 'Unknown WebSocket message type received', { type: data.type });
          }
        } catch (error) {
          logger.error('AdminProvider', 'Failed to parse WebSocket message', error as Error);
        }
      };

      setWs(websocket);
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  const actions = {
    dismissAlert,
    escalateIncident,
    assignVolunteer,
    refreshData
  };

  return (
    <AdminContext.Provider value={{ store, actions }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminStore() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminStore must be used within an AdminProvider');
  }
  return context;
}