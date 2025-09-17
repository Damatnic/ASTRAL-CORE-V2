/**
 * External module declarations for UI package
 * Temporary solution for module resolution issues
 */

declare module 'framer-motion' {
  export interface MotionProps {
    initial?: any;
    animate?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface AnimatePresenceProps {
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export const motion: {
    div: React.ComponentType<MotionProps & React.HTMLAttributes<HTMLDivElement>>;
    button: React.ComponentType<MotionProps & React.ButtonHTMLAttributes<HTMLButtonElement>>;
    [key: string]: React.ComponentType<any>;
  };
  
  export const AnimatePresence: React.ComponentType<AnimatePresenceProps>;
}

declare module 'lucide-react' {
  export interface IconProps {
    className?: string;
    'aria-hidden'?: boolean | string;
    [key: string]: any;
  }
  
  export const Heart: React.ComponentType<IconProps>;
  export const MessageCircle: React.ComponentType<IconProps>;
  export const Phone: React.ComponentType<IconProps>;
  export const Send: React.ComponentType<IconProps>;
  export const Shield: React.ComponentType<IconProps>;
  export const Clock: React.ComponentType<IconProps>;
  export const AlertTriangle: React.ComponentType<IconProps>;
  export const PhoneCall: React.ComponentType<IconProps>;
  export const MessageSquare: React.ComponentType<IconProps>;
  export const Lock: React.ComponentType<IconProps>;
  
  // Add all other icons as needed
}

declare module 'class-variance-authority' {
  export interface VariantProps<T> {
    [key: string]: any;
  }
  
  export function cva(base: any, config?: any): any;
  export type { VariantProps };
}