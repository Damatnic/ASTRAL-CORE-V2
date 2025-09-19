'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Video,
  Users,
  Heart,
  Brain,
  Shield,
  Phone,
  MapPin,
  Search,
  Filter,
  Star,
  Clock,
  Download,
  Share2,
  Bookmark,
  PlayCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  User,
  Calendar,
  Tag,
  Volume2,
  Target,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EducationalContent {
  id: string
  title: string
  description: string
  category: 'condition' | 'therapy' | 'recovery' | 'resources' | 'testimonial'
  subcategory: string
  type: 'article' | 'video' | 'audio' | 'interactive' | 'resource-list'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  readingTime: string
  tags: string[]
  content: string
  author: string
  reviewedBy?: string
  lastUpdated: Date
  featured: boolean
  rating: number
  views: number
  bookmarked: boolean
  completed: boolean
}

interface RecoveryStory {
  id: string
  title: string
  condition: string
  ageRange: string
  duration: string
  keyInsights: string[]
  content: string
  helpful: number
  verified: boolean
}

interface CrisisResource {
  id: string
  name: string
  description: string
  type: 'hotline' | 'chat' | 'text' | 'local-service' | 'online-therapy'
  availability: string
  contact: string
  website?: string
  languages: string[]
  specialties: string[]
  cost: 'free' | 'low-cost' | 'insurance' | 'paid'
  location?: string
  rating: number
}

const CONTENT_CATEGORIES = [
  {
    id: 'condition',
    name: 'Mental Health Conditions',
    description: 'Understanding symptoms, causes, and treatment options',
    icon: Brain,
    color: 'text-blue-600 bg-blue-100',
    subcategories: ['Anxiety Disorders', 'Depression', 'PTSD', 'Bipolar Disorder', 'ADHD', 'Eating Disorders', 'Personality Disorders']
  },
  {
    id: 'therapy',
    name: 'Therapy Techniques',
    description: 'Learn about different therapeutic approaches and how they work',
    icon: Heart,
    color: 'text-red-600 bg-red-100',
    subcategories: ['CBT', 'DBT', 'EMDR', 'Mindfulness', 'Psychodynamic', 'Solution-Focused']
  },
  {
    id: 'recovery',
    name: 'Recovery Stories',
    description: 'Real experiences and insights from people in recovery',
    icon: Users,
    color: 'text-green-600 bg-green-100',
    subcategories: ['Anxiety Recovery', 'Depression Recovery', 'Addiction Recovery', 'Trauma Recovery']
  },
  {
    id: 'resources',
    name: 'Crisis Resources',
    description: 'Emergency contacts, hotlines, and professional services',
    icon: Shield,
    color: 'text-orange-600 bg-orange-100',
    subcategories: ['Crisis Hotlines', 'Local Services', 'Online Therapy', 'Support Groups']
  }
]

