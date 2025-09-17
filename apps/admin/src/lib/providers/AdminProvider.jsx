'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
const AdminContext = createContext(null);
export function AdminProvider({ children }) {
    // Helper function to map volunteer status from Volunteer to VolunteerInfo format
    const mapVolunteerStatus = (status) => {
        switch (status) {
            case 'available':
                return 'online';
            case 'emergency':
            case 'training':
                return 'busy';
            case 'break':
                return 'away';
            case 'offline':
                return 'offline';
            case 'busy':
                return 'busy';
            default:
                return 'offline';
        }
    };
    // Helper function to map connection status
    const mapConnectionStatus = (status) => {
        switch (status) {
            case 'connected':
                return 'connected';
            case 'connecting':
                return 'connected'; // Map connecting to connected for compatibility
            case 'disconnected':
                return 'disconnected';
            case 'error':
                return 'error';
            default:
                return 'disconnected';
        }
    };
    const [store, setStore] = useState({
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
    const [ws, setWs] = useState(null);
    const fetchAlerts = async () => {
        try {
            const response = await fetch('/api/admin/alerts');
            if (response.ok) {
                const alerts = await response.json();
                setStore(prev => ({ ...prev, alerts }));
            }
        }
        catch (error) {
            console.error('Failed to fetch alerts:', error);
        }
    };
    const fetchCrisisSessions = async () => {
        try {
            const response = await fetch('/api/admin/sessions');
            if (response.ok) {
                const sessions = await response.json();
                setStore(prev => ({ ...prev, sessions }));
            }
        }
        catch (error) {
            console.error('Failed to fetch crisis sessions:', error);
        }
    };
    const fetchVolunteers = async () => {
        try {
            const response = await fetch('/api/admin/volunteers');
            if (response.ok) {
                const volunteers = await response.json();
                setStore(prev => ({ ...prev, volunteers }));
            }
        }
        catch (error) {
            console.error('Failed to fetch volunteers:', error);
        }
    };
    const dismissAlert = async (alertId) => {
        try {
            const response = await fetch(`/api/admin/alerts/${alertId}/dismiss`, {
                method: 'POST'
            });
            if (response.ok) {
                setStore(prev => ({
                    ...prev,
                    alerts: prev.alerts.filter(alert => alert.id !== alertId)
                }));
            }
        }
        catch (error) {
            console.error('Failed to dismiss alert:', error);
            throw error;
        }
    };
    const escalateAlert = async (alertId) => {
        try {
            const response = await fetch(`/api/admin/alerts/${alertId}/escalate`, {
                method: 'POST'
            });
            if (response.ok) {
                setStore(prev => ({
                    ...prev,
                    alerts: prev.alerts.map(alert => alert.id === alertId
                        ? { ...alert, priority: 'critical' }
                        : alert)
                }));
            }
        }
        catch (error) {
            console.error('Failed to escalate alert:', error);
            throw error;
        }
    };
    const assignVolunteerToSession = async (sessionId, volunteerId) => {
        try {
            const response = await fetch(`/api/admin/sessions/${sessionId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ volunteerId })
            });
            if (response.ok) {
                setStore(prev => ({
                    ...prev,
                    sessions: prev.sessions.map(session => session.id === sessionId
                        ? { ...session, assignedVolunteer: volunteerId }
                        : session)
                }));
            }
        }
        catch (error) {
            console.error('Failed to assign volunteer to session:', error);
            throw error;
        }
    };
    const escalateIncident = async (sessionId) => {
        try {
            const response = await fetch(`/api/admin/sessions/${sessionId}/escalate`, {
                method: 'POST'
            });
            if (response.ok) {
                // Update session status
                setStore(prev => ({
                    ...prev,
                    sessions: prev.sessions.map(session => session.id === sessionId
                        ? { ...session, status: 'escalated' }
                        : session)
                }));
            }
        }
        catch (error) {
            console.error('Failed to escalate incident:', error);
        }
    };
    const assignVolunteer = async (sessionId, volunteerId) => {
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
                    sessions: prev.sessions.map(session => session.id === sessionId
                        ? { ...session, assignedVolunteer: volunteerId }
                        : session)
                }));
            }
        }
        catch (error) {
            console.error('Failed to assign volunteer:', error);
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
                const stats = {
                    activeSessions: sessions.filter((s) => s.status === 'active').length,
                    onlineVolunteers: volunteers.filter((v) => v.status === 'online').length,
                    criticalAlerts: alerts.filter((a) => a.priority === 'critical').length,
                    averageResponseTime: sessions.reduce((acc, s) => acc + (s.created_at ? Date.now() - new Date(s.created_at).getTime() : 0), 0) / sessions.length || 0
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
        }
        catch (error) {
            console.error('Failed to refresh data:', error);
        }
    };
    // Initialize WebSocket connection
    useEffect(() => {
        const connectWebSocket = () => {
            const websocket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
            websocket.onopen = () => {
                console.log('Admin WebSocket connected');
                setStore(prev => ({ ...prev, connectionStatus: 'connected' }));
            };
            websocket.onclose = () => {
                console.log('Admin WebSocket disconnected');
                setStore(prev => ({ ...prev, connectionStatus: 'disconnected' }));
                // Attempt to reconnect after 5 seconds
                setTimeout(connectWebSocket, 5000);
            };
            websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                setStore(prev => ({ ...prev, connectionStatus: 'error' }));
            };
            websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    switch (data.type) {
                        case 'session_update':
                            setStore(prev => ({
                                ...prev,
                                sessions: prev.sessions.map(session => session.id === data.session.id ? data.session : session)
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
                                volunteers: prev.volunteers.map(volunteer => volunteer.id === data.volunteer.id ? data.volunteer : volunteer)
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
                            console.log('Unknown message type:', data.type);
                    }
                }
                catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
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
    // Create the flat context value structure to match AdminContextType
    // Transform volunteers to match VolunteerInfo interface
    const transformedVolunteers = store.volunteers.map((volunteer) => ({
        id: volunteer.id,
        name: volunteer.name,
        email: volunteer.email,
        status: mapVolunteerStatus(volunteer.status),
        specializations: volunteer.specializations,
        currentSessions: volunteer.currentSessions,
        lastActive: volunteer.performanceMetrics?.lastActive?.toISOString() || new Date().toISOString()
    }));
    const contextValue = {
        // Direct access to data properties
        alerts: store.alerts,
        crisisSessions: store.sessions,
        volunteers: transformedVolunteers,
        systemHealth: store.systemHealth,
        stats: store.stats,
        connectionStatus: mapConnectionStatus(store.connectionStatus),
        isLoading: store.isLoading,
        lastUpdated: store.lastUpdated,
        // Action methods
        fetchAlerts,
        fetchCrisisSessions,
        fetchVolunteers,
        dismissAlert,
        escalateAlert,
        assignVolunteerToSession,
        refreshData
    };
    return (<AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>);
}
export function useAdminStore() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdminStore must be used within an AdminProvider');
    }
    return context;
}
//# sourceMappingURL=AdminProvider.jsx.map