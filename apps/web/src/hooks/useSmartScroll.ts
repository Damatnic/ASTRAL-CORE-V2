import { useEffect, useRef, useState, useCallback } from 'react';

interface UseSmartScrollOptions {
  threshold?: number;
  forceScrollOnCrisis?: boolean;
  respectReducedMotion?: boolean;
}

interface UseSmartScrollReturn {
  scrollRef: React.RefObject<HTMLDivElement>;
  isAtBottom: boolean;
  hasNewMessages: boolean;
  userHasScrolled: boolean;
  scrollToBottom: () => void;
  forceScrollToBottom: () => void;
  scrollToTop: () => void;
  markMessagesRead: () => void;
}

export function useSmartScroll(
  messages: any[] = [],
  options: UseSmartScrollOptions = {}
): UseSmartScrollReturn {
  const {
    threshold = 100,
    forceScrollOnCrisis = true,
    respectReducedMotion = true
  } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Check if user prefers reduced motion
  const prefersReducedMotion = useCallback(() => {
    if (!respectReducedMotion) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [respectReducedMotion]);

  // Check if user is at bottom of scroll area
  const checkIsAtBottom = useCallback(() => {
    if (!scrollRef.current) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= threshold;
  }, [threshold]);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback((force = false) => {
    if (!scrollRef.current) return;

    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    
    if (force || (isAtBottom && !userHasScrolled)) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior
      });
      setHasNewMessages(false);
    }
  }, [isAtBottom, userHasScrolled, prefersReducedMotion]);

  // Force scroll to bottom (for crisis messages)
  const forceScrollToBottom = useCallback(() => {
    if (!scrollRef.current) return;

    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior
    });
    setHasNewMessages(false);
    setUserHasScrolled(false);
  }, [prefersReducedMotion]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (!scrollRef.current) return;

    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    scrollRef.current.scrollTo({
      top: 0,
      behavior
    });
  }, [prefersReducedMotion]);

  // Mark messages as read
  const markMessagesRead = useCallback(() => {
    setHasNewMessages(false);
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const atBottom = checkIsAtBottom();
    setIsAtBottom(atBottom);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to detect when user has stopped scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setUserHasScrolled(!atBottom);
      if (atBottom) {
        setHasNewMessages(false);
      }
    }, 150);
  }, [checkIsAtBottom]);

  // Handle new messages
  useEffect(() => {
    if (messages.length > lastMessageCount && lastMessageCount > 0) {
      const newMessages = messages.slice(lastMessageCount);
      const hasCrisisMessage = forceScrollOnCrisis && 
        newMessages.some(msg => 
          msg.priority === 'crisis' || 
          msg.type === 'crisis' || 
          msg.sender === 'crisis-bot'
        );

      if (hasCrisisMessage) {
        // Force scroll for crisis messages
        forceScrollToBottom();
      } else if (isAtBottom && !userHasScrolled) {
        // Auto-scroll only if user is at bottom
        scrollToBottom();
      } else {
        // Show new message indicator
        setHasNewMessages(true);
      }
    }
    
    setLastMessageCount(messages.length);
  }, [messages.length, lastMessageCount, isAtBottom, userHasScrolled, forceScrollOnCrisis, scrollToBottom, forceScrollToBottom]);

  // Attach scroll listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'End':
            event.preventDefault();
            forceScrollToBottom();
            break;
          case 'Home':
            event.preventDefault();
            scrollToTop();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [forceScrollToBottom, scrollToTop]);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && lastMessageCount === 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        forceScrollToBottom();
      }, 100);
    }
  }, [messages.length, lastMessageCount, forceScrollToBottom]);

  return {
    scrollRef,
    isAtBottom,
    hasNewMessages,
    userHasScrolled,
    scrollToBottom,
    forceScrollToBottom,
    scrollToTop,
    markMessagesRead
  };
}