const SAMPLE_CONTENT: EducationalContent[] = [
  {
    id: 'anxiety-overview',
    title: 'Understanding Anxiety Disorders: A Comprehensive Guide',
    description: 'Learn about different types of anxiety disorders, symptoms, and evidence-based treatments',
    category: 'condition',
    subcategory: 'Anxiety Disorders',
    type: 'article',
    difficulty: 'beginner',
    readingTime: '15 min',
    tags: ['anxiety', 'symptoms', 'treatment', 'overview'],
    content: `# Understanding Anxiety Disorders

Anxiety disorders are among the most common mental health conditions, affecting millions of people worldwide. While feeling anxious occasionally is normal, anxiety disorders involve persistent, excessive worry that interferes with daily life.

## Types of Anxiety Disorders

### Generalized Anxiety Disorder (GAD)
- Persistent worry about multiple areas of life
- Physical symptoms like muscle tension and fatigue
- Difficulty controlling worry

### Panic Disorder
- Recurrent panic attacks with intense physical symptoms
- Fear of having another panic attack
- Avoidance of situations that might trigger attacks

### Social Anxiety Disorder
- Intense fear of social situations
- Worry about being judged or embarrassed
- Physical symptoms in social settings

### Specific Phobias
- Intense fear of specific objects or situations
- Immediate anxiety response when exposed
- Avoidance of feared stimulus

## Common Symptoms

**Physical:**
- Rapid heartbeat
- Sweating
- Trembling
- Shortness of breath
- Muscle tension

**Emotional:**
- Excessive worry
- Feeling on edge
- Irritability
- Fear of losing control

**Behavioral:**
- Avoidance
- Restlessness
- Difficulty concentrating
- Sleep problems

## Evidence-Based Treatments

### Cognitive Behavioral Therapy (CBT)
- Identify and challenge anxious thoughts
- Learn coping strategies
- Gradual exposure to feared situations

### Medication
- SSRIs and SNRIs
- Benzodiazepines (short-term use)
- Beta-blockers for physical symptoms

### Lifestyle Changes
- Regular exercise
- Stress management
- Sleep hygiene
- Mindfulness practices

## When to Seek Help

Consider professional help if:
- Anxiety interferes with daily activities
- Physical symptoms are concerning
- You're avoiding important situations
- Anxiety persists for weeks or months

Remember: Anxiety disorders are highly treatable. With proper support and treatment, most people experience significant improvement.`,
    author: 'Dr. Sarah Johnson, PhD',
    reviewedBy: 'Dr. Michael Chen, MD',
    lastUpdated: new Date('2024-01-15'),
    featured: true,
    rating: 4.8,
    views: 15420,
    bookmarked: false,
    completed: false
  },
  {
    id: 'cbt-introduction',
    title: 'Cognitive Behavioral Therapy: How It Works',
    description: 'An introduction to CBT principles and techniques for managing mental health',
    category: 'therapy',
    subcategory: 'CBT',
    type: 'video',
    difficulty: 'beginner',
    readingTime: '12 min',
    tags: ['CBT', 'therapy', 'techniques', 'introduction'],
    content: `# Cognitive Behavioral Therapy: How It Works

Cognitive Behavioral Therapy (CBT) is one of the most effective and widely researched forms of psychotherapy. It focuses on the connection between thoughts, feelings, and behaviors.

## Core Principles

### The CBT Triangle
CBT is based on the understanding that thoughts, feelings, and behaviors are interconnected:
- **Thoughts** influence how we feel and behave
- **Feelings** affect our thoughts and actions
- **Behaviors** impact our thoughts and emotions

### Present-Focused Approach
- Focuses on current problems rather than past events
- Emphasizes practical problem-solving
- Goal-oriented and structured

## Key Techniques

### Thought Records
- Identify automatic negative thoughts
- Examine evidence for and against thoughts
- Develop more balanced perspectives

### Behavioral Experiments
- Test the accuracy of negative predictions
- Gather evidence about feared situations
- Build confidence through experience

### Exposure Therapy
- Gradual confrontation of feared situations
- Reduces avoidance behaviors
- Decreases anxiety over time

### Activity Scheduling
- Plan pleasant and meaningful activities
- Increase engagement and motivation
- Improve mood through action

## What to Expect in CBT

### Initial Sessions
- Assessment and goal setting
- Psychoeducation about your condition
- Introduction to CBT concepts

### Middle Phase
- Learning and practicing techniques
- Homework assignments
- Monitoring progress

### Final Phase
- Relapse prevention planning
- Consolidating skills
- Preparing for independence

## Effectiveness

CBT has strong research support for:
- Depression
- Anxiety disorders
- PTSD
- Eating disorders
- Substance abuse
- Many other conditions

## Finding a CBT Therapist

Look for therapists who:
- Have specific CBT training
- Use evidence-based approaches
- Provide structured treatment
- Give homework assignments

CBT is typically a short-term therapy (12-20 sessions) that provides you with tools you can use throughout your life.`,
    author: 'Dr. Lisa Rodriguez, LCSW',
    reviewedBy: 'Dr. James Wilson, PhD',
    lastUpdated: new Date('2024-01-10'),
    featured: false,
    rating: 4.6,
    views: 8932,
    bookmarked: false,
    completed: false
  }
]

