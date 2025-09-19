'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Mic,
  MicOff,
  Heart,
  Brain,
  Shield,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Save,
  Lock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CrisisEncryption, SecureStorage } from '@/lib/crypto'
import { useSmartScroll } from '@/hooks/useSmartScroll'
import NewMessagesIndicator from '@/components/chat/NewMessagesIndicator'
import { useAccessibility } from '@/components/accessibility/AccessibilityEnhancer'

interface TherapyMessage {
  id: string
  sender: 'user' | 'therapist'
  content: string
  timestamp: Date
  type: 'text' | 'audio' | 'assessment' | 'intervention'
  metadata?: {
    mood?: number
    technique?: string
    crisis_level?: number
    intervention_triggered?: boolean
  }
}

interface TherapySession {
  id: string
  therapistId: string
  userId: string
  startTime: Date
  endTime?: Date
  messages: TherapyMessage[]
  assessments: {
    initial: { mood: number; anxiety: number; energy: number }
    final?: { mood: number; anxiety: number; energy: number }
  }
  interventions: string[]
  insights: string[]
  homework: string[]
  nextSteps: string[]
  sessionNotes: string
  encrypted: boolean
}

interface TherapyChatProps {
  therapistId: 'aria' | 'sage' | 'luna'
  userId: string
  sessionType: 'crisis' | 'scheduled' | 'check-in' | 'intensive'
  onSessionEnd: (session: TherapySession) => void
}

const THERAPIST_PROFILES = {
  aria: {
    name: 'Dr. Aria',
    avatar: '🧠',
    style: 'direct, solution-focused, evidence-based',
    greeting: "Hello! I'm Dr. Aria. I'm here to help you work through whatever you're facing today. How are you feeling right now?",
    techniques: ['CBT', 'Crisis Intervention', 'Cognitive Restructuring', 'Safety Planning']
  },
  sage: {
    name: 'Dr. Sage',
    avatar: '🌿',
    style: 'gentle, mindful, trauma-informed',
    greeting: "Welcome, I'm Dr. Sage. This is a safe space for you to share whatever is on your heart and mind. Take your time, and let's start wherever feels comfortable for you.",
    techniques: ['Mindfulness', 'Trauma Therapy', 'Grounding', 'EMDR']
  },
  luna: {
    name: 'Dr. Luna',
    avatar: '🌙',
    style: 'nurturing, holistic, wellness-focused',
    greeting: "Hi there, I'm Dr. Luna. I'm glad you're taking time for your wellbeing today. Let's explore what's going on and how we can support your overall wellness together.",
    techniques: ['Sleep Therapy', 'Wellness Coaching', 'Routine Building', 'Mood Regulation']
  }
}

