/**
 * Offline Storage Utilities for Self-Help Tools
 * Provides offline functionality for critical mental health tools
 * Uses IndexedDB for persistent storage when offline
 */

interface OfflineData {
  id: string
  type: 'mood' | 'journal' | 'breathing' | 'grounding' | 'crisis'
  data: any
  timestamp: Date
  synced: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface OfflineConfig {
  dbName: string
  dbVersion: number
  stores: {
    name: string
    keyPath: string
    indexes?: { name: string, keyPath: string, unique?: boolean }[]
  }[]
}

class OfflineStorage {
  private db: IDBDatabase | null = null
  private isOnline: boolean = true
  private syncQueue: OfflineData[] = []
  private config: OfflineConfig

  constructor() {
    this.config = {
      dbName: 'AstralSelfHelpDB',
      dbVersion: 1,
      stores: [
        {
          name: 'offlineData',
          keyPath: 'id',
          indexes: [
            { name: 'type', keyPath: 'type' },
            { name: 'timestamp', keyPath: 'timestamp' },
            { name: 'synced', keyPath: 'synced' },
            { name: 'priority', keyPath: 'priority' }
          ]
        },
        {
          name: 'userSettings',
          keyPath: 'key'
        },
        {
          name: 'breathingExercises',
          keyPath: 'id'
        },
        {
          name: 'groundingTechniques',
          keyPath: 'id'
        }
      ]
    }

    this.initializeDB()
    this.setupOnlineListener()
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported - offline functionality disabled')
        resolve()
        return
      }

      const request = indexedDB.open(this.config.dbName, this.config.dbVersion)

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB initialized successfully')
        this.syncPendingData()
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        this.config.stores.forEach(storeConfig => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath
            })