const SAMPLE_RECOVERY_STORIES: RecoveryStory[] = [
  {
    id: 'anxiety-recovery-story-1',
    title: 'From Panic Attacks to Peace: My Journey with Anxiety',
    condition: 'Panic Disorder',
    ageRange: '25-30',
    duration: '2 years',
    keyInsights: [
      'Therapy was the turning point',
      'Breathing exercises became my anchor',
      'Support system was crucial',
      'Recovery is not linear'
    ],
    content: `My journey with panic disorder began during my graduate studies. The first panic attack hit me during a presentation - my heart was racing, I couldn't breathe, and I was certain I was having a heart attack.

## The Struggle

For months, I lived in fear of the next attack. I started avoiding situations that might trigger panic - public speaking, crowded places, even social gatherings. My world was getting smaller, and I felt trapped.

## Finding Help

After my third ER visit in a month (all for panic attacks), a doctor finally suggested I speak with a mental health professional. I was skeptical but desperate.

## The Journey

**Therapy:** CBT was incredibly helpful. Learning about the panic cycle and how thoughts fuel anxiety was eye-opening. My therapist taught me practical techniques:

- 4-7-8 breathing exercise
- Grounding techniques (5-4-3-2-1)
- Challenging catastrophic thoughts
- Gradual exposure to feared situations

**Medication:** I was hesitant about medication, but a low dose of an SSRI helped reduce the frequency and intensity of panic attacks, giving me space to practice therapy techniques.

**Support System:** Opening up to friends and family was scary but transformative. Their understanding and support made a huge difference.

## Key Learnings

1. **Panic attacks are not dangerous** - Understanding this intellectually and emotionally took time
2. **Avoidance makes anxiety worse** - Each time I avoided something, my fear grew
3. **Small steps count** - Recovery happened gradually, not overnight
4. **Setbacks are normal** - Bad days don't erase progress

## Life Now

Two years later, I rarely have panic attacks. When anxiety does arise, I have tools to manage it. I'm back to doing things I love - traveling, speaking publicly, and living fully.

Recovery is possible. If you're struggling with panic disorder, please know that you're not alone and help is available.`,
    helpful: 234,
    verified: true
  }
]

const SAMPLE_CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: 'nspl',
    name: '988 Suicide & Crisis Lifeline',
    description: '24/7 free and confidential support for people in distress and crisis prevention',
    type: 'hotline',
    availability: '24/7',
    contact: '988',
    website: 'https://988lifeline.org',
    languages: ['English', 'Spanish'],
    specialties: ['Suicide Prevention', 'Crisis Support', 'Mental Health'],
    cost: 'free',
    rating: 4.8
  },
  {
    id: 'crisis-text-line',
    name: 'Crisis Text Line',
    description: 'Free, 24/7 support for those in crisis via text message',
    type: 'text',
    availability: '24/7',
    contact: 'Text HOME to 741741',
    website: 'https://crisistextline.org',
    languages: ['English', 'Spanish'],
    specialties: ['Crisis Support', 'Mental Health', 'Suicide Prevention'],
    cost: 'free',
    rating: 4.7
  },
  {
    id: 'nami-helpline',
    name: 'NAMI HelpLine',
    description: 'Information, support and referrals for mental health conditions',
    type: 'hotline',
    availability: 'Mon-Fri 10am-10pm ET',
    contact: '1-800-950-6264',
    website: 'https://nami.org/help',
    languages: ['English', 'Spanish'],
    specialties: ['Mental Health Information', 'Support', 'Referrals'],
    cost: 'free',
    rating: 4.5
  }
]

