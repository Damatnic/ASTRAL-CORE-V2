/**
 * ASTRAL Core V2 - 404 Not Found Page
 * 
 * Crisis-safe 404 page that maintains access to emergency resources
 * and provides helpful navigation for users who may be in distress.
 * 
 * @author Claude Code - Mental Health Crisis Intervention Platform
 * @version 2.0.0
 */

import React from 'react';
import { Search, Phone, Heart, Home, MessageCircle, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Custom 404 Page Component
 * 
 * Provides a helpful and calming 404 experience while ensuring
 * users can always access crisis intervention features.
 */
export default function NotFoundPage() {
  const emergencyContacts = [
    {
      name: '988 Crisis Lifeline',
      description: '24/7 Crisis Support',
      phone: '988',
      href: 'tel:988',
    },
    {
      name: '911 Emergency',
      description: 'Life-Threatening Emergency',
      phone: '911',
      href: 'tel:911',
    },
    {
      name: 'Crisis Text Line',
      description: 'Text HOME to 741741',
      phone: '741741',
      href: 'sms:741741',
    },
  ];

  const helpfulLinks = [
    {
      name: 'Crisis Chat',
      description: 'Talk to someone right now',
      href: '/crisis',
      icon: MessageCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      urgent: true,
    },
    {
      name: 'Safety Planning',
      description: 'Create or review your safety plan',
      href: '/safety',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      urgent: false,
    },
    {
      name: 'Mood Tracking',
      description: 'Check in with your emotions',
      href: '/mood',
      icon: Heart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      urgent: false,
    },
    {
      name: 'Home',
      description: 'Return to the main page',
      href: '/',
      icon: Home,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      urgent: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-2 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium">
            🚨 Need immediate help? Emergency resources are available below
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Emergency Contacts - Always Prominent */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-4 border-red-500">
          <div className="flex items-center mb-4">
            <Phone className="w-6 h-6 text-red-600 mr-3" />
            <h2 className="text-xl font-bold text-red-900">Emergency Help</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyContacts.map((contact) => (
              <a
                key={contact.phone}
                href={contact.href}
                className="flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              >
                <div>
                  <div className="font-semibold text-red-900">{contact.name}</div>
                  <div className="text-sm text-red-700">{contact.description}</div>
                </div>
                <Phone className="w-5 h-5 text-red-600" />
              </a>
            ))}
          </div>
        </div>

        {/* Main 404 Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            We couldn't find the page you're looking for. It might have been moved, deleted, 
            or you may have mistyped the address. But don't worry - all our support features 
            are still available to help you.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Looking for help?</strong> All of our crisis support features are working 
              and accessible through the links below.
            </p>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Where would you like to go?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helpfulLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`group flex items-center p-4 ${link.bgColor} rounded-lg hover:shadow-md transition-all ${link.borderColor} border ${
                  link.urgent ? 'ring-2 ring-red-200 ring-opacity-50' : ''
                }`}
              >
                <div className={`p-2 bg-white rounded-lg mr-4 ${link.borderColor} border`}>
                  <link.icon className={`w-6 h-6 ${link.color}`} />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${link.color} flex items-center`}>
                    {link.name}
                    {link.urgent && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                        Priority
                      </span>
                    )}
                  </div>
                  <div className={`text-sm ${link.color} opacity-80`}>{link.description}</div>
                </div>
                <ArrowRight className={`w-5 h-5 ${link.color} group-hover:translate-x-1 transition-transform`} />
              </Link>
            ))}
          </div>
        </div>

        {/* Search Suggestions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Were you looking for:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Support Features:</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/crisis" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Crisis chat and immediate support
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Safety planning tools
                  </Link>
                </li>
                <li>
                  <Link href="/mood" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Mood tracking and insights
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Volunteer support network
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Account & Settings:</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Sign in to your account
                  </Link>
                </li>
                <li>
                  <Link href="/wellness" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Wellness dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/gamification-demo" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Wellness challenges
                  </Link>
                </li>
                <li>
                  <Link href="/therapist" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Therapist portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Support Information */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-6">
          <h3 className="text-lg font-bold text-purple-900 mb-4">Need Additional Support?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">If you're in crisis:</h4>
              <ul className="text-purple-700 space-y-1 text-sm">
                <li>• Call 988 for immediate crisis support</li>
                <li>• Call 911 for life-threatening emergencies</li>
                <li>• Text HOME to 741741 for text support</li>
                <li>• Go to your nearest emergency room</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">For general support:</h4>
              <ul className="text-purple-700 space-y-1 text-sm">
                <li>• Use our crisis chat feature</li>
                <li>• Contact your mental health provider</li>
                <li>• Reach out to trusted friends or family</li>
                <li>• Visit local mental health resources</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer with URL Info */}
        <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            The page you requested could not be found. If you believe this is an error, 
            please try refreshing the page or contact support.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            All emergency and crisis support features remain fully functional.
          </p>
        </div>
      </div>
    </div>
  );
}