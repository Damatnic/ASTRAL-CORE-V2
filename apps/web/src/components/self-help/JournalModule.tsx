'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Lock,
  Unlock,
  Save,
  Search,
  Calendar,
  Tag,
  Heart,
  Sun,
  Target,
  Cloud,
  Sparkles,
  Edit3,
  Shield,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import * as crypto from 'crypto'

// Guided journal prompts
const JOURNAL_PROMPTS = {
  gratitude: [
    "What are three things you're grateful for today?",
    "Who made a positive impact on your life recently?",
    "What's a small win you experienced today?",
    "What made you smile today?",
    "What's something beautiful you noticed today?"
  ],
  reflection: [
    "What did you learn about yourself today?",
    "How did you grow as a person this week?",
    "What challenge did you overcome recently?",
    "What would you do differently if you could replay today?",
    "What patterns have you noticed in your thoughts or behaviors?"
  ],
  goals: [
    "What's one goal you want to achieve this month?",
    "What small step can you take tomorrow toward your dreams?",
    "What would your ideal day look like?",
    "What habit would you like to build or break?",
    "Where do you see yourself in 6 months?"
  ],
  emotions: [
    "How are you really feeling right now?",
    "What emotions did you experience today and why?",
    "What's weighing on your mind?",
    "What would you like to let go of?",
    "What brings you peace when you're stressed?"
  ],
  therapy: [
    "What would you like to discuss in your next therapy session?",
    "What coping strategies worked well for you this week?",
    "How have your symptoms changed over the past few days?",
    "What triggers did you notice this week?",
    "What self-care activities helped you the most?"
  ]
}

interface JournalEntry {
  id: string
  title?: string
  content: string
  encryptedContent?: ArrayBuffer
  entryType: string
  promptText?: string
  tags: string[]
  mood?: number
  createdAt: Date
  updatedAt: Date
  isPrivate: boolean
  wordCount: number
}

interface EncryptionKeys {
  key: CryptoKey
  salt: Uint8Array
}