export default function EducationHub() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedContent, setSelectedContent] = useState<EducationalContent | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [bookmarkedContent, setBookmarkedContent] = useState<string[]>([])

  useEffect(() => {
    loadEducationData()
  }, [])

  const loadEducationData = async () => {
    try {
      setIsLoading(true)
      // In a real app, these would be API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading education data:', error)
      setIsLoading(false)
    }
  }

  const toggleBookmark = async (contentId: string) => {
    try {
      const response = await fetch('/api/education/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, action: bookmarkedContent.includes(contentId) ? 'remove' : 'add' })
      })

      if (response.ok) {
        setBookmarkedContent(prev => 
          prev.includes(contentId) 
            ? prev.filter(id => id !== contentId)
            : [...prev, contentId]
        )
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  const filteredContent = SAMPLE_CONTENT.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesDifficulty = !difficultyFilter || content.difficulty === difficultyFilter
    const matchesType = !typeFilter || content.type === typeFilter
    const matchesCategory = !selectedCategory || content.category === selectedCategory

    return matchesSearch && matchesDifficulty && matchesType && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Education & Resources</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Evidence-based information, recovery stories, and professional resources for mental health
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles, videos, resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="article">Articles</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="interactive">Interactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      {!selectedCategory && !selectedContent && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CONTENT_CATEGORIES.map((category) => {
            const IconComponent = category.icon
            const categoryContent = SAMPLE_CONTENT.filter(c => c.category === category.id)
            
            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category.id)}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all"
              >
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", category.color)}>
                  <IconComponent className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{categoryContent.length} resources</span>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Content List */}
      {(selectedCategory || searchTerm) && !selectedContent && (
        <div>
          {selectedCategory && (
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                ← Back to Categories
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {CONTENT_CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </h2>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((content) => (
              <motion.div
                key={content.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {content.type === 'article' && <FileText className="w-5 h-5 text-blue-600" />}
                      {content.type === 'video' && <PlayCircle className="w-5 h-5 text-red-600" />}
                      {content.type === 'audio' && <Volume2 className="w-5 h-5 text-purple-600" />}
                      {content.type === 'interactive' && <Target className="w-5 h-5 text-green-600" />}
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        content.difficulty === 'beginner' ? "bg-green-100 text-green-700" :
                        content.difficulty === 'intermediate' ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {content.difficulty}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBookmark(content.id)
                      }}
                      className="text-gray-600 hover:text-yellow-500"
                    >
                      <Bookmark className={cn(
                        "w-5 h-5",
                        bookmarkedContent.includes(content.id) ? "fill-yellow-500 text-yellow-500" : ""
                      )} />
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {content.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {content.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-700 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {content.readingTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {content.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {content.views.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {content.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedContent(content)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Read More
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Content Detail View */}
      <AnimatePresence>
        {selectedContent && (
          <ContentDetailView
            content={selectedContent}
            onClose={() => setSelectedContent(null)}
            onBookmarkToggle={() => toggleBookmark(selectedContent.id)}
            isBookmarked={bookmarkedContent.includes(selectedContent.id)}
          />
        )}
      </AnimatePresence>

      {/* Crisis Resources Quick Access */}
      {!selectedCategory && !selectedContent && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Crisis Resources</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_CRISIS_RESOURCES.slice(0, 3).map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg p-4 border border-red-200">
                <h4 className="font-medium text-gray-900 mb-2">{resource.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Contact: </span>
                    <span className="text-blue-600">{resource.contact}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Available: </span>
                    <span className="text-gray-600">{resource.availability}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setSelectedCategory('resources')}
            className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            View All Crisis Resources →
          </button>
        </div>
      )}
    </div>
  )
}

// Content Detail View Component
interface ContentDetailViewProps {
  content: EducationalContent
  onClose: () => void
  onBookmarkToggle: () => void
  isBookmarked: boolean
}

function ContentDetailView({ content, onClose, onBookmarkToggle, isBookmarked }: ContentDetailViewProps) {
  const [isCompleted, setIsCompleted] = useState(content.completed)

  const markAsCompleted = async () => {
    try {
      const response = await fetch('/api/education/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: content.id })
      })

      if (response.ok) {
        setIsCompleted(true)
      }
    } catch (error) {
      console.error('Error marking content as completed:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {content.type === 'article' && <FileText className="w-5 h-5 text-blue-600" />}
                {content.type === 'video' && <PlayCircle className="w-5 h-5 text-red-600" />}
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  content.difficulty === 'beginner' ? "bg-green-100 text-green-700" :
                  content.difficulty === 'intermediate' ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                )}>
                  {content.difficulty}
                </span>
                <span className="text-sm text-gray-700">{content.readingTime}</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.title}</h2>
              <p className="text-gray-600">{content.description}</p>
              
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-700">
                <span>By {content.author}</span>
                {content.reviewedBy && <span>• Reviewed by {content.reviewedBy}</span>}
                <span>• Updated {content.lastUpdated.toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={onBookmarkToggle}
                className="p-2 text-gray-600 hover:text-yellow-500"
              >
                <Bookmark className={cn(
                  "w-5 h-5",
                  isBookmarked ? "fill-yellow-500 text-yellow-500" : ""
                )} />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content.content.replace(/\n/g, '<br>') }} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={markAsCompleted}
                disabled={isCompleted}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  isCompleted 
                    ? "bg-green-100 text-green-700 cursor-default"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <CheckCircle className="w-4 h-4" />
                {isCompleted ? 'Completed' : 'Mark as Complete'}
              </button>
              
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{content.rating}/5</span>
                <span>•</span>
                <span>{content.views.toLocaleString()} views</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:text-gray-600">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-600">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}