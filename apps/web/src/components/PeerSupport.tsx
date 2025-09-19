'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageSquare, Users, TrendingUp, Shield, 
  ThumbsUp, Share2, Eye, EyeOff, Award, Filter,
  Send, Clock, Star, AlertCircle
} from 'lucide-react';

interface Post {
  id: string;
  content: string;
  category: string;
  timestamp: Date;
  supportCount: number;
  responseCount: number;
  isAnonymous: boolean;
  userId?: string;
  userName?: string;
  mood: 'struggling' | 'coping' | 'hopeful' | 'grateful';
  tags: string[];
  responses: Response[];
}

interface Response {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: Date;
  helpfulCount: number;
  isHelper: boolean;
  xpEarned?: number;
}

interface Helper {
  id: string;
  name: string;
  xp: number;
  level: number;
  specialties: string[];
  rating: number;
  peopleHelped: number;
  isAvailable: boolean;
}

export default function PeerSupport() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [topHelpers, setTopHelpers] = useState<Helper[]>([]);

  const categories = [
    { id: 'all', name: 'All Topics', icon: '🌍' },
    { id: 'anxiety', name: 'Anxiety', icon: '😰' },
    { id: 'depression', name: 'Depression', icon: '😔' },
    { id: 'relationships', name: 'Relationships', icon: '💔' },
    { id: 'stress', name: 'Stress', icon: '😫' },
    { id: 'success', name: 'Success Stories', icon: '🎉' },
    { id: 'coping', name: 'Coping Strategies', icon: '🛡️' },
  ];

  useEffect(() => {
    // Simulate loading posts
    const mockPosts: Post[] = [
      {
        id: '1',
        content: 'Feeling overwhelmed with work stress. My anxiety has been through the roof lately. Has anyone found effective ways to manage workplace anxiety?',
        category: 'anxiety',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        supportCount: 24,
        responseCount: 8,
        isAnonymous: true,
        mood: 'struggling',
        tags: ['work', 'anxiety', 'stress'],
        responses: [
          {
            id: 'r1',
            content: 'I\'ve been there. What helped me was setting clear boundaries and taking short mindfulness breaks throughout the day. You\'re not alone in this.',
            userId: 'helper1',
            userName: 'CalmHelper',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            helpfulCount: 12,
            isHelper: true,
            xpEarned: 50,
          },
        ],
      },
      {
        id: '2',
        content: 'Day 30 without self-harm! It\'s been incredibly difficult but I\'m proud of myself. To anyone struggling, please know it gets easier.',
        category: 'success',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        supportCount: 156,
        responseCount: 23,
        isAnonymous: false,
        userName: 'HopefulSoul',
        mood: 'grateful',
        tags: ['recovery', 'milestone', 'hope'],
        responses: [],
      },
      {
        id: '3',
        content: 'My partner doesn\'t understand my depression. They think I should just "snap out of it". How do I explain what I\'m going through?',
        category: 'relationships',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        supportCount: 45,
        responseCount: 15,
        isAnonymous: true,
        mood: 'coping',
        tags: ['relationships', 'depression', 'communication'],
        responses: [],
      },
    ];

    setPosts(mockPosts);

    // Simulate top helpers
    const mockHelpers: Helper[] = [
      {
        id: 'h1',
        name: 'CompassionateSoul',
        xp: 2840,
        level: 12,
        specialties: ['Anxiety', 'Depression', 'Trauma'],
        rating: 4.9,
        peopleHelped: 342,
        isAvailable: true,
      },
      {
        id: 'h2',
        name: 'ListeningEar',
        xp: 2120,
        level: 10,
        specialties: ['Relationships', 'Stress', 'Self-care'],
        rating: 4.8,
        peopleHelped: 256,
        isAvailable: true,
      },
      {
        id: 'h3',
        name: 'WiseGuide',
        xp: 1890,
        level: 9,
        specialties: ['Coping', 'Mindfulness', 'Recovery'],
        rating: 4.9,
        peopleHelped: 198,
        isAvailable: false,
      },
    ];

    setTopHelpers(mockHelpers);
  }, []);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      content: newPost,
      category: 'general',
      timestamp: new Date(),
      supportCount: 0,
      responseCount: 0,
      isAnonymous: isAnonymous,
      userName: isAnonymous ? undefined : 'CurrentUser',
      mood: 'coping',
      tags: [],
      responses: [],
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  const getMoodColor = (mood: string) => {
    switch(mood) {
      case 'struggling': return 'text-red-600 bg-red-50';
      case 'coping': return 'text-yellow-600 bg-yellow-50';
      case 'hopeful': return 'text-blue-600 bg-blue-50';
      case 'grateful': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Peer Support Community</h1>
              <p className="text-gray-600">Share, support, and heal together in a safe space</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  isAnonymous 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{isAnonymous ? 'Anonymous' : 'Public'}</span>
              </button>
              
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                <Users className="w-4 h-4 inline mr-2" />
                Find Helper
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Post Creation */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Share What\'s On Your Mind</h3>
              <form onSubmit={handlePostSubmit}>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Your story matters. Share it here... (You can remain anonymous)"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={4}
                />
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Your privacy is protected</span>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Share
                  </button>
                </div>
              </form>
            </div>

            {/* Category Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center space-x-2 overflow-x-auto">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                        {post.isAnonymous ? '?' : (post.userName?.[0] || 'U')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {post.isAnonymous ? 'Anonymous' : post.userName}
                        </p>
                        <p className="text-xs text-gray-700 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(post.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMoodColor(post.mood)}`}>
                      {post.mood}
                    </span>
                  </div>
                  
                  <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.supportCount}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.responseCount}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors">
                      Offer Support
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Helpers */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Top Helpers This Week
              </h3>
              
              <div className="space-y-3">
                {topHelpers.map((helper, index) => (
                  <div key={helper.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{helper.name}</p>
                        <p className="text-xs text-gray-700">Level {helper.level} • {helper.xp} XP</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">{helper.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                Become a Helper
              </button>
            </div>

            {/* Community Stats */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Community Impact</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-100">People Supported</span>
                  <span className="font-bold">12,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-100">Active Helpers</span>
                  <span className="font-bold">342</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-100">Stories Shared</span>
                  <span className="font-bold">8,923</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-100">Lives Changed</span>
                  <span className="font-bold">∞</span>
                </div>
              </div>
            </div>

            {/* Crisis Resources */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Need Immediate Help?
              </h3>
              
              <p className="text-red-700 text-sm mb-4">
                If you\'re in crisis, professional help is available 24/7
              </p>
              
              <div className="space-y-2">
                <button 
                  onClick={() => window.location.href = 'tel:988'}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Call 988 Crisis Line
                </button>
                
                <button className="w-full px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg font-medium hover:bg-red-50 transition-colors">
                  Start Crisis Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}