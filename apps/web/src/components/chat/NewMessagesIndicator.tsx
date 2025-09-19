import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle } from 'lucide-react';

interface NewMessagesIndicatorProps {
  show: boolean;
  hasCrisisMessage?: boolean;
  messageCount?: number;
  onClick: () => void;
  className?: string;
}

export function NewMessagesIndicator({
  show,
  hasCrisisMessage = false,
  messageCount = 0,
  onClick,
  className = ''
}: NewMessagesIndicatorProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={onClick}
          className={`
            fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50
            flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg
            transition-all duration-200 hover:scale-105 focus:scale-105
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${hasCrisisMessage 
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 animate-pulse' 
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }
            ${className}
          `}
          aria-label={
            hasCrisisMessage 
              ? `New crisis message available. Click to scroll to bottom.`
              : `${messageCount} new message${messageCount !== 1 ? 's' : ''} available. Click to scroll to bottom.`
          }
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }}
        >
          {hasCrisisMessage && (
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex-shrink-0"
            >
              <AlertTriangle className="w-4 h-4" />
            </motion.div>
          )}
          
          <span className="text-sm font-medium">
            {hasCrisisMessage 
              ? 'Crisis Message' 
              : messageCount > 0 
                ? `${messageCount} New Message${messageCount !== 1 ? 's' : ''}`
                : 'New Messages'
            }
          </span>
          
          <motion.div
            animate={{ y: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default NewMessagesIndicator;