/**
 * Animated Components Library
 * Pre-built React components with modern animations
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Button, Card, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import {
  transitions,
  easings,
  durations,
  presets,
  animationUtils,
} from './modern-animations';

// Create keyframes for animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const slideInFromLeft = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInFromRight = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInFromTop = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideInFromBottom = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const breathe = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

const shimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Animation styles using the keyframes
const animationStyles = {
  fadeInOnMount: {
    animation: `${fadeIn} ${durations.normal}ms ${easings.standard}`,
  },
  scaleInOnMount: {
    animation: `${scaleIn} ${durations.normal}ms ${easings.gentle}`,
  },
  slideInLeft: {
    animation: `${slideInFromLeft} ${durations.slide}ms ${easings.decelerate}`,
  },
  slideInRight: {
    animation: `${slideInFromRight} ${durations.slide}ms ${easings.decelerate}`,
  },
  slideInTop: {
    animation: `${slideInFromTop} ${durations.slide}ms ${easings.decelerate}`,
  },
  slideInBottom: {
    animation: `${slideInFromBottom} ${durations.slide}ms ${easings.decelerate}`,
  },
  loading: {
    animation: `${rotate} ${durations.slowest}ms linear infinite`,
  },
  shimmer: {
    background: 'linear-gradient(to right, #f0f0f0 8%, #f8f8f8 18%, #f0f0f0 33%)',
    backgroundSize: '800px 100px',
    animation: `${shimmer} 1.5s linear infinite`,
  },
  breathing: {
    animation: `${breathe} 4000ms ${easings.smooth} infinite`,
  },
  floating: {
    animation: `${float} 3000ms ${easings.smooth} infinite`,
  },
  pulse: {
    animation: `${pulse} 2000ms ${easings.gentle} infinite`,
  },
};

// Animated container that fades in on mount
export const FadeInContainer: any = styled(Box)(() => ({
  ...animationStyles.fadeInOnMount,
}));

// Scale in container for cards and modals
export const ScaleInContainer: any = styled(Box)(() => ({
  ...animationStyles.scaleInOnMount,
}));

// Slide in containers for different directions
export const SlideInLeft: any = styled(Box)(() => ({
  ...animationStyles.slideInLeft,
}));

export const SlideInRight: any = styled(Box)(() => ({
  ...animationStyles.slideInRight,
}));

export const SlideInTop: any = styled(Box)(() => ({
  ...animationStyles.slideInTop,
}));

export const SlideInBottom: any = styled(Box)(() => ({
  ...animationStyles.slideInBottom,
}));

// Floating card for subtle movement
export const FloatingCard: any = styled(Card)(({ theme }: any) => ({
  ...animationStyles.floating,
  transition: transitions.allSafe,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

// Breathing circle for mindfulness exercises
export const BreathingCircle: any = styled(Box)(({ theme }: any) => ({
  width: 200,
  height: 200,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  ...animationStyles.breathing,
}));

// Shimmer loading placeholder
export const ShimmerPlaceholder: any = styled(Box)(({ theme }: any) => ({
  height: 20,
  borderRadius: theme.shape.borderRadius,
  ...animationStyles.shimmer,
}));

// Pulsing notification badge
export const PulsingBadge: any = styled(Box)(({ theme }: any) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: theme.palette.error.main,
  ...animationStyles.pulse,
}));

// Loading spinner
export const LoadingSpinner: any = styled(Box)(({ theme }: any) => ({
  width: 40,
  height: 40,
  border: `3px solid ${theme.palette.divider}`,
  borderTop: `3px solid ${theme.palette.primary.main}`,
  borderRadius: '50%',
  ...animationStyles.loading,
}));

// Animated button with ripple effect
export const AnimatedButton: any = styled(Button)(({ theme }: any) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: transitions.allSafe,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.5)',
    transform: 'translate(-50%, -50%)',
    transition: `width ${durations.ripple}ms ${easings.decelerate}, height ${durations.ripple}ms ${easings.decelerate}`,
  },
  '&:active::after': {
    width: 300,
    height: 300,
  },
}));

// Expandable accordion item
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Paper sx={{ mb: 2, overflow: 'hidden' }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          p: 2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: transitions.colors,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <Box
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: transitions.transform(),
          }}
        >
          ▼
        </Box>
      </Box>
      <Box
        ref={contentRef}
        sx={{
          maxHeight: expanded ? '1000px' : 0,
          opacity: expanded ? 1 : 0,
          transition: transitions.expand,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2 }}>{children}</Box>
      </Box>
    </Paper>
  );
};

// Staggered list animation
interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.children;
      Array.from(items).forEach((item, index) => {
        (item as HTMLElement).style.opacity = '0';
        (item as HTMLElement).style.transform = 'translateY(20px)';
        setTimeout(() => {
          (item as HTMLElement).style.transition = transitions.allSafe;
          (item as HTMLElement).style.opacity = '1';
          (item as HTMLElement).style.transform = 'translateY(0)';
        }, index * staggerDelay);
      });
    }
  }, [staggerDelay, children]);

  return <Box ref={containerRef}>{children}</Box>;
};

// Scroll reveal component
interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'slideInTop' | 'slideInBottom' | 'scaleIn';
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fadeIn',
  threshold = 0.1,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const getAnimationStyle = (): any => {
    if (!isVisible) {
      return { opacity: 0, transform: getInitialTransform(animation) };
    }

    switch (animation) {
      case 'fadeIn':
        return animationStyles.fadeInOnMount;
      case 'slideInLeft':
        return animationStyles.slideInLeft;
      case 'slideInRight':
        return animationStyles.slideInRight;
      case 'slideInTop':
        return animationStyles.slideInTop;
      case 'slideInBottom':
        return animationStyles.slideInBottom;
      case 'scaleIn':
        return animationStyles.scaleInOnMount;
      default:
        return animationStyles.fadeInOnMount;
    }
  };

  const getInitialTransform = (animation: string) => {
    switch (animation) {
      case 'slideInLeft':
        return 'translateX(-50px)';
      case 'slideInRight':
        return 'translateX(50px)';
      case 'slideInTop':
        return 'translateY(-50px)';
      case 'slideInBottom':
        return 'translateY(50px)';
      case 'scaleIn':
        return 'scale(0.8)';
      default:
        return 'none';
    }
  };

  return (
    <Box ref={elementRef} sx={getAnimationStyle()}>
      {children}
    </Box>
  );
};

// Modal with animation
interface AnimatedModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  open,
  onClose,
  children,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const timeout = setTimeout(() => setMounted(false), durations.normal);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [open]);

  if (!mounted) return null;

  const getOverlayStyle = (): any => {
    if (open) {
      return presets.modal.overlay.entered;
    }
    return presets.modal.overlay.exiting;
  };

  const getContentStyle = (): any => {
    if (open) {
      return presets.modal.content.entered;
    }
    return presets.modal.content.exiting;
  };

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        ...getOverlayStyle(),
      }}
    >
      <Paper
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        sx={{
          p: 4,
          maxWidth: 600,
          maxHeight: '80vh',
          overflow: 'auto',
          ...getContentStyle(),
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

// Toast notification
interface ToastProps {
  message: string;
  open: boolean;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  open,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(onClose, duration);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [open, duration, onClose]);

  const getStyle = (): any => {
    if (open) {
      return presets.toast.entered;
    }
    return presets.toast.exiting;
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)' as any,
        p: 2,
        minWidth: 200,
        textAlign: 'center',
        zIndex: 1400,
        ...getStyle(),
      }}
    >
      <Typography>{message}</Typography>
    </Paper>
  );
};

// Progress bar with animation
interface AnimatedProgressProps {
  value: number;
  color?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  color = 'primary.main',
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: 4,
        backgroundColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: `${value}%`,
          height: '100%',
          backgroundColor: color,
          transition: `width ${durations.normal}ms ${easings.standard}`,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: `${shimmer} 1.5s linear infinite`,
          },
        }}
      />
    </Box>
  );
};

// Skeleton loader with shimmer effect
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  variant = 'text',
}) => {
  const getBorderRadius = () => {
    switch (variant) {
      case 'circular':
        return '50%';
      case 'rectangular':
        return 1;
      default:
        return 0.5;
    }
  };

  return (
    <Box
      sx={{
        width,
        height,
        borderRadius: getBorderRadius(),
        ...animationStyles.shimmer,
      }}
    />
  );
};

// Export all components
const AnimatedComponents: any = {
  FadeInContainer,
  ScaleInContainer,
  SlideInLeft,
  SlideInRight,
  SlideInTop,
  SlideInBottom,
  FloatingCard,
  BreathingCircle,
  ShimmerPlaceholder,
  PulsingBadge,
  LoadingSpinner,
  AnimatedButton,
  AccordionItem,
  StaggeredList,
  ScrollReveal,
  AnimatedModal,
  Toast,
  AnimatedProgress,
  Skeleton,
};

export default AnimatedComponents;