            // Create indexes
            storeConfig.indexes?.forEach(index => {
              store.createIndex(index.name, index.keyPath, {
                unique: index.unique || false
              })
            })
          }
        })
      }
    })
  }

  /**
   * Setup online/offline event listeners
   */
  private setupOnlineListener(): void {
    this.isOnline = navigator.onLine

    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('Connection restored - syncing offline data')
      this.syncPendingData()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('Connection lost - switching to offline mode')
    })
  }

  /**
   * Store data with offline support
   */
  async storeData(type: OfflineData['type'], data: any, priority: OfflineData['priority'] = 'medium'): Promise<string> {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const offlineData: OfflineData = {
      id,
      type,
      data,
      timestamp: new Date(),
      synced: false,
      priority
    }

    if (this.isOnline) {
      // Try to sync immediately if online
      try {
        const synced = await this.syncDataItem(offlineData)
        if (synced) {
          offlineData.synced = true
        }
      } catch (error) {
        console.warn('Failed to sync data immediately, storing offline:', error)
      }
    }

    // Store locally regardless of sync status
    await this.saveToIndexedDB(offlineData)
    
    if (!offlineData.synced) {
      this.syncQueue.push(offlineData)
    }

    return id
  }

  /**
   * Retrieve data from offline storage
   */
  async getData(type: OfflineData['type'], limit: number = 100): Promise<OfflineData[]> {
    if (!this.db) {
      console.warn('IndexedDB not available')
      return []
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.createTransaction(['offlineData'], 'readonly')
      const store = transaction.objectStore('offlineData')
      const index = store.index('type')
      const request = index.getAll(type, limit)

      request.onsuccess = () => {
        const results = request.result
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit)
        resolve(results)
      }

      request.onerror = () => {
        console.error('Error retrieving data from IndexedDB:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Save data to IndexedDB
   */
  private async saveToIndexedDB(data: OfflineData): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not available')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.createTransaction(['offlineData'], 'readwrite')
      const store = transaction.objectStore('offlineData')
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Error saving to IndexedDB:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Sync individual data item to server
   */
  private async syncDataItem(item: OfflineData): Promise<boolean> {
    try {
      const endpoint = this.getEndpointForType(item.type)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item.data)
      })

      if (response.ok) {
        // Mark as synced in IndexedDB
        await this.markAsSynced(item.id)
        return true
      } else {
        console.warn(`Failed to sync ${item.type} data:`, response.statusText)
        return false
      }
    } catch (error) {
      console.warn(`Error syncing ${item.type} data:`, error)
      return false
    }
  }

  /**
   * Sync all pending data
   */
  private async syncPendingData(): Promise<void> {
    if (!this.isOnline || !this.db) return

    try {
      const unsyncedData = await this.getUnsyncedData()
      
      // Sort by priority (critical first) and timestamp
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      unsyncedData.sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      })

      let syncedCount = 0
      for (const item of unsyncedData) {
        const synced = await this.syncDataItem(item)
        if (synced) {
          syncedCount++
        }
        
        // Rate limit to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (syncedCount > 0) {
        console.log(`Successfully synced ${syncedCount}/${unsyncedData.length} offline items`)
      }
    } catch (error) {
      console.error('Error during data sync:', error)
    }
  }

  /**
   * Get unsynced data from IndexedDB
   */
  private async getUnsyncedData(): Promise<OfflineData[]> {
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.createTransaction(['offlineData'], 'readonly')
      const store = transaction.objectStore('offlineData')
      const index = store.index('synced')
      const request = index.getAll(false)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        console.error('Error getting unsynced data:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Mark data as synced
   */
  private async markAsSynced(id: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.createTransaction(['offlineData'], 'readwrite')
      const store = transaction.objectStore('offlineData')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const data = getRequest.result
        if (data) {
          data.synced = true
          const putRequest = store.put(data)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  /**
   * Get API endpoint for data type
   */
  private getEndpointForType(type: OfflineData['type']): string {
    const endpoints = {
      mood: '/api/self-help/mood',
      journal: '/api/self-help/journal',
      breathing: '/api/self-help/breathing',
      grounding: '/api/self-help/grounding',
      crisis: '/api/crisis-intervention/session'
    }
    return endpoints[type]
  }

  /**
   * Store essential data for offline use
   */
  async cacheEssentialData(): Promise<void> {
    if (!this.isOnline) return

    try {
      // Cache breathing exercises
      const breathingResponse = await fetch('/api/self-help/breathing')
      if (breathingResponse.ok) {
        const breathingData = await breathingResponse.json()
        await this.storeInCache('breathingExercises', breathingData.data.exercises || [])
      }

      // Cache grounding techniques
      const groundingResponse = await fetch('/api/self-help/grounding')
      if (groundingResponse.ok) {
        const groundingData = await groundingResponse.json()
        await this.storeInCache('groundingTechniques', groundingData.data.techniques || [])
      }

      console.log('Essential data cached for offline use')
    } catch (error) {
      console.error('Error caching essential data:', error)
    }
  }

  /**
   * Store data in specific cache store
   */
  private async storeInCache(storeName: string, data: any[]): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.createTransaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      
      // Clear existing data
      const clearRequest = store.clear()
      
      clearRequest.onsuccess = () => {
        // Add new data
        let completed = 0
        const total = data.length
        
        if (total === 0) {
          resolve()
          return
        }
        
        data.forEach(item => {
          const request = store.add(item)
          request.onsuccess = () => {
            completed++
            if (completed === total) resolve()
          }
          request.onerror = () => reject(request.error)
        })
      }
      
      clearRequest.onerror = () => reject(clearRequest.error)
    })
  }

  /**
   * Get cached data for offline use
   */
  async getCachedData(storeName: string): Promise<any[]> {
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.createTransaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        console.error(`Error getting cached data from ${storeName}:`, request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Check if offline mode is active
   */
  isOffline(): boolean {
    return !this.isOnline
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{ pending: number, synced: number }> {
    const allData = await this.getData('mood')
      .then(mood => this.getData('journal')
        .then(journal => this.getData('breathing')
          .then(breathing => this.getData('grounding')
            .then(grounding => [...mood, ...journal, ...breathing, ...grounding]))))

    const pending = allData.filter(item => !item.synced).length
    const synced = allData.filter(item => item.synced).length

    return { pending, synced }
  }

  /**
   * Clear old data (older than 30 days)
   */
  async cleanupOldData(): Promise<void> {
    if (!this.db) return

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return new Promise((resolve, reject) => {
      const transaction = this.db!.createTransaction(['offlineData'], 'readwrite')
      const store = transaction.objectStore('offlineData')
      const index = store.index('timestamp')
      const range = IDBKeyRange.upperBound(thirtyDaysAgo)
      const request = index.openCursor(range)

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          // Only delete synced data
          if (cursor.value.synced) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => {
        console.error('Error cleaning up old data:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Export data for backup
   */
  async exportData(): Promise<string> {
    const allData = await this.getData('mood')
      .then(mood => this.getData('journal')
        .then(journal => this.getData('breathing')
          .then(breathing => this.getData('grounding')
            .then(grounding => ({ mood, journal, breathing, grounding })))))

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      data: allData,
      version: '1.0'
    })
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorage()

// Helper function to store mood data with offline support
export async function storeMoodOffline(moodData: any): Promise<string> {
  const priority = moodData.mood <= 3 ? 'critical' : moodData.mood <= 5 ? 'high' : 'medium'
  return offlineStorage.storeData('mood', moodData, priority)
}

// Helper function to store journal data with offline support
export async function storeJournalOffline(journalData: any): Promise<string> {
  const priority = journalData.sentimentScore < -0.5 ? 'high' : 'medium'
  return offlineStorage.storeData('journal', journalData, priority)
}

// Helper function to store breathing session with offline support
export async function storeBreathingOffline(sessionData: any): Promise<string> {
  const priority = sessionData.anxietyBefore >= 8 ? 'high' : 'low'
  return offlineStorage.storeData('breathing', sessionData, priority)
}

// Helper function to store grounding session with offline support
export async function storeGroundingOffline(sessionData: any): Promise<string> {
  const priority = sessionData.severityBefore >= 8 ? 'critical' : sessionData.severityBefore >= 6 ? 'high' : 'medium'
  return offlineStorage.storeData('grounding', sessionData, priority)
}

// Helper function to check connectivity and show offline indicators
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine)

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOffline
}

export default offlineStorage