export default function JournalModule() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [entryTitle, setEntryTitle] = useState('')
  const [selectedType, setSelectedType] = useState<keyof typeof JOURNAL_PROMPTS | 'freeform'>('freeform')
  const [selectedPrompt, setSelectedPrompt] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [isEncrypted, setIsEncrypted] = useState(true)
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKeys | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showPrompts, setShowPrompts] = useState(false)
  const [mood, setMood] = useState(5)

  // Initialize encryption
  useEffect(() => {
    if (isEncrypted) {
      initializeEncryption()
    }
  }, [isEncrypted])

  // Initialize encryption keys
  const initializeEncryption = async () => {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode('user-passphrase'), // In production, use actual user passphrase
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      )
      
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      )
      
      setEncryptionKeys({ key, salt })
    } catch (error) {
      console.error('Encryption initialization failed:', error)
      setIsEncrypted(false)
    }
  }

  // Encrypt content
  const encryptContent = async (content: string): Promise<ArrayBuffer | null> => {
    if (!encryptionKeys) return null
    
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encodedContent = new TextEncoder().encode(content)
      
      const encryptedContent = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        encryptionKeys.key,
        encodedContent
      )
      
      // Combine IV and encrypted content
      const combined = new Uint8Array(iv.length + encryptedContent.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encryptedContent), iv.length)
      
      return combined.buffer
    } catch (error) {
      console.error('Encryption failed:', error)
      return null
    }
  }

  // Decrypt content
  const decryptContent = async (encryptedData: ArrayBuffer): Promise<string | null> => {
    if (!encryptionKeys) return null
    
    try {
      const data = new Uint8Array(encryptedData)
      const iv = data.slice(0, 12)
      const encrypted = data.slice(12)
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        encryptionKeys.key,
        encrypted
      )
      
      return new TextDecoder().decode(decrypted)
    } catch (error) {
      console.error('Decryption failed:', error)
      return null
    }
  }

  // Save journal entry
  const saveEntry = async () => {
    if (!currentEntry.trim()) return
    
    setIsSaving(true)
    
    try {
      const wordCount = currentEntry.split(/\s+/).filter(word => word.length > 0).length
      
      const entry: JournalEntry = {
        id: Date.now().toString(),
        title: entryTitle || undefined,
        content: isEncrypted ? '' : currentEntry,
        encryptedContent: isEncrypted ? await encryptContent(currentEntry) || undefined : undefined,
        entryType: selectedType,
        promptText: selectedPrompt || undefined,
        tags,
        mood,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPrivate,
        wordCount
      }
      
      // Save to backend
      const response = await fetch('/api/self-help/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entry,
          encryptedContent: entry.encryptedContent ? 
            Array.from(new Uint8Array(entry.encryptedContent)) : undefined,
          keyDerivationSalt: encryptionKeys?.salt ? 
            Array.from(encryptionKeys.salt) : undefined
        })
      })
      
      if (response.ok) {
        setEntries([entry, ...entries])
        
        // Reset form
        setCurrentEntry('')
        setEntryTitle('')
        setTags([])
        setSelectedPrompt('')
        setMood(5)
      }
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Add tag
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  // Remove tag
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      entry.title?.toLowerCase().includes(searchLower) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      entry.promptText?.toLowerCase().includes(searchLower)
    )
  })

  // Get random prompt
  const getRandomPrompt = (type: keyof typeof JOURNAL_PROMPTS) => {
    const prompts = JOURNAL_PROMPTS[type]
    if (!prompts || prompts.length === 0) return ''
    return prompts[Math.floor(Math.random() * prompts.length)]
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Editor */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Journal</h2>
                <p className="text-gray-600">Your private space for thoughts and reflections</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEncrypted ? (
                <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Encrypted</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Not Encrypted</span>
                </div>
              )}
            </div>
          </div>

          {/* Entry Type Selection */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(JOURNAL_PROMPTS).concat(['freeform']).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type as keyof typeof JOURNAL_PROMPTS)
                  if (type !== 'freeform') {
                    setShowPrompts(true)
                  }
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedType === type
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {type === 'freeform' && '✍️'}
                {type === 'gratitude' && '🙏'}
                {type === 'reflection' && '🤔'}
                {type === 'goals' && '🎯'}
                {type === 'emotions' && '❤️'}
                {type === 'therapy' && '🧘'}
                {' '}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Prompt Selection */}
          <AnimatePresence>
            {showPrompts && selectedType !== 'freeform' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Choose a prompt or get inspired:</span>
                  <button
                    onClick={() => {
                      const prompt = getRandomPrompt(selectedType as keyof typeof JOURNAL_PROMPTS)
                      setSelectedPrompt(prompt)
                    }}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Sparkles className="w-4 h-4" />
                    Random Prompt
                  </button>
                </div>
                {selectedPrompt && (
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-indigo-900 italic">{selectedPrompt}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Title Input */}
          <input
            type="text"
            placeholder="Entry title (optional)"
            value={entryTitle}
            onChange={(e) => setEntryTitle(e.target.value)}
            className="w-full mb-4 px-4 py-2 text-lg font-semibold border-b border-gray-200 focus:border-indigo-500 focus:outline-none"
          />

          {/* Main Text Area */}
          <textarea
            placeholder={selectedPrompt || "Start writing your thoughts..."}
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            className="w-full h-96 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.8' }}
          />

          {/* Word Count */}
          <div className="mt-2 text-right text-sm text-gray-500">
            {currentEntry.split(/\s+/).filter(word => word.length > 0).length} words
          </div>

          {/* Tags */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Add tags..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-3 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={addTag}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-gray-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Mood Tracker */}
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Heart className="w-4 h-4" />
              Mood: {mood}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Privacy Settings */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  {isPrivate ? <Lock className="w-4 h-4 inline" /> : <Unlock className="w-4 h-4 inline" />}
                  {' '}Private Entry
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEncrypted}
                  onChange={(e) => setIsEncrypted(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  <Shield className="w-4 h-4 inline" />
                  {' '}Encrypt Content
                </span>
              </label>
            </div>

            {/* Save Button */}
            <button
              onClick={saveEntry}
              disabled={isSaving || !currentEntry.trim()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
                isSaving || !currentEntry.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"
              )}
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Previous Entries */}
      <div className="space-y-6">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Previous Entries */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            Previous Entries
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No entries yet. Start writing!
              </p>
            ) : (
              filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 line-clamp-1">
                        {entry.title || 'Untitled Entry'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                        {entry.entryType !== 'freeform' && (
                          <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                            {entry.entryType}
                          </span>
                        )}
                        {entry.mood && (
                          <span className="text-xs">
                            {entry.mood >= 7 ? '😊' : entry.mood >= 4 ? '😐' : '😔'}
                          </span>
                        )}
                      </div>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {entry.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{entry.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Writing Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">Writing Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Entries</span>
              <span className="font-semibold">{entries.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="font-semibold">
                {entries.filter(e => {
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return new Date(e.createdAt) > weekAgo
                }).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Words</span>
              <span className="font-semibold">
                {entries.reduce((sum, e) => sum + e.wordCount, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg. Mood</span>
              <span className="font-semibold">
                {entries.length > 0
                  ? (entries.reduce((sum, e) => sum + (e.mood || 5), 0) / entries.length).toFixed(1)
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Viewer Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEntry.title || 'Untitled Entry'}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                    <span>{new Date(selectedEntry.createdAt).toLocaleDateString()}</span>
                    {selectedEntry.entryType !== 'freeform' && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                        {selectedEntry.entryType}
                      </span>
                    )}
                    {selectedEntry.mood && (
                      <span>Mood: {selectedEntry.mood}/10</span>
                    )}
                  </div>
                </div>

                {selectedEntry.promptText && (
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-indigo-900 italic">{selectedEntry.promptText}</p>
                  </div>
                )}

                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}>
                    {selectedEntry.content || '[Encrypted Content]'}
                  </p>
                </div>

                {selectedEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}