export default function TherapyChat({ 
  therapistId, 
  userId, 
  sessionType, 
  onSessionEnd 
}: TherapyChatProps) {
  const [session, setSession] = useState<TherapySession>({
    id: crypto.randomUUID(),
    therapistId,
    userId,
    startTime: new Date(),
    messages: [],
    assessments: {
      initial: { mood: 5, anxiety: 5, energy: 5 }
    },
    interventions: [],
    insights: [],
    homework: [],
    nextSteps: [],
    sessionNotes: '',
    encrypted: true
  })

  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionPaused, setSessionPaused] = useState(false)
  const [showAssessment, setShowAssessment] = useState(true)
  const [userKey, setUserKey] = useState<CryptoKey | null>(null)
  
  const therapist = THERAPIST_PROFILES[therapistId]
  const { settings, announceToScreenReader } = useAccessibility()

  // Smart scrolling hook with crisis message priority
  const {
    scrollRef,
    isAtBottom,
    hasNewMessages,
    userHasScrolled,
    scrollToBottom,
    forceScrollToBottom,
    scrollToTop,
    markMessagesRead
  } = useSmartScroll(session.messages, {
    forceScrollOnCrisis: true,
    respectReducedMotion: true,
    threshold: 100
  })

  // Check for crisis messages in new messages
  const hasCrisisMessages = hasNewMessages && session.messages
    .slice(-5) // Check last 5 messages for crisis content
    .some(msg => msg.type === 'intervention' || (msg.metadata?.crisis_level && msg.metadata.crisis_level >= 8))

  useEffect(() => {
    // Initialize with therapist greeting
    if (session.messages.length === 0) {
      addTherapistMessage(therapist.greeting)
    }
  }, [])

  const addTherapistMessage = (content: string, type: TherapyMessage['type'] = 'text', metadata?: any) => {
    const message: TherapyMessage = {
      id: crypto.randomUUID(),
      sender: 'therapist',
      content,
      timestamp: new Date(),
      type,
      metadata
    }

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))
  }

  const addUserMessage = (content: string, type: TherapyMessage['type'] = 'text') => {
    const message: TherapyMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      content,
      timestamp: new Date(),
      type
    }

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))

    // Process user message and generate AI response
    setTimeout(() => {
      generateAIResponse(content, message)
    }, 1000)
  }

  const generateAIResponse = async (userInput: string, userMessage: TherapyMessage) => {
    setIsTyping(true)

    try {
      // Crisis detection
      const crisisLevel = detectCrisisIndicators(userInput)
      
      if (crisisLevel >= 8) {
        await handleCrisisIntervention(userInput, crisisLevel)
      } else {
        await generateTherapeuticResponse(userInput, userMessage)
      }
    } catch (error) {
      console.error('Failed to generate AI response:', error)
      addTherapistMessage("I'm having trouble processing that right now. Could you try rephrasing that for me?")
    } finally {
      setIsTyping(false)
    }
  }

  const detectCrisisIndicators = (input: string): number => {
    const crisisKeywords = [
      { words: ['kill myself', 'suicide', 'end my life'], weight: 10 },
      { words: ['want to die', 'better off dead'], weight: 9 },
      { words: ['hopeless', 'trapped', 'no way out'], weight: 7 },
      { words: ['can\'t go on', 'unbearable', 'too much'], weight: 6 },
      { words: ['hurt myself', 'self harm'], weight: 8 },
      { words: ['no point', 'meaningless', 'empty'], weight: 5 }
    ]

    let crisisScore = 0
    const inputLower = input.toLowerCase()

    for (const { words, weight } of crisisKeywords) {
      for (const word of words) {
        if (inputLower.includes(word)) {
          crisisScore = Math.max(crisisScore, weight)
        }
      }
    }

    return crisisScore
  }

  const handleCrisisIntervention = async (input: string, crisisLevel: number) => {
    // Log crisis intervention
    setSession(prev => ({
      ...prev,
      interventions: [...prev.interventions, `Crisis intervention triggered (level ${crisisLevel})`]
    }))

    // Announce crisis intervention to screen readers
    announceToScreenReader('Crisis intervention activated. Immediate support resources are being provided.')

    // Crisis response based on therapist
    let crisisResponse = ''
    if (therapistId === 'aria') {
      crisisResponse = `I hear that you're in significant pain right now, and I want you to know that you don't have to face this alone. Your safety is my primary concern. 

Are you in immediate danger of hurting yourself? If so, please call 988 (Suicide & Crisis Lifeline) right now, or go to your nearest emergency room.

If you're safe for the moment, let's work together on a safety plan. Can you tell me about one person you trust who you could reach out to right now?`
    } else if (therapistId === 'sage') {
      crisisResponse = `I want you to know that I'm here with you in this moment, and what you're feeling is valid. The pain you're experiencing is real, but it's not permanent.

Let's focus on your immediate safety first. Are you physically safe right now? If you're having thoughts of harming yourself, please reach out to the 988 Suicide & Crisis Lifeline immediately.

Right now, let's try a grounding technique together. Can you tell me 5 things you can see around you?`
    } else {
      crisisResponse = `I can hear how much you're struggling, and I want you to know that seeking help shows incredible strength. You matter, and your life has value.

Your immediate safety is what matters most right now. If you're considering harming yourself, please call 988 or go to your nearest emergency room.

For this moment, let's focus on creating a sense of safety and calm. Are you in a safe physical space right now?`
    }

    addTherapistMessage(crisisResponse, 'intervention', { crisis_level: crisisLevel, intervention_triggered: true })

    // Force scroll to ensure crisis message is visible
    setTimeout(() => {
      forceScrollToBottom()
    }, 100)

    // Show crisis resources
    setTimeout(() => {
      addTherapistMessage(`**Crisis Resources Available 24/7:**
📞 988 - Suicide & Crisis Lifeline
📱 Text HOME to 741741 - Crisis Text Line
🌐 Chat at suicidepreventionlifeline.org

Remember: Crisis feelings are temporary, but suicide is permanent. You deserve support and care.`, 'intervention')
      
      // Force scroll again for resources
      setTimeout(() => {
        forceScrollToBottom()
      }, 100)
    }, 2000)
  }

  const generateTherapeuticResponse = async (input: string, userMessage: TherapyMessage) => {
    // Analyze user input for therapeutic response
    const analysis = analyzeUserInput(input)
    
    let response = ''
    const techniques = therapist.techniques

    // Generate response based on therapist style and user needs
    if (therapistId === 'aria') {
      response = generateCBTResponse(input, analysis)
    } else if (therapistId === 'sage') {
      response = generateMindfulnessResponse(input, analysis)
    } else {
      response = generateWellnessResponse(input, analysis)
    }

    addTherapistMessage(response)

    // Follow up with technique suggestions if appropriate
    if (analysis.emotionalDistress > 6) {
      setTimeout(() => {
        suggestCopingTechnique(analysis)
      }, 3000)
    }
  }

  const analyzeUserInput = (input: string) => {
    const words = input.toLowerCase().split(/\s+/)
    
    // Emotional indicators
    const anxietyWords = ['anxious', 'worried', 'nervous', 'panic', 'scared', 'afraid']
    const depressionWords = ['sad', 'depressed', 'hopeless', 'empty', 'numb', 'worthless']
    const angerWords = ['angry', 'furious', 'rage', 'frustrated', 'irritated', 'mad']
    const positiveWords = ['good', 'better', 'happy', 'grateful', 'hopeful', 'positive']

    let emotionalDistress = 0
    let primaryEmotion = 'neutral'

    // Calculate emotional indicators
    const anxietyScore = anxietyWords.filter(word => words.some(w => w.includes(word))).length
    const depressionScore = depressionWords.filter(word => words.some(w => w.includes(word))).length
    const angerScore = angerWords.filter(word => words.some(w => w.includes(word))).length
    const positiveScore = positiveWords.filter(word => words.some(w => w.includes(word))).length

    if (anxietyScore > 0) {
      emotionalDistress += anxietyScore * 2
      primaryEmotion = 'anxiety'
    }
    if (depressionScore > 0) {
      emotionalDistress += depressionScore * 2
      primaryEmotion = 'depression'
    }
    if (angerScore > 0) {
      emotionalDistress += angerScore * 1.5
      primaryEmotion = 'anger'
    }
    if (positiveScore > 0) {
      emotionalDistress = Math.max(0, emotionalDistress - positiveScore)
      if (emotionalDistress === 0) primaryEmotion = 'positive'
    }

    return {
      emotionalDistress: Math.min(emotionalDistress, 10),
      primaryEmotion,
      wordCount: words.length,
      sentiment: positiveScore - (anxietyScore + depressionScore + angerScore)
    }
  }

  const generateCBTResponse = (input: string, analysis: any): string => {
    const responses = {
      anxiety: [
        "I can hear the anxiety in what you're sharing. Anxiety often comes with thoughts that feel very real and urgent in the moment. What specific thoughts are going through your mind about this situation?",
        "That sounds like a really difficult experience with anxiety. Let's work together to examine these anxious thoughts. Can you help me understand what you're telling yourself about this situation?"
      ],
      depression: [
        "Thank you for sharing something so difficult with me. Depression can make everything feel overwhelming and hopeless. When you think about this situation, what specific thoughts come up for you?",
        "I hear how much pain you're in right now. Depression often brings very convincing negative thoughts. What evidence do you have that supports these thoughts? And what evidence might challenge them?"
      ],
      anger: [
        "It sounds like you're experiencing a lot of anger about this situation. Anger often protects us from other vulnerable feelings. What do you think might be underneath this anger?",
        "That's a very human response to have. When we feel angry, our thoughts can become very black-and-white. Can you help me understand exactly what thoughts are fueling this anger?"
      ],
      positive: [
        "I'm really glad to hear some positive movement in how you're feeling. What do you think has contributed to this shift?",
        "That's wonderful to hear. Let's explore what's working well for you right now so we can build on these strengths."
      ],
      neutral: [
        "I'm listening carefully to what you're sharing. Can you help me understand more about how this situation is affecting you emotionally?",
        "Thank you for sharing that with me. I'd like to understand better - when this happens, what goes through your mind?"
      ]
    }

    const responseArray = responses[analysis.primaryEmotion as keyof typeof responses] || responses.neutral
    return responseArray[Math.floor(Math.random() * responseArray.length)]
  }

  const generateMindfulnessResponse = (input: string, analysis: any): string => {
    const responses = {
      anxiety: [
        "I can sense the anxiety you're carrying. Let's take a moment together to ground ourselves in this present moment. Can you feel your feet on the floor and notice your breath?",
        "Anxiety can feel so overwhelming, like a storm in your mind and body. Right now, in this moment, you are safe. Let's breathe together and create some space around these anxious feelings."
      ],
      depression: [
        "I hold space for this pain you're experiencing. Depression can feel like a heavy fog, but remember that you are not this depression - it's something you're experiencing, not who you are.",
        "Thank you for trusting me with this difficult experience. In this moment, can you offer yourself the same compassion you would give to a dear friend going through this?"
      ],
      anger: [
        "I can feel the intensity of your anger. Anger is often a messenger - it's telling us something important. Can we explore what this anger might be trying to protect or communicate?",
        "That's a lot of intensity to carry. Let's see if we can create some breathing room around this anger. What does this feeling look like in your body right now?"
      ],
      positive: [
        "I can hear a lightness in your words that feels beautiful. Can you pause and really savor this moment of feeling good? What does this positivity feel like in your body?",
        "This shift sounds really meaningful. Let's take a moment to fully appreciate this experience and what it teaches us about your resilience."
      ],
      neutral: [
        "I'm here with you, fully present to whatever you're experiencing. There's no need to be anything other than exactly where you are right now.",
        "Thank you for sharing so openly. I'm curious - as you sit here now, what are you noticing in your body and breath?"
      ]
    }

    const responseArray = responses[analysis.primaryEmotion as keyof typeof responses] || responses.neutral
    return responseArray[Math.floor(Math.random() * responseArray.length)]
  }

  const generateWellnessResponse = (input: string, analysis: any): string => {
    const responses = {
      anxiety: [
        "I hear how anxiety is impacting your daily life. Often our sleep, nutrition, and daily rhythms can either support or amplify anxiety. How have you been sleeping and caring for your basic needs?",
        "Anxiety can really disrupt our whole system. Let's think about this holistically - how is your body feeling? Are you getting movement, nutrition, and rest?"
      ],
      depression: [
        "Depression can make even basic self-care feel impossible. You're doing something important just by being here. How are you managing your sleep, meals, and daily routine right now?",
        "I want to honor how hard it can be to function when depression hits. Let's start small - what's one tiny thing you've done today to care for yourself?"
      ],
      anger: [
        "Anger can be so activating for our whole nervous system. How has this intensity been affecting your sleep, appetite, or energy levels?",
        "That's a lot of energy to carry. Sometimes anger is our body's way of telling us something in our life needs attention. How is this showing up in your daily wellness routine?"
      ],
      positive: [
        "I love hearing about positive shifts! What aspects of your wellness routine do you think might be supporting this good feeling?",
        "This is wonderful to hear. Let's think about how to maintain and build on this positive momentum in your daily life."
      ],
      neutral: [
        "I'm interested in understanding your overall wellness picture. How are you doing with the basics - sleep, movement, nutrition, and daily rhythm?",
        "Thank you for sharing. I'd love to understand how you've been caring for yourself lately - both physically and emotionally."
      ]
    }

    const responseArray = responses[analysis.primaryEmotion as keyof typeof responses] || responses.neutral
    return responseArray[Math.floor(Math.random() * responseArray.length)]
  }

  const suggestCopingTechnique = (analysis: any) => {
    let technique = ''
    
    if (therapistId === 'aria') {
      technique = "Would you like to try a quick cognitive restructuring exercise? We can examine one of those difficult thoughts together and see if we can find a more balanced perspective."
    } else if (therapistId === 'sage') {
      technique = "Would it be helpful to try a brief grounding exercise together? We could do the 5-4-3-2-1 technique to help you feel more present and centered."
    } else {
      technique = "How about we try a quick wellness check-in? We could explore what your body needs right now - maybe some deep breathing, gentle movement, or a moment of rest."
    }

    addTherapistMessage(technique, 'assessment')
  }

  const sendMessage = () => {
    if (currentMessage.trim()) {
      addUserMessage(currentMessage.trim())
      setCurrentMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const endSession = async () => {
    const endTime = new Date()
    const finalSession = {
      ...session,
      endTime,
      sessionNotes: `Session with ${therapist.name} - ${sessionType} session completed.`
    }

    // Encrypt and save session
    if (userKey) {
      try {
        const encryptedSession = await CrisisEncryption.encryptCrisisSession(finalSession, userKey)
        await SecureStorage.storeEncryptedData(`therapy_session_${session.id}`, encryptedSession, userKey)
      } catch (error) {
        console.error('Failed to encrypt session:', error)
      }
    }

    onSessionEnd(finalSession)
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{therapist.avatar}</div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{therapist.name}</h2>
            <p className="text-sm text-gray-600">{sessionType} session • {therapist.style}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{new Date(Date.now() - session.startTime.getTime()).toISOString().substr(14, 5)}</span>
          </div>
          
          <button
            onClick={() => setSessionPaused(!sessionPaused)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            {sessionPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          
          <button
            onClick={endSession}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        data-chat-container
        role="log"
        aria-live="polite"
        aria-label="Therapy chat conversation"
      >
        <AnimatePresence>
          {session.messages.map((message) => (
            <motion.div
              key={message.id}
              id={`message-${message.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: settings.reducedMotion ? 0.1 : 0.3
              }}
              className={cn(
                "flex",
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div className={cn(
                "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                message.sender === 'user' 
                  ? "bg-blue-600 text-white"
                  : message.type === 'intervention'
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-white border border-gray-200 text-gray-900",
                settings.highContrast && message.type === 'intervention' && "border-2 border-red-600"
              )}>
                {message.sender === 'therapist' && message.type !== 'intervention' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl" aria-hidden="true">{therapist.avatar}</span>
                    <span className="text-sm font-medium">{therapist.name}</span>
                  </div>
                )}
                
                {message.type === 'intervention' && (
                  <div 
                    className="flex items-center space-x-2 mb-2"
                    role="alert"
                    aria-label="Crisis intervention message"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-bold text-red-800">Crisis Support</span>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                <div className="text-xs opacity-70 mt-1">
                  <time dateTime={message.timestamp.toISOString()}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: settings.reducedMotion ? 0.1 : 0.3
            }}
            className="flex justify-start"
            aria-live="polite"
            aria-label={`${therapist.name} is typing`}
          >
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-xs">
              <div className="flex items-center space-x-2">
                <span className="text-xl" aria-hidden="true">{therapist.avatar}</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="sr-only">{therapist.name} is typing</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* New Messages Indicator */}
      <NewMessagesIndicator
        show={hasNewMessages}
        messageCount={session.messages.length}
        onClick={() => {
          forceScrollToBottom()
          markMessagesRead()
        }}
        hasCrisisMessage={hasCrisisMessages}
      />

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              disabled={sessionPaused}
            />
          </div>
          
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isRecording ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            disabled={sessionPaused}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          
          <button
            onClick={sendMessage}
            disabled={!currentMessage.trim() || sessionPaused}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>End-to-end encrypted</span>
            </div>
            {sessionPaused && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <Pause className="w-3 h-3" />
                <span>Session paused</span>
              </div>
            )}
          </div>
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  )
}