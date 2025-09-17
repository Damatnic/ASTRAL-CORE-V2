/**
 * ASTRAL_CORE 2.0 Chat Screen
 * 
 * Real-time crisis chat with volunteers and AI support
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'volunteer' | 'ai' | 'system';
  timestamp: Date;
  senderName?: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m here to support you. How are you feeling right now?',
      sender: 'volunteer',
      senderName: 'Sarah (Crisis Volunteer)',
      timestamp: new Date(),
    },
    {
      id: '2',
      text: 'You\'re in a safe space. Take your time to share what\'s on your mind.',
      sender: 'system',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate volunteer response (in real app, this would be through WebSocket)
    setTimeout(() => {
      const responses = [
        'Thank you for sharing that with me. I hear you.',
        'That sounds really difficult. You\'re being very brave by reaching out.',
        'I\'m here with you. Can you tell me more about how you\'re feeling?',
        'It\'s okay to feel this way. Let\'s work through this together.',
        'You matter, and your feelings are valid. What would help you most right now?',
      ];
      
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'volunteer',
        senderName: 'Sarah (Crisis Volunteer)',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, response]);
    }, 1000 + Math.random() * 2000);
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency Help',
      'Do you need immediate emergency assistance?',
      [
        {
          text: 'Yes, call 911',
          onPress: () => {
            // In real app, would trigger emergency services
            const emergencyMessage: ChatMessage = {
              id: Date.now().toString(),
              text: '🚨 Emergency services have been contacted. Help is on the way.',
              sender: 'system',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, emergencyMessage]);
          },
          style: 'destructive',
        },
        {
          text: 'No, continue chat',
          style: 'cancel',
        },
      ]
    );
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';
    const isAI = message.sender === 'ai';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser && styles.userMessageContainer,
          isSystem && styles.systemMessageContainer,
        ]}
      >
        {!isUser && !isSystem && (
          <Text style={styles.senderName}>
            {message.senderName || (isAI ? 'AI Assistant' : 'Volunteer')}
          </Text>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isUser && styles.userMessageBubble,
            isSystem && styles.systemMessageBubble,
            isAI && styles.aiMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser && styles.userMessageText,
              isSystem && styles.systemMessageText,
            ]}
          >
            {message.text}
          </Text>
        </View>
        
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.connectionStatus}>
          <View style={[
            styles.statusDot, 
            isConnected ? styles.connectedDot : styles.disconnectedDot
          ]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected to Support' : 'Reconnecting...'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={handleEmergency}
        >
          <Text style={styles.emergencyButtonText}>🚨 Emergency</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message here..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim() === '' && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={inputText.trim() === ''}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Crisis Resources Quick Access */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>Breathing Exercise</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>Grounding Technique</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>Crisis Plan</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectedDot: {
    backgroundColor: '#10B981',
  },
  disconnectedDot: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  systemMessageContainer: {
    alignItems: 'center',
  },
  senderName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessageBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  systemMessageBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    maxWidth: '90%',
  },
  aiMessageBubble: {
    backgroundColor: '#EDE9FE',
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  messageText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  systemMessageText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginHorizontal: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickActionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});