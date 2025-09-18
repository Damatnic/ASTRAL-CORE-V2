import { NextResponse } from 'next/server';
import { WebSocketServer } from 'ws';

// Store active connections
const connections = new Map();
const chatRooms = new Map();

// Crisis message types
const MESSAGE_TYPES = {
  USER_MESSAGE: 'user_message',
  VOLUNTEER_MESSAGE: 'volunteer_message',
  SYSTEM_MESSAGE: 'system_message',
  CRISIS_ALERT: 'crisis_alert',
  ESCALATION: 'escalation',
  TYPING: 'typing',
  CONNECTION_STATUS: 'connection_status'
};

// Risk assessment keywords
const HIGH_RISK_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'not worth living', 'goodbye',
  'self harm', 'hurt myself', 'cutting', 'overdose', 'jump off'
];

const MEDIUM_RISK_KEYWORDS = [
  'depressed', 'hopeless', 'alone', 'nobody cares', 'give up',
  'worthless', 'burden', 'tired of living', 'escape', 'pain'
];

// Analyze message for crisis risk
function analyzeRiskLevel(message) {
  const lowerMessage = message.toLowerCase();
  
  const highRiskCount = HIGH_RISK_KEYWORDS.filter(keyword => 
    lowerMessage.includes(keyword)
  ).length;
  
  const mediumRiskCount = MEDIUM_RISK_KEYWORDS.filter(keyword => 
    lowerMessage.includes(keyword)
  ).length;
  
  if (highRiskCount > 0) return 'high';
  if (mediumRiskCount >= 2) return 'medium';
  return 'low';
}

// Generate volunteer responses based on message content and risk level
function generateVolunteerResponse(userMessage, riskLevel) {
  const responses = {
    high: [
      "I'm really concerned about you right now. I want you to know that you're not alone, and I'm here to help. Can you tell me if you're in immediate danger?",
      "Thank you for trusting me with these feelings. I can hear how much pain you're in. Right now, I want to make sure you're safe. Are you thinking about hurting yourself?",
      "I'm glad you reached out tonight. It takes courage to share what you're going through. I'm here to listen and support you through this difficult time.",
      "Your life has value, and I'm here to help you through this crisis. Can you tell me where you are right now so we can ensure you're safe?"
    ],
    medium: [
      "I can hear that you're going through a really difficult time. Those feelings must be overwhelming. Can you tell me more about what's been happening?",
      "Thank you for sharing that with me. It sounds like you're carrying a heavy burden. I want you to know that you don't have to face this alone.",
      "I appreciate you being so open about your feelings. It's clear you're struggling, and that takes strength to acknowledge. What has been the hardest part?",
      "Those feelings you're describing are valid, and I want you to know that there is hope, even when it doesn't feel that way."
    ],
    low: [
      "I'm here to listen and support you. Can you tell me more about what brought you here today?",
      "Thank you for reaching out. Sometimes talking to someone can help us process difficult feelings. What's been on your mind?",
      "I'm glad you decided to connect with someone tonight. What would be most helpful for you right now?",
      "It's okay to not be okay. I'm here to listen without judgment. What's been weighing on your heart?"
    ]
  };
  
  const responseList = responses[riskLevel] || responses.low;
  return responseList[Math.floor(Math.random() * responseList.length)];
}

// Handle WebSocket upgrade for crisis chat
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userType = searchParams.get('type'); // 'user' or 'volunteer'
  const sessionId = searchParams.get('sessionId') || generateSessionId();
  
  if (request.headers.get('upgrade') !== 'websocket') {
    return new NextResponse('Expected WebSocket upgrade', { status: 426 });
  }

  return new NextResponse(null, {
    status: 101,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
      'Sec-WebSocket-Accept': request.headers.get('sec-websocket-key'),
    },
  });
}

