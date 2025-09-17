'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  WifiOff,
  Wifi,
  Cloud,
  CloudOff,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { offlineStorage } from '@/lib/offline-storage'

interface SyncStatus {
  pending: number
  synced: number
  isOnline: boolean
  lastSync?: Date
}

export default function OfflineIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0,
    synced: 0,
    isOnline: navigator.onLine
  })
  const [showDetails, setShowDetails] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    updateSyncStatus()
    
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }))
      updateSyncStatus()
    }
    
    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Update sync status periodically
    const interval = setInterval(updateSyncStatus, 30000) // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const updateSyncStatus = async () => {
    try {
      const status = await offlineStorage.getSyncStatus()
      setSyncStatus(prev => ({
        ...prev,
        pending: status.pending,
        synced: status.synced,
        lastSync: status.pending === 0 ? new Date() : prev.lastSync
      }))
    } catch (error) {
      console.error('Error updating sync status:', error)
    }
  }

  const forcSync = async () => {
    if (!syncStatus.isOnline) return
    
    setIsSyncing(true)
    try {
      // Force sync by going offline and back online
      window.dispatchEvent(new Event('offline'))
      await new Promise(resolve => setTimeout(resolve, 100))
      window.dispatchEvent(new Event('online'))
      
      // Wait a bit for sync to complete
      await new Promise(resolve => setTimeout(resolve, 2000))
      await updateSyncStatus()
    } catch (error) {
      console.error('Error during force sync:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'text-red-500'
    if (syncStatus.pending > 0) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return WifiOff
    if (syncStatus.pending > 0) return CloudOff
    return CheckCircle
  }

  const getStatusMessage = () => {
    if (!syncStatus.isOnline) {
      return `Offline - ${syncStatus.pending} items waiting to sync`
    }
    if (syncStatus.pending > 0) {
      return `${syncStatus.pending} items pending sync`
    }
    return 'All data synced'
  }

  const StatusIcon = getStatusIcon()

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {(!syncStatus.isOnline || syncStatus.pending > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* Main Status Bar */}
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                !syncStatus.isOnline ? "bg-red-50" : 
                syncStatus.pending > 0 ? "bg-yellow-50" : "bg-green-50"
              )}
              onClick={() => setShowDetails(!showDetails)}
            >
              <StatusIcon className={cn("w-5 h-5", getStatusColor())} />
              <div className="flex-1">
                <div className={cn("text-sm font-medium", getStatusColor())}>
                  {!syncStatus.isOnline ? 'Offline Mode' : 
                   syncStatus.pending > 0 ? 'Sync Pending' : 'Synced'}
                </div>
                <div className="text-xs text-gray-600">
                  {getStatusMessage()}
                </div>
              </div>
              {syncStatus.isOnline && syncStatus.pending > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    forcSync()
                  }}
                  disabled={isSyncing}
                  className="p-1 hover:bg-white rounded-md transition-colors"
                >
                  <RefreshCw className={cn(
                    "w-4 h-4 text-gray-500",
                    isSyncing && "animate-spin"
                  )} />
                </button>
              )}
            </div>

            {/* Detailed Status */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-4 space-y-3">
                    {/* Connection Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Connection:</span>
                      <div className="flex items-center gap-2">
                        {syncStatus.isOnline ? (
                          <>
                            <Wifi className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Online</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">Offline</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Sync Statistics */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Pending:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {syncStatus.pending} items
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Synced:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {syncStatus.synced} items
                        </span>
                      </div>
                    </div>

                    {/* Last Sync */}
                    {syncStatus.lastSync && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last sync:</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                              Math.floor((syncStatus.lastSync.getTime() - Date.now()) / (1000 * 60)),
                              'minute'
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Offline Mode Info */}
                    {!syncStatus.isOnline && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-700">
                            <div className="font-medium mb-1">Offline Mode Active</div>
                            <div>
                              Your self-help tools continue to work offline. 
                              Data will sync automatically when connection is restored.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sync Progress */}
                    {syncStatus.pending > 0 && syncStatus.isOnline && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Sync Progress</span>
                          <span className="text-xs text-gray-500">
                            {((syncStatus.synced / (syncStatus.synced + syncStatus.pending)) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(syncStatus.synced / (syncStatus.synced + syncStatus.pending)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex gap-2">
                        {syncStatus.isOnline && syncStatus.pending > 0 && (
                          <button
                            onClick={forcSync}
                            disabled={isSyncing}
                            className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                          </button>
                        )}
                        <button
                          onClick={() => setShowDetails(false)}
                          className="flex-1 bg-gray-200 text-gray-700 text-xs py-2 px-3 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always visible minimal indicator when all is synced */}
      <AnimatePresence>
        {syncStatus.isOnline && syncStatus.pending === 0 && !showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-green-500 rounded-full p-2 shadow-lg"
            title="All data synced"
          >
            <Cloud className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hook for using offline status in components
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
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

// Component for offline-specific messaging
export function OfflineMessage({ children }: { children: React.ReactNode }) {
  const isOffline = useOfflineStatus()

  if (!isOffline) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4"
    >
      <div className="flex items-start gap-2">
        <WifiOff className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          {children}
        </div>
      </div>
    </motion.div>
  )
}