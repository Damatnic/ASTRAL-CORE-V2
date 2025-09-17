/**
 * ASTRAL_CORE 2.0 Volunteer Screen
 *
 * Volunteer dashboard for crisis support workers
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, RefreshControl, } from 'react-native';
import CrisisService from '../services/CrisisService';
const mockVolunteerStats = {
    totalSessions: 147,
    activeSessions: 2,
    averageRating: 4.8,
    hoursThisWeek: 12.5,
    successfulEscalations: 23,
    burnoutRisk: 'low',
};
const mockActiveSessions = [
    {
        id: 'session_001',
        userId: 'user_001',
        severity: 'high',
        startTime: new Date(Date.now() - 1800000), // 30 minutes ago
        lastActivity: new Date(Date.now() - 120000), // 2 minutes ago
        status: 'active',
        duration: 30,
        anonymous: true,
    },
    {
        id: 'session_002',
        userId: 'user_002',
        severity: 'medium',
        startTime: new Date(Date.now() - 600000), // 10 minutes ago
        lastActivity: new Date(Date.now() - 60000), // 1 minute ago
        status: 'waiting',
        duration: 10,
        anonymous: false,
    },
];
export default function VolunteerScreen() {
    const [isAvailable, setIsAvailable] = useState(true);
    const [volunteerStats, setVolunteerStats] = useState(mockVolunteerStats);
    const [activeSessions, setActiveSessions] = useState(mockActiveSessions);
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        loadVolunteerData();
    }, []);
    const loadVolunteerData = async () => {
        try {
            // In real implementation, load from volunteer service
            setVolunteerStats(mockVolunteerStats);
            setActiveSessions(mockActiveSessions);
        }
        catch (error) {
            console.error('Failed to load volunteer data:', error);
        }
    };
    const onRefresh = async () => {
        setRefreshing(true);
        await loadVolunteerData();
        setRefreshing(false);
    };
    const handleAvailabilityToggle = async (available) => {
        try {
            setIsAvailable(available);
            // In real implementation, update volunteer availability
            if (available) {
                Alert.alert('You are now available', 'You will receive crisis session assignments');
            }
            else {
                Alert.alert('You are now offline', 'You will not receive new assignments');
            }
        }
        catch (error) {
            Alert.alert('Error', 'Failed to update availability status');
        }
    };
    const handleJoinSession = async (sessionId) => {
        try {
            Alert.alert('Join Crisis Session', 'Are you ready to join this crisis session?', [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Join Session',
                    onPress: async () => {
                        // In real implementation, join the session
                        Alert.alert('Joining Session', 'Connecting you to the crisis session...');
                    },
                },
            ]);
        }
        catch (error) {
            Alert.alert('Error', 'Failed to join session');
        }
    };
    const handleEscalateSession = async (sessionId) => {
        Alert.alert('Escalate to Emergency', 'This will immediately contact emergency services. Continue?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Escalate',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await CrisisService.escalateToEmergency();
                        Alert.alert('Emergency Services Contacted', 'Emergency services have been notified');
                    }
                    catch (error) {
                        Alert.alert('Error', 'Failed to escalate session');
                    }
                },
            },
        ]);
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#DC2626';
            case 'high': return '#F59E0B';
            case 'medium': return '#3B82F6';
            case 'low': return '#10B981';
            default: return '#6B7280';
        }
    };
    const getSeverityBadgeStyle = (severity) => ({
        backgroundColor: getSeverityColor(severity),
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    });
    const getBurnoutRiskColor = (risk) => {
        switch (risk) {
            case 'high': return '#DC2626';
            case 'medium': return '#F59E0B';
            case 'low': return '#10B981';
            default: return '#6B7280';
        }
    };
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };
    const renderAvailabilityCard = () => (<View style={styles.availabilityCard}>
      <View style={styles.availabilityHeader}>
        <Text style={styles.availabilityTitle}>Volunteer Status</Text>
        <View style={[
            styles.statusIndicator,
            { backgroundColor: isAvailable ? '#10B981' : '#6B7280' }
        ]}>
          <Text style={styles.statusText}>
            {isAvailable ? 'Available' : 'Offline'}
          </Text>
        </View>
      </View>
      
      <View style={styles.availabilityToggle}>
        <Text style={styles.toggleLabel}>
          {isAvailable ? 'Available for crisis sessions' : 'Currently offline'}
        </Text>
        <Switch value={isAvailable} onValueChange={handleAvailabilityToggle} trackColor={{ false: '#D1D5DB', true: '#10B981' }} thumbColor={isAvailable ? '#FFFFFF' : '#FFFFFF'}/>
      </View>
      
      {!isAvailable && (<Text style={styles.offlineNote}>
          You will not receive new crisis session assignments while offline
        </Text>)}
    </View>);
    const renderStatsCard = () => (<View style={styles.statsCard}>
      <Text style={styles.sectionTitle}>📊 Your Impact</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{volunteerStats.totalSessions}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{volunteerStats.activeSessions}</Text>
          <Text style={styles.statLabel}>Active Now</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>★ {volunteerStats.averageRating}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{volunteerStats.hoursThisWeek}h</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>
      
      <View style={styles.burnoutSection}>
        <Text style={styles.burnoutLabel}>Burnout Risk Assessment:</Text>
        <View style={[
            styles.burnoutBadge,
            { backgroundColor: getBurnoutRiskColor(volunteerStats.burnoutRisk) }
        ]}>
          <Text style={styles.burnoutText}>
            {volunteerStats.burnoutRisk.toUpperCase()}
          </Text>
        </View>
      </View>
      
      {volunteerStats.burnoutRisk !== 'low' && (<Text style={styles.burnoutWarning}>
          Consider taking a break or reducing session load
        </Text>)}
    </View>);
    const renderActiveSession = (session) => (<View key={session.id} style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionId}>
            Session {session.id.slice(-3).toUpperCase()}
          </Text>
          <View style={getSeverityBadgeStyle(session.severity)}>
            <Text style={styles.severityText}>
              {session.severity.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.sessionTiming}>
          <Text style={styles.sessionDuration}>
            {formatDuration(session.duration)}
          </Text>
          <Text style={styles.sessionStatus}>
            {session.status === 'waiting' ? '⏳ Waiting' : '💬 Active'}
          </Text>
        </View>
      </View>
      
      <View style={styles.sessionDetails}>
        <Text style={styles.sessionDetail}>
          Started: {session.startTime.toLocaleTimeString()}
        </Text>
        <Text style={styles.sessionDetail}>
          Last Activity: {session.lastActivity.toLocaleTimeString()}
        </Text>
        {session.anonymous && (<Text style={styles.anonymousTag}>🔒 Anonymous User</Text>)}
      </View>
      
      <View style={styles.sessionActions}>
        {session.status === 'waiting' ? (<TouchableOpacity style={styles.joinButton} onPress={() => handleJoinSession(session.id)}>
            <Text style={styles.joinButtonText}>Join Session</Text>
          </TouchableOpacity>) : (<TouchableOpacity style={styles.continueButton} onPress={() => handleJoinSession(session.id)}>
            <Text style={styles.continueButtonText}>Continue Chat</Text>
          </TouchableOpacity>)}
        
        <TouchableOpacity style={styles.escalateButton} onPress={() => handleEscalateSession(session.id)}>
          <Text style={styles.escalateButtonText}>🚨 Escalate</Text>
        </TouchableOpacity>
      </View>
    </View>);
    const renderActiveSessionsSection = () => (<View style={styles.activeSessionsSection}>
      <Text style={styles.sectionTitle}>
        🔴 Active Sessions ({activeSessions.length})
      </Text>
      
      {activeSessions.length === 0 ? (<View style={styles.noSessionsCard}>
          <Text style={styles.noSessionsText}>No active sessions</Text>
          <Text style={styles.noSessionsSubtext}>
            {isAvailable
                ? 'Waiting for crisis session assignments...'
                : 'Go online to receive session assignments'}
          </Text>
        </View>) : (activeSessions.map(renderActiveSession))}
    </View>);
    const renderQuickActions = () => (<View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionIcon}>📚</Text>
          <Text style={styles.quickActionText}>Training</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionIcon}>📋</Text>
          <Text style={styles.quickActionText}>Resources</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionIcon}>💬</Text>
          <Text style={styles.quickActionText}>Support Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionIcon}>⚙️</Text>
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>);
    return (<ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
      {renderAvailabilityCard()}
      {renderStatsCard()}
      {renderActiveSessionsSection()}
      {renderQuickActions()}
      
      <View style={styles.bottomPadding}/>
    </ScrollView>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    availabilityCard: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    availabilityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    availabilityTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statusIndicator: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    availabilityToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    toggleLabel: {
        fontSize: 16,
        color: '#374151',
        flex: 1,
    },
    offlineNote: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    statsCard: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        marginTop: 0,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    burnoutSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    burnoutLabel: {
        fontSize: 14,
        color: '#374151',
        marginRight: 8,
    },
    burnoutBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    burnoutText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    burnoutWarning: {
        fontSize: 14,
        color: '#F59E0B',
        fontStyle: 'italic',
    },
    activeSessionsSection: {
        margin: 16,
        marginTop: 0,
    },
    sessionCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sessionInfo: {
        flex: 1,
    },
    sessionId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    severityText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    sessionTiming: {
        alignItems: 'flex-end',
    },
    sessionDuration: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 4,
    },
    sessionStatus: {
        fontSize: 14,
        color: '#6B7280',
    },
    sessionDetails: {
        marginBottom: 16,
    },
    sessionDetail: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    anonymousTag: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
    sessionActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    joinButton: {
        backgroundColor: '#10B981',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
    },
    joinButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    continueButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    escalateButton: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
    },
    escalateButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    noSessionsCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    noSessionsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 8,
    },
    noSessionsSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    quickActionsSection: {
        margin: 16,
        marginTop: 0,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        backgroundColor: '#FFFFFF',
        width: '48%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        textAlign: 'center',
    },
    bottomPadding: {
        height: 32,
    },
});
//# sourceMappingURL=VolunteerScreen.jsx.map