// Handle chat API requests
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, sessionId, message, userType, volunteerId } = body;

    switch (action) {
      case 'start_chat':
        return handleStartChat(sessionId, userType);
      
      case 'send_message':
        return handleSendMessage(sessionId, message, userType, volunteerId);
      
      case 'escalate':
        return handleEscalation(sessionId, volunteerId);
      
      case 'end_chat':
        return handleEndChat(sessionId, userType);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Crisis chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleStartChat(sessionId, userType) {
  const chatRoom = {
    id: sessionId,
    createdAt: new Date().toISOString(),
    status: 'waiting',
    messages: [],
    user: null,
    volunteer: null,
    riskLevel: 'low',
    escalated: false
  };

  if (userType === 'user') {
    chatRoom.user = { id: sessionId, joinedAt: new Date().toISOString() };
    chatRoom.status = 'waiting_for_volunteer';
    
    // Add system message
    chatRoom.messages.push({
      id: generateMessageId(),
      type: MESSAGE_TYPES.SYSTEM_MESSAGE,
      content: 'Welcome to ASTRAL CORE Crisis Support. You are now in queue for immediate assistance. Our trained volunteers are standing by.',
      timestamp: new Date().toISOString(),
      sender: 'system'
    });

    // Simulate volunteer matching (in real app, this would be handled by matching algorithm)
    setTimeout(() => {
      matchVolunteer(sessionId);
    }, 3000 + Math.random() * 5000);
  }

  chatRooms.set(sessionId, chatRoom);

  return NextResponse.json({
    success: true,
    sessionId,
    chatRoom,
    queuePosition: userType === 'user' ? Math.floor(Math.random() * 3) + 1 : null
  });
}

async function handleSendMessage(sessionId, message, userType, volunteerId) {
  const chatRoom = chatRooms.get(sessionId);
  if (!chatRoom) {
    return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
  }

  // Analyze risk level for user messages
  let riskLevel = chatRoom.riskLevel;
  if (userType === 'user') {
    riskLevel = analyzeRiskLevel(message);
    chatRoom.riskLevel = riskLevel;
  }

  const newMessage = {
    id: generateMessageId(),
    type: userType === 'user' ? MESSAGE_TYPES.USER_MESSAGE : MESSAGE_TYPES.VOLUNTEER_MESSAGE,
    content: message,
    timestamp: new Date().toISOString(),
    sender: userType,
    riskLevel: userType === 'user' ? riskLevel : null
  };

  chatRoom.messages.push(newMessage);
  chatRoom.lastActivity = new Date().toISOString();

  // Auto-escalate if high risk detected
  if (riskLevel === 'high' && !chatRoom.escalated) {
    await autoEscalate(sessionId);
  }

  // Generate volunteer response for user messages (simulation)
  if (userType === 'user' && chatRoom.volunteer) {
    setTimeout(() => {
      const response = generateVolunteerResponse(message, riskLevel);
      const volunteerMessage = {
        id: generateMessageId(),
        type: MESSAGE_TYPES.VOLUNTEER_MESSAGE,
        content: response,
        timestamp: new Date().toISOString(),
        sender: 'volunteer',
        volunteer: {
          name: chatRoom.volunteer.name,
          id: chatRoom.volunteer.id,
          certified: true
        }
      };
      
      chatRoom.messages.push(volunteerMessage);
      
      // In real app, this would broadcast via WebSocket
      console.log('Volunteer response sent:', volunteerMessage);
    }, 2000 + Math.random() * 4000);
  }

  return NextResponse.json({
    success: true,
    message: newMessage,
    riskLevel,
    escalated: chatRoom.escalated
  });
}

async function handleEscalation(sessionId, volunteerId) {
  const chatRoom = chatRooms.get(sessionId);
  if (!chatRoom) {
    return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
  }

  chatRoom.escalated = true;
  chatRoom.escalatedBy = volunteerId;
  chatRoom.escalatedAt = new Date().toISOString();

  const escalationMessage = {
    id: generateMessageId(),
    type: MESSAGE_TYPES.SYSTEM_MESSAGE,
    content: 'This conversation has been escalated to a professional counselor for additional support.',
    timestamp: new Date().toISOString(),
    sender: 'system'
  };

  chatRoom.messages.push(escalationMessage);

  return NextResponse.json({
    success: true,
    escalated: true,
    message: escalationMessage
  });
}

async function handleEndChat(sessionId, userType) {
  const chatRoom = chatRooms.get(sessionId);
  if (!chatRoom) {
    return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
  }

  chatRoom.status = 'ended';
  chatRoom.endedAt = new Date().toISOString();
  chatRoom.endedBy = userType;

  const endMessage = {
    id: generateMessageId(),
    type: MESSAGE_TYPES.SYSTEM_MESSAGE,
    content: 'This crisis support session has ended. Remember, help is always available 24/7. Take care of yourself.',
    timestamp: new Date().toISOString(),
    sender: 'system'
  };

  chatRoom.messages.push(endMessage);

  return NextResponse.json({
    success: true,
    ended: true,
    message: endMessage
  });
}

function matchVolunteer(sessionId) {
  const chatRoom = chatRooms.get(sessionId);
  if (!chatRoom) return;

  // Simulate volunteer assignment
  const volunteer = {
    id: 'v_' + Math.random().toString(36).substr(2, 9),
    name: ['Sarah', 'Mike', 'Jessica', 'David', 'Emily'][Math.floor(Math.random() * 5)],
    joinedAt: new Date().toISOString(),
    certified: true,
    specializations: ['crisis intervention', 'suicide prevention']
  };

  chatRoom.volunteer = volunteer;
  chatRoom.status = 'active';

  const welcomeMessage = {
    id: generateMessageId(),
    type: MESSAGE_TYPES.VOLUNTEER_MESSAGE,
    content: `Hi there, I'm ${volunteer.name}, a trained crisis support volunteer. I'm here to listen and support you. How are you feeling right now?`,
    timestamp: new Date().toISOString(),
    sender: 'volunteer',
    volunteer
  };

  chatRoom.messages.push(welcomeMessage);
  
  console.log('Volunteer matched:', volunteer);
}

async function autoEscalate(sessionId) {
  const chatRoom = chatRooms.get(sessionId);
  if (!chatRoom || chatRoom.escalated) return;

  chatRoom.escalated = true;
  chatRoom.escalatedBy = 'system';
  chatRoom.escalatedAt = new Date().toISOString();
  chatRoom.escalationReason = 'High-risk keywords detected';

  const alertMessage = {
    id: generateMessageId(),
    type: MESSAGE_TYPES.CRISIS_ALERT,
    content: 'HIGH RISK DETECTED: This conversation has been flagged for immediate professional intervention.',
    timestamp: new Date().toISOString(),
    sender: 'system',
    priority: 'critical'
  };

  chatRoom.messages.push(alertMessage);
  
  console.log('Auto-escalation triggered for session:', sessionId);
}

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateMessageId() {
  return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get chat history
export async function GET_CHAT(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const chatRoom = chatRooms.get(sessionId);
  if (!chatRoom) {
    return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    chatRoom,
    messages: chatRoom.messages
  });
}