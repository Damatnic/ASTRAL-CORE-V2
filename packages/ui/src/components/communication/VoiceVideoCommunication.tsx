import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video, VideoOff, Mic, MicOff, Phone, PhoneCall, PhoneOff,
  Monitor, MonitorOff, Volume2, VolumeX, Settings,
  Heart, Shield, AlertTriangle, Users, Camera, CameraOff
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEmotionTheme } from '../../providers/EmotionThemeProvider';

interface VoiceVideoProps {
  mode: 'voice' | 'video' | 'screen-share';
  isActive: boolean;
  isCrisisSession?: boolean;
  participantCount?: number;
  onToggleAudio?: () => void;
  onToggleVideo?: () => void;
  onToggleScreenShare?: () => void;
  onEndCall?: () => void;
  onEmergencyEscalate?: () => void;
  className?: string;
}

interface Participant {
  id: string;
  name: string;
  role: 'user' | 'volunteer' | 'professional' | 'emergency';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
}

export const VoiceVideoCommunication: React.FC<VoiceVideoProps> = ({
  mode,
  isActive,
  isCrisisSession = false,
  participantCount = 1,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onEmergencyEscalate,
  className,
}) => {
  const { emotionalState, urgencyLevel, theme } = useEmotionTheme();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(mode === 'video');
  const [isScreenSharing, setIsScreenSharing] = useState(mode === 'screen-share');
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('good');
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const callStartTime = useRef<Date>(new Date());
  
  // Simulated participants for demo
  const [participants] = useState<Participant[]>([
    {
      id: 'user-1',
      name: 'You',
      role: 'user',
      isAudioEnabled,
      isVideoEnabled,
      isScreenSharing,
      connectionQuality: 'excellent'
    },
    ...(participantCount > 1 ? [{
      id: 'volunteer-1',
      name: 'Crisis Counselor Sarah',
      role: 'volunteer' as const,
      isAudioEnabled: true,
      isVideoEnabled: mode === 'video',
      isScreenSharing: false,
      connectionQuality: 'good' as const
    }] : [])
  ]);

  // Update call duration
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current.getTime()) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleAudio = useCallback(() => {
    setIsAudioEnabled(!isAudioEnabled);
    onToggleAudio?.();
  }, [isAudioEnabled, onToggleAudio]);

  const handleToggleVideo = useCallback(() => {
    setIsVideoEnabled(!isVideoEnabled);
    onToggleVideo?.();
  }, [isVideoEnabled, onToggleVideo]);

  const handleToggleScreenShare = useCallback(() => {
    setIsScreenSharing(!isScreenSharing);
    onToggleScreenShare?.();
  }, [isScreenSharing, onToggleScreenShare]);

  const getConnectionIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user': return 'text-blue-600';
      case 'volunteer': return 'text-green-600';
      case 'professional': return 'text-purple-600';
      case 'emergency': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isActive) {
    return (
      <div className={cn(
        'bg-white rounded-lg border border-gray-200 p-6 text-center',
        className
      )}>
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            mode === 'voice' && 'bg-blue-100',
            mode === 'video' && 'bg-green-100',
            mode === 'screen-share' && 'bg-purple-100'
          )}>
            {mode === 'voice' && <Phone className="w-8 h-8 text-blue-600" />}
            {mode === 'video' && <Video className="w-8 h-8 text-green-600" />}
            {mode === 'screen-share' && <Monitor className="w-8 h-8 text-purple-600" />}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'voice' && 'Voice Call Ready'}
              {mode === 'video' && 'Video Call Ready'}
              {mode === 'screen-share' && 'Screen Share Ready'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              100% FREE crisis support communication
            </p>
          </div>
          
          {isCrisisSession && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-700">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">Crisis Session Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-gray-900 text-white rounded-lg overflow-hidden relative',
      isCrisisSession && 'border-2 border-red-500',
      className
    )}>
      {/* Crisis Mode Indicator */}
      {isCrisisSession && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center py-1 z-10">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <Heart className="w-4 h-4" />
            <span>CRISIS SESSION ACTIVE</span>
            <Heart className="w-4 h-4" />
          </div>
        </div>
      )}
      
      {/* Main Video Area */}
      <div className={cn(
        'relative h-96 bg-gray-800',
        isCrisisSession && 'pt-8'
      )}>
        {mode === 'video' && isVideoEnabled ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Video Stream Active</p>
              <p className="text-sm text-gray-300">100% FREE video support</p>
            </div>
          </div>
        ) : mode === 'screen-share' && isScreenSharing ? (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <div className="text-center">
              <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Screen Sharing Active</p>
              <p className="text-sm text-gray-300">Secure screen sharing</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Audio Call Active</p>
              <p className="text-sm text-gray-300">Voice-only crisis support</p>
            </div>
          </div>
        )}
        
        {/* Call Duration & Quality */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-3 py-1">
          <div className="flex items-center space-x-2 text-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>{formatDuration(callDuration)}</span>
            <span>{getConnectionIcon(connectionQuality)}</span>
          </div>
        </div>
        
        {/* Participant Count */}
        {participantCount > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-lg px-3 py-1">
            <div className="flex items-center space-x-2 text-sm">
              <Users className="w-4 h-4" />
              <span>{participantCount}</span>
            </div>
          </div>
        )}
        
        {/* Emergency Escalation Button */}
        {isCrisisSession && urgencyLevel === 'immediate' && (
          <div className="absolute top-16 right-4">
            <button
              onClick={onEmergencyEscalate}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>EMERGENCY</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Participants List */}
      {participants.length > 1 && (
        <div className="border-t border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Participants ({participants.length})</h4>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                    participant.role === 'user' && 'bg-blue-600',
                    participant.role === 'volunteer' && 'bg-green-600',
                    participant.role === 'professional' && 'bg-purple-600',
                    participant.role === 'emergency' && 'bg-red-600'
                  )}>
                    {participant.name.charAt(0)}
                  </div>
                  <div>
                    <p className={cn('text-sm font-medium', getRoleColor(participant.role))}>
                      {participant.name}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{participant.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {participant.isAudioEnabled ? (
                    <Mic className="w-4 h-4 text-green-400" />
                  ) : (
                    <MicOff className="w-4 h-4 text-red-400" />
                  )}
                  {mode === 'video' && (
                    participant.isVideoEnabled ? (
                      <Video className="w-4 h-4 text-green-400" />
                    ) : (
                      <VideoOff className="w-4 h-4 text-red-400" />
                    )
                  )}
                  <span className="text-xs">{getConnectionIcon(participant.connectionQuality)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Control Bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <button
            onClick={handleToggleAudio}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              isAudioEnabled 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            )}
            aria-label={isAudioEnabled ? 'Mute audio' : 'Unmute audio'}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          {/* Video Toggle */}
          {mode === 'video' && (
            <button
              onClick={handleToggleVideo}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                isVideoEnabled 
                  ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              )}
              aria-label={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          )}
          
          {/* Screen Share Toggle */}
          {mode === 'screen-share' && (
            <button
              onClick={handleToggleScreenShare}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                isScreenSharing 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              )}
              aria-label={isScreenSharing ? 'Stop screen share' : 'Start screen share'}
            >
              {isScreenSharing ? <Monitor className="w-5 h-5" /> : <MonitorOff className="w-5 h-5" />}
            </button>
          )}
          
          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center transition-colors"
            aria-label="Communication settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {/* End Call */}
          <button
            onClick={onEndCall}
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
            aria-label="End call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
        
        {/* Free Platform Reminder */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            💚 100% FREE crisis communication - No time limits
          </p>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-20 left-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 z-20">
          <h5 className="text-sm font-medium text-white mb-3">Communication Settings</h5>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Audio Quality</span>
              <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white">
                <option>High (HD Audio)</option>
                <option>Standard</option>
                <option>Low (Data Saver)</option>
              </select>
            </div>
            
            {mode === 'video' && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Video Quality</span>
                <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white">
                  <option>HD (720p)</option>
                  <option>Standard (480p)</option>
                  <option>Low (240p)</option>
                </select>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Background Noise</span>
              <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                Suppress
              </button>
            </div>
            
            {isCrisisSession && (
              <div className="border-t border-gray-600 pt-3 mt-3">
                <div className="flex items-center space-x-2 text-sm text-yellow-400">
                  <Shield className="w-4 h-4" />
                  <span>Crisis session encryption active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Quick Communication Launcher
export const CommunicationLauncher: React.FC<{
  onStartVoice?: () => void;
  onStartVideo?: () => void;
  onStartScreenShare?: () => void;
  isCrisis?: boolean;
  className?: string;
}> = ({ onStartVoice, onStartVideo, onStartScreenShare, isCrisis = false, className }) => {
  const { urgencyLevel } = useEmotionTheme();
  
  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 p-6',
      isCrisis && 'border-red-200 bg-red-50',
      className
    )}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isCrisis ? 'Crisis Communication' : 'Start Communication'}
        </h3>
        <p className="text-sm text-gray-600">
          Connect with trained volunteers and professionals - 100% FREE
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Voice Call */}
        <button
          onClick={onStartVoice}
          className={cn(
            'flex flex-col items-center p-4 rounded-lg border-2 border-dashed transition-all hover:border-solid',
            isCrisis ? 'border-red-300 hover:border-red-500 hover:bg-red-100' : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
          )}
        >
          <Phone className={cn(
            'w-8 h-8 mb-2',
            isCrisis ? 'text-red-600' : 'text-blue-600'
          )} />
          <span className="font-medium text-gray-900">Voice Call</span>
          <span className="text-xs text-gray-500 mt-1">Audio only</span>
        </button>
        
        {/* Video Call */}
        <button
          onClick={onStartVideo}
          className={cn(
            'flex flex-col items-center p-4 rounded-lg border-2 border-dashed transition-all hover:border-solid',
            isCrisis ? 'border-red-300 hover:border-red-500 hover:bg-red-100' : 'border-green-300 hover:border-green-500 hover:bg-green-50'
          )}
        >
          <Video className={cn(
            'w-8 h-8 mb-2',
            isCrisis ? 'text-red-600' : 'text-green-600'
          )} />
          <span className="font-medium text-gray-900">Video Call</span>
          <span className="text-xs text-gray-500 mt-1">Face-to-face</span>
        </button>
        
        {/* Screen Share */}
        <button
          onClick={onStartScreenShare}
          className={cn(
            'flex flex-col items-center p-4 rounded-lg border-2 border-dashed transition-all hover:border-solid',
            isCrisis ? 'border-red-300 hover:border-red-500 hover:bg-red-100' : 'border-purple-300 hover:border-purple-500 hover:bg-purple-50'
          )}
        >
          <Monitor className={cn(
            'w-8 h-8 mb-2',
            isCrisis ? 'text-red-600' : 'text-purple-600'
          )} />
          <span className="font-medium text-gray-900">Screen Share</span>
          <span className="text-xs text-gray-500 mt-1">Show resources</span>
        </button>
      </div>
      
      {/* Emergency Notice */}
      {urgencyLevel === 'immediate' && (
        <div className="mt-6 bg-red-100 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Immediate Support Available</p>
              <p className="text-sm">Crisis counselors standing by 24/7</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Free Platform Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🌟 All communication features are completely FREE with no time limits
        </p>
      </div>
    </div>
  );
};

export default VoiceVideoCommunication;