/**
 * ASTRAL_CORE 2.0 Resources Screen
 *
 * Crisis resources, coping strategies, and self-help tools
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, } from 'react-native';
import OfflineService from '../services/OfflineService';
const mockResources = [
    {
        id: '1',
        title: 'National Suicide Prevention Lifeline',
        description: '24/7 crisis support and suicide prevention',
        type: 'contact',
        category: 'emergency',
        phone: '988',
    },
    {
        id: '2',
        title: 'Crisis Text Line',
        description: 'Text-based crisis support available 24/7',
        type: 'contact',
        category: 'emergency',
        phone: '741741',
    },
    {
        id: '3',
        title: '5-4-3-2-1 Grounding Technique',
        description: 'A simple technique to help manage anxiety and panic',
        type: 'tool',
        category: 'coping',
        content: `Look for:\n• 5 things you can see\n• 4 things you can touch\n• 3 things you can hear\n• 2 things you can smell\n• 1 thing you can taste`,
    },
    {
        id: '4',
        title: 'Box Breathing Exercise',
        description: 'Calming breathing technique for stress relief',
        type: 'tool',
        category: 'coping',
        content: `1. Breathe in for 4 counts\n2. Hold for 4 counts\n3. Breathe out for 4 counts\n4. Hold for 4 counts\n\nRepeat for 2-5 minutes`,
    },
    {
        id: '5',
        title: 'Understanding Depression',
        description: 'Educational resource about depression symptoms and treatment',
        type: 'article',
        category: 'education',
        url: 'https://www.nimh.nih.gov/health/topics/depression',
    },
];
export default function ResourcesScreen() {
    const [resources, setResources] = useState(mockResources);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [crisisTips, setCrisisTips] = useState([]);
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const categories = [
        { id: 'all', name: 'All Resources', icon: '📚' },
        { id: 'emergency', name: 'Emergency', icon: '🚨' },
        { id: 'crisis', name: 'Crisis Support', icon: '🆘' },
        { id: 'coping', name: 'Coping Tools', icon: '🧘' },
        { id: 'therapy', name: 'Therapy', icon: '💭' },
        { id: 'education', name: 'Education', icon: '📖' },
    ];
    useEffect(() => {
        loadOfflineResources();
    }, []);
    const loadOfflineResources = async () => {
        const offlineService = OfflineService.getInstance();
        setCrisisTips(offlineService.getCrisisTips());
        setEmergencyContacts(offlineService.getEmergencyContacts());
    };
    const filteredResources = selectedCategory === 'all'
        ? resources
        : resources.filter(resource => resource.category === selectedCategory);
    const handleResourcePress = (resource) => {
        if (resource.type === 'contact' && resource.phone) {
            Alert.alert(resource.title, resource.description, [
                {
                    text: 'Call Now',
                    onPress: () => Linking.openURL(`tel:${resource.phone}`),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]);
        }
        else if (resource.type === 'tool' && resource.content) {
            Alert.alert(resource.title, resource.content, [{ text: 'Got it' }]);
        }
        else if (resource.url) {
            Linking.openURL(resource.url).catch(() => {
                Alert.alert('Error', 'Unable to open link');
            });
        }
    };
    const renderCategoryTabs = () => (<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs} contentContainerStyle={styles.categoryTabsContent}>
      {categories.map((category) => (<TouchableOpacity key={category.id} style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive,
            ]} onPress={() => setSelectedCategory(category.id)}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={[
                styles.categoryName,
                selectedCategory === category.id && styles.categoryNameActive,
            ]}>
            {category.name}
          </Text>
        </TouchableOpacity>))}
    </ScrollView>);
    const renderResource = (resource) => {
        const getResourceIcon = () => {
            switch (resource.type) {
                case 'contact': return '📞';
                case 'article': return '📄';
                case 'video': return '🎥';
                case 'audio': return '🎧';
                case 'tool': return '🛠️';
                default: return '📋';
            }
        };
        const getUrgencyStyle = () => {
            if (resource.category === 'emergency') {
                return styles.emergencyResource;
            }
            if (resource.category === 'crisis') {
                return styles.crisisResource;
            }
            return {};
        };
        return (<TouchableOpacity key={resource.id} style={[styles.resourceCard, getUrgencyStyle()]} onPress={() => handleResourcePress(resource)}>
        <View style={styles.resourceHeader}>
          <Text style={styles.resourceIcon}>{getResourceIcon()}</Text>
          <View style={styles.resourceContent}>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            <Text style={styles.resourceDescription}>{resource.description}</Text>
          </View>
          <Text style={styles.resourceArrow}>›</Text>
        </View>
        
        {resource.category === 'emergency' && (<View style={styles.emergencyBadge}>
            <Text style={styles.emergencyBadgeText}>24/7 Available</Text>
          </View>)}
      </TouchableOpacity>);
    };
    const renderQuickAccess = () => (<View style={styles.quickAccessSection}>
      <Text style={styles.sectionTitle}>🚨 Quick Access</Text>
      <View style={styles.quickAccessGrid}>
        <TouchableOpacity style={styles.quickAccessButton} onPress={() => Linking.openURL('tel:911')}>
          <Text style={styles.quickAccessIcon}>🚑</Text>
          <Text style={styles.quickAccessText}>Call 911</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAccessButton} onPress={() => Linking.openURL('tel:988')}>
          <Text style={styles.quickAccessIcon}>☎️</Text>
          <Text style={styles.quickAccessText}>Suicide Hotline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAccessButton} onPress={() => handleResourcePress(mockResources[2])} // Grounding technique
    >
          <Text style={styles.quickAccessIcon}>🧘</Text>
          <Text style={styles.quickAccessText}>Grounding</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAccessButton} onPress={() => handleResourcePress(mockResources[3])} // Breathing exercise
    >
          <Text style={styles.quickAccessIcon}>💨</Text>
          <Text style={styles.quickAccessText}>Breathing</Text>
        </TouchableOpacity>
      </View>
    </View>);
    return (<View style={styles.container}>
      {renderQuickAccess()}
      {renderCategoryTabs()}
      
      <ScrollView style={styles.resourcesList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all' ? '📚 All Resources' : `${categories.find(c => c.id === selectedCategory)?.icon} ${categories.find(c => c.id === selectedCategory)?.name}`}
        </Text>
        
        {filteredResources.map(renderResource)}
        
        {/* Crisis Tips from Offline Service */}
        {selectedCategory === 'all' || selectedCategory === 'coping' ? (<View style={styles.offlineSection}>
            <Text style={styles.sectionTitle}>💡 Offline Coping Tips</Text>
            {crisisTips.slice(0, 3).map((tip) => (<View key={tip.id} style={styles.tipCard}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipContent}>{tip.content}</Text>
              </View>))}
          </View>) : null}
        
        <View style={styles.bottomPadding}/>
      </ScrollView>
    </View>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    quickAccessSection: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickAccessGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    quickAccessButton: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        minWidth: 70,
    },
    quickAccessIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    quickAccessText: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500',
        textAlign: 'center',
    },
    categoryTabs: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    categoryTabsContent: {
        paddingHorizontal: 16,
    },
    categoryTab: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        minWidth: 80,
    },
    categoryTabActive: {
        backgroundColor: '#3B82F6',
    },
    categoryIcon: {
        fontSize: 16,
        marginBottom: 2,
    },
    categoryName: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    categoryNameActive: {
        color: '#FFFFFF',
    },
    resourcesList: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    resourceCard: {
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
    emergencyResource: {
        borderLeftWidth: 4,
        borderLeftColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    crisisResource: {
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
        backgroundColor: '#FFFBEB',
    },
    resourceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resourceIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    resourceContent: {
        flex: 1,
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    resourceDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    resourceArrow: {
        fontSize: 20,
        color: '#9CA3AF',
    },
    emergencyBadge: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    emergencyBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    offlineSection: {
        marginTop: 24,
    },
    tipCard: {
        backgroundColor: '#F0F9FF',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E40AF',
        marginBottom: 8,
    },
    tipContent: {
        fontSize: 14,
        color: '#1F2937',
        lineHeight: 20,
    },
    bottomPadding: {
        height: 32,
    },
});
//# sourceMappingURL=ResourcesScreen.jsx.map