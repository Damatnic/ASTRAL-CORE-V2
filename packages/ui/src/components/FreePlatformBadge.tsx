import React from 'react';
import { Heart, Shield, Infinity } from 'lucide-react';
import { cn } from '../lib/utils';

interface FreePlatformBadgeProps {
  variant?: 'inline' | 'hero' | 'footer';
  className?: string;
}

/**
 * FreePlatformBadge - Prominently displays that all features are free forever
 * This component should be displayed throughout the platform to reassure users
 * that they will never be charged for any services.
 */
export const FreePlatformBadge: React.FC<FreePlatformBadgeProps> = ({
  variant = 'inline',
  className,
}) => {
  if (variant === 'hero') {
    return (
      <div className={cn(
        'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center',
        className
      )}>
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Heart className="w-16 h-16 text-green-600" />
            <Infinity className="w-8 h-8 text-white absolute top-4 left-4" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Forever Free Crisis Support
        </h2>
        <p className="text-lg text-gray-700 mb-4">
          Every feature, every service, every moment of support - <strong>100% free forever</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4">
            <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">No Hidden Costs</h3>
            <p className="text-sm text-gray-600 mt-1">
              Never any premium features or paid tiers
            </p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">No Ads Ever</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your crisis is not a marketing opportunity
            </p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <Infinity className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">No Data Selling</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your privacy is sacred and protected
            </p>
          </div>
        </div>
        <div className="mt-6 text-sm text-gray-600">
          <p>
            ASTRAL CORE is a <strong>public service</strong> funded by donations and grants.
            <br />
            Your life and wellbeing should never have a price tag.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={cn(
        'bg-green-900 text-white py-6 px-8 text-center',
        className
      )}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Heart className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold">This Platform is 100% Free Forever</h3>
            <Heart className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-green-100 mb-4">
            No premium features • No subscriptions • No advertisements • No data selling
          </p>
          <div className="text-sm text-green-200">
            <p>
              Crisis support is a human right. Every person deserves access to mental health resources
              without financial barriers. ASTRAL CORE will always be free for everyone, everywhere.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={cn(
      'inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full',
      className
    )}>
      <Infinity className="w-4 h-4" />
      <span className="text-sm font-semibold">100% Free Forever</span>
      <Shield className="w-4 h-4" />
    </div>
  );
};

// Free Platform Commitment Statement Component
export const FreePlatformCommitment: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn(
      'bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8',
      className
    )}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Our Commitment to Free Access
      </h2>
      
      <div className="space-y-4 text-gray-700">
        <div className="flex items-start space-x-3">
          <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900">Life Before Profit</h3>
            <p className="text-sm mt-1">
              We believe mental health crisis support should never be gatekept by payment. 
              Lives are more important than revenue.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900">Privacy Without Price</h3>
            <p className="text-sm mt-1">
              Your data will never be sold, shared, or monetized. Your crisis is not a commodity.
              Complete privacy is guaranteed at no cost.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Infinity className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900">Perpetual Free Access</h3>
            <p className="text-sm mt-1">
              This isn't a limited-time offer or a freemium model. Every feature, every tool,
              every moment of support will always be completely free.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white/50 rounded-xl border border-green-200">
        <p className="text-sm text-gray-600 text-center">
          <strong>Legal Commitment:</strong> ASTRAL CORE operates as a non-profit service.
          We are legally bound to provide free crisis support without any form of monetization.
        </p>
      </div>
    </div>
  );
};

export default FreePlatformBadge;