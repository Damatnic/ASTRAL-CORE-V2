import React, { ReactNode, useState, useEffect } from 'react';
import { Heart, Shield, Moon, Sun, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import { tokens } from '../../design-tokens/tokens';

interface TherapeuticLayoutProps {
  children: ReactNode;
  mode?: 'calm' | 'crisis' | 'therapy' | 'recovery';
  enableCalmMode?: boolean;
  enableDarkMode?: boolean;
  enableAmbientSounds?: boolean;
  showSafetyIndicator?: boolean;
  showBreathingPrompt?: boolean;
  className?: string;
}

export const TherapeuticLayout: React.FC<TherapeuticLayoutProps> = ({
  children,
  mode = 'calm',
  enableCalmMode = true,
  enableDarkMode = false,
  enableAmbientSounds = false,
  showSafetyIndicator = true,
  showBreathingPrompt = false,
  className,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(enableDarkMode);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(enableAmbientSounds);
  const [showBreathing, setShowBreathing] = useState(showBreathingPrompt);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');

  // Breathing animation cycle
  useEffect(() => {
    if (showBreathing) {
      const interval = setInterval(() => {
        setBreathingPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
      }, 4000); // 4-second cycles
      return () => clearInterval(interval);
    }
    return undefined;
  }, [showBreathing]);

  // Mode-specific styling
  const getModeClasses = () => {
    switch (mode) {
      case 'crisis':
        return {
          background: 'bg-gradient-to-b from-red-50 to-red-100',
          accent: 'border-red-200',
          text: 'text-red-900',
        };
      case 'therapy':
        return {
          background: 'bg-gradient-to-b from-blue-50 to-blue-100',
          accent: 'border-blue-200',
          text: 'text-blue-900',
        };
      case 'recovery':
        return {
          background: 'bg-gradient-to-b from-green-50 to-green-100',
          accent: 'border-green-200',
          text: 'text-green-900',
        };
      default: // calm
        return {
          background: 'bg-gradient-to-b from-purple-50 to-purple-100',
          accent: 'border-purple-200',
          text: 'text-purple-900',
        };
    }
  };

  const modeClasses = getModeClasses();

  return (
    <div
      className={cn(
        'min-h-screen transition-all duration-500 ease-out',
        isDarkMode 
          ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white' 
          : modeClasses.background,
        className
      )}
    >
      {/* Therapeutic Controls Bar */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        {/* Safety Indicator */}
        {showSafetyIndicator && (
          <div className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-full backdrop-blur-sm",
            "bg-white/80 border shadow-sm",
            modeClasses.accent
          )}>
            <div className="relative">
              <Shield className={cn("w-4 h-4", modeClasses.text)} />
              <span className="absolute -top-1 -right-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
              </span>
            </div>
            <span className={cn("text-xs font-medium", modeClasses.text)}>
              Safe Space
            </span>
          </div>
        )}

        {/* Ambient Sound Toggle */}
        <button
          onClick={() => setIsAmbientPlaying(!isAmbientPlaying)}
          className={cn(
            "p-2 rounded-full backdrop-blur-sm transition-all duration-200",
            "bg-white/80 border hover:bg-white/90 focus:outline-none focus:ring-2",
            modeClasses.accent,
            "focus:ring-blue-500 focus:ring-offset-2"
          )}
          aria-label={isAmbientPlaying ? "Pause ambient sounds" : "Play ambient sounds"}
        >
          {isAmbientPlaying ? (
            <Volume2 className={cn("w-4 h-4", modeClasses.text)} />
          ) : (
            <VolumeX className={cn("w-4 h-4", modeClasses.text)} />
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={cn(
            "p-2 rounded-full backdrop-blur-sm transition-all duration-200",
            "bg-white/80 border hover:bg-white/90 focus:outline-none focus:ring-2",
            modeClasses.accent,
            "focus:ring-blue-500 focus:ring-offset-2"
          )}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className={cn("w-4 h-4", modeClasses.text)} />
          ) : (
            <Moon className={cn("w-4 h-4", modeClasses.text)} />
          )}
        </button>

        {/* Breathing Exercise Toggle */}
        <button
          onClick={() => setShowBreathing(!showBreathing)}
          className={cn(
            "p-2 rounded-full backdrop-blur-sm transition-all duration-200",
            "bg-white/80 border hover:bg-white/90 focus:outline-none focus:ring-2",
            modeClasses.accent,
            "focus:ring-blue-500 focus:ring-offset-2",
            showBreathing && "bg-blue-100 border-blue-300"
          )}
          aria-label={showBreathing ? "Hide breathing guide" : "Show breathing guide"}
        >
          <Heart className={cn(
            "w-4 h-4 transition-all duration-1000",
            modeClasses.text,
            showBreathing && breathingPhase === 'inhale' && "scale-110",
            showBreathing && breathingPhase === 'exhale' && "scale-90"
          )} />
        </button>
      </div>

      {/* Breathing Guide Overlay */}
      {showBreathing && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
          <div className="text-center space-y-4">
            {/* Breathing Circle */}
            <div className="relative flex items-center justify-center">
              <div
                className={cn(
                  "w-32 h-32 rounded-full border-4 transition-all duration-4000 ease-in-out",
                  "border-blue-400 bg-blue-50/30 backdrop-blur-sm",
                  breathingPhase === 'inhale' ? "scale-110" : "scale-90"
                )}
                style={{
                  background: tokens.colors.gradients.breathing,
                  boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>

            {/* Breathing Text */}
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-200">
              <p className="text-lg font-medium text-blue-900">
                {breathingPhase === 'inhale' ? 'Breathe In...' : 'Breathe Out...'}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {breathingPhase === 'inhale' ? 'Fill your lungs slowly' : 'Release tension gently'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Ambient Background Elements */}
      {enableCalmMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Floating particles for calm atmosphere */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-2 h-2 rounded-full opacity-20",
                "bg-gradient-to-r from-blue-400 to-purple-400",
                "animate-float"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapeuticLayout;