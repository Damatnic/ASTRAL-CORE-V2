import React, { useState, useEffect } from 'react';
import {
  Users, Clock, Star, Shield, Heart, Globe, Award, CheckCircle,
  MessageCircle, Phone, Video, ChevronRight, Filter, Search, Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEmotionTheme } from '../../providers/EmotionThemeProvider';

// FREE Platform - No premium features, all volunteers are equal
interface Volunteer {
  id: string;
  name: string;
  avatar?: string;
  status: 'available' | 'busy' | 'offline';
  responseTime: number; // Average in seconds
  rating: number; // 1-5 stars from feedback
  sessionsCompleted: number;
  specializations: string[];
  languages: string[];
  certifications: string[];
  availability: {
    immediate: boolean;
    nextAvailable?: Date;
  };
  currentLoad: number; // Number of active sessions
  maxLoad: number; // Maximum concurrent sessions
  bio?: string;
}

interface MatchCriteria {
  urgency: 'immediate' | 'high' | 'moderate' | 'low';
  language: string;
  specialization?: string;
  preferredGender?: 'male' | 'female' | 'non-binary' | 'no-preference';
}

interface VolunteerMatchingInterfaceProps {
  criteria?: MatchCriteria;
  onSelectVolunteer?: (volunteer: Volunteer) => void;
  autoMatch?: boolean;
  className?: string;
}

// Sample volunteers (in production, this would come from API)
const SAMPLE_VOLUNTEERS: Volunteer[] = [
  {
    id: 'v1',
    name: 'Sarah Thompson',
    status: 'available',
    responseTime: 15,
    rating: 4.9,
    sessionsCompleted: 342,
    specializations: ['Anxiety', 'Depression', 'Crisis Intervention'],
    languages: ['English', 'Spanish'],
    certifications: ['QPR Certified', 'Mental Health First Aid'],
    availability: { immediate: true },
    currentLoad: 1,
    maxLoad: 3,
    bio: 'Certified crisis counselor with 5 years experience. Here to listen and support you.',
  },
  {
    id: 'v2',
    name: 'Michael Chen',
    status: 'available',
    responseTime: 25,
    rating: 4.8,
    sessionsCompleted: 218,
    specializations: ['Trauma', 'LGBTQ+ Support', 'Grief'],
    languages: ['English', 'Mandarin', 'Cantonese'],
    certifications: ['ASIST Trained', 'Trauma-Informed Care'],
    availability: { immediate: true },
    currentLoad: 2,
    maxLoad: 4,
    bio: 'Trauma-informed volunteer specializing in LGBTQ+ support and cultural sensitivity.',
  },
  {
    id: 'v3',
    name: 'Emily Rodriguez',
    status: 'busy',
    responseTime: 45,
    rating: 4.7,
    sessionsCompleted: 156,
    specializations: ['Youth Support', 'Self-Harm', 'Eating Disorders'],
    languages: ['English', 'Portuguese'],
    certifications: ['Youth Mental Health First Aid'],
    availability: { immediate: false, nextAvailable: new Date(Date.now() + 10 * 60000) },
    currentLoad: 3,
    maxLoad: 3,
    bio: 'Specializing in youth mental health with a focus on eating disorders and self-harm.',
  },
];

export const VolunteerMatchingInterface: React.FC<VolunteerMatchingInterfaceProps> = ({
  criteria,
  onSelectVolunteer,
  autoMatch = false,
  className,
}) => {
  const { emotionalState, urgencyLevel } = useEmotionTheme();
  const [volunteers, setVolunteers] = useState<Volunteer[]>(SAMPLE_VOLUNTEERS);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-match logic for crisis situations
  useEffect(() => {
    if (autoMatch && urgencyLevel === 'immediate') {
      performAutoMatch();
    }
  }, [autoMatch, urgencyLevel]);

  const performAutoMatch = () => {
    setMatchingInProgress(true);
    
    // Find best available volunteer
    const availableVolunteers = volunteers
      .filter(v => v.status === 'available' && v.currentLoad < v.maxLoad)
      .sort((a, b) => {
        // Priority: response time, then rating, then experience
        const scoreA = a.responseTime * 0.5 + (5 - a.rating) * 20 + (1000 - a.sessionsCompleted) * 0.01;
        const scoreB = b.responseTime * 0.5 + (5 - b.rating) * 20 + (1000 - b.sessionsCompleted) * 0.01;
        return scoreA - scoreB;
      });

    setTimeout(() => {
      if (availableVolunteers.length > 0) {
        const matched = availableVolunteers[0];
        setSelectedVolunteer(matched);
        if (onSelectVolunteer) {
          onSelectVolunteer(matched);
        }
      }
      setMatchingInProgress(false);
    }, 2000);
  };

  const handleSelectVolunteer = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    if (onSelectVolunteer) {
      onSelectVolunteer(volunteer);
    }
  };

  // Filter volunteers based on search
  const filteredVolunteers = volunteers.filter(v => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(query) ||
      v.specializations.some(s => s.toLowerCase().includes(query)) ||
      v.languages.some(l => l.toLowerCase().includes(query))
    );
  });

  return (
    <div className={cn('bg-white rounded-xl shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Connect with a Volunteer
            </h2>
            <p className="text-blue-100 mt-1">
              All volunteers provide FREE support - no premium tiers
            </p>
          </div>
          {urgencyLevel === 'immediate' && (
            <div className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center animate-pulse">
              <Zap className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Priority Matching</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {volunteers.filter(v => v.status === 'available').length}
            </div>
            <div className="text-xs text-blue-100">Available Now</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {Math.min(...volunteers.filter(v => v.status === 'available').map(v => v.responseTime))}s
            </div>
            <div className="text-xs text-blue-100">Fastest Response</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-xs text-blue-100">Always Free</div>
          </div>
        </div>
      </div>

      {/* Auto-Matching Progress */}
      {matchingInProgress && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-blue-700 font-medium">
              Finding the best volunteer for you...
            </span>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by specialization, language, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Volunteer List */}
      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {selectedVolunteer && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">
                  Connected with {selectedVolunteer.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="text-green-600 hover:text-green-700 text-sm underline"
              >
                Choose Another
              </button>
            </div>
          </div>
        )}

        {filteredVolunteers.map((volunteer) => (
          <VolunteerCard
            key={volunteer.id}
            volunteer={volunteer}
            onSelect={handleSelectVolunteer}
            isSelected={selectedVolunteer?.id === volunteer.id}
            isPriority={urgencyLevel === 'immediate'}
          />
        ))}

        {filteredVolunteers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No volunteers match your search</p>
            <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Footer - Free Platform Reminder */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-t border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Heart className="w-4 h-4 text-red-500" />
          <span>All volunteers provide support completely FREE</span>
          <Shield className="w-4 h-4 text-blue-500" />
          <span>No premium features • No paid tiers • Free forever</span>
        </div>
      </div>
    </div>
  );
};

// Individual Volunteer Card Component
interface VolunteerCardProps {
  volunteer: Volunteer;
  onSelect: (volunteer: Volunteer) => void;
  isSelected: boolean;
  isPriority: boolean;
}

const VolunteerCard: React.FC<VolunteerCardProps> = ({
  volunteer,
  onSelect,
  isSelected,
  isPriority,
}) => {
  const getStatusColor = (status: Volunteer['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
    }
  };

  const getStatusText = (volunteer: Volunteer) => {
    if (volunteer.status === 'available') {
      return `Available now • ${volunteer.responseTime}s response time`;
    }
    if (volunteer.status === 'busy' && volunteer.availability.nextAvailable) {
      const minutes = Math.round((volunteer.availability.nextAvailable.getTime() - Date.now()) / 60000);
      return `Busy • Available in ${minutes} minutes`;
    }
    return 'Offline';
  };

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all cursor-pointer',
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-md',
        isPriority && volunteer.status === 'available' && 'ring-2 ring-red-500 ring-opacity-50'
      )}
      onClick={() => onSelect(volunteer)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {volunteer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className={cn(
              'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
              getStatusColor(volunteer.status)
            )} />
          </div>

          {/* Volunteer Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{volunteer.name}</h3>
              {volunteer.certifications.length > 0 && (
                <Award className="w-4 h-4 text-blue-500" title="Certified" />
              )}
            </div>

            {/* Status */}
            <p className="text-sm text-gray-600 mt-1">
              {getStatusText(volunteer)}
            </p>

            {/* Rating and Experience */}
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{volunteer.rating}</span>
              </div>
              <span className="text-sm text-gray-500">
                {volunteer.sessionsCompleted} sessions
              </span>
              <span className="text-sm text-gray-500">
                {volunteer.currentLoad}/{volunteer.maxLoad} active
              </span>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1 mt-3">
              {volunteer.specializations.slice(0, 3).map((spec) => (
                <span
                  key={spec}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {spec}
                </span>
              ))}
              {volunteer.specializations.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{volunteer.specializations.length - 3} more
                </span>
              )}
            </div>

            {/* Languages */}
            <div className="flex items-center space-x-2 mt-2">
              <Globe className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {volunteer.languages.join(', ')}
              </span>
            </div>

            {/* Bio */}
            {volunteer.bio && (
              <p className="text-sm text-gray-600 mt-3 italic">
                "{volunteer.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 ml-4">
          <button
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              volunteer.status === 'available'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            )}
            disabled={volunteer.status !== 'available'}
          >
            {volunteer.status === 'available' ? 'Connect' : 'Unavailable'}
          </button>
          {volunteer.status === 'available' && (
            <div className="flex space-x-1">
              <button
                className="flex-1 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Text chat"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                className="flex-1 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Voice call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                className="flex-1 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Video call"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Priority Badge */}
      {isPriority && volunteer.status === 'available' && (
        <div className="mt-3 bg-red-100 border border-red-200 rounded-lg p-2 flex items-center justify-center">
          <Zap className="w-4 h-4 text-red-600 mr-2" />
          <span className="text-sm font-medium text-red-700">
            Recommended for immediate support
          </span>
        </div>
      )}
    </div>
  );
};

export default VolunteerMatchingInterface;