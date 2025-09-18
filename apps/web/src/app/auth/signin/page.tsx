'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, getSession, getProviders } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Eye, EyeOff, Mail, Lock, Chrome, Github, 
  Heart, Shield, AlertCircle, UserCheck
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [authType, setAuthType] = useState<'anonymous' | 'volunteer' | 'therapist' | 'email'>('anonymous');
  const [credentials, setCredentials] = useState({ id: '', passcode: '' });
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const authError = searchParams.get('error');

  useEffect(() => {
    getProviders().then((providers) => {
      if (providers) {
        setProviders(providers as Record<string, Provider>);
      }
    });
  }, []);

  useEffect(() => {
    if (authError) {
      switch (authError) {
        case 'CredentialsSignin':
          setError('Invalid email or password. Please try again.');
          break;
        case 'EmailVerification':
          setError('Please verify your email before signing in.');
          break;
        default:
          setError('An error occurred during sign in. Please try again.');
      }
    }
  }, [authError]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let result;
      
      if (authType === 'anonymous') {
        result = await signIn('anonymous', {
          redirect: false,
          type: 'anonymous'
        });
      } else if (authType === 'volunteer') {
        result = await signIn('volunteer', {
          redirect: false,
          id: credentials.id,
          passcode: credentials.passcode
        });
      } else if (authType === 'therapist') {
        result = await signIn('therapist', {
          redirect: false,
          licenseId: credentials.id,
          passcode: credentials.passcode
        });
      } else if (authType === 'email') {
        result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          callbackUrl,
          redirect: false
        });
      }

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else if (result?.ok) {
        // Redirect based on user type or callback
        if (authType === 'therapist') {
          router.push('/therapist');
        } else if (authType === 'volunteer') {
          router.push('/volunteer');
        } else if (authType === 'email') {
          router.push(callbackUrl);
        } else {
          router.push('/crisis');
        }
        router.refresh();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (providerId: string) => {
    setIsLoading(true);
    try {
      await signIn(providerId, { callbackUrl });
    } catch (err) {
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAnonymousAccess = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('anonymous', {
        type: 'crisis',
        callbackUrl: '/crisis',
        redirect: false
      });

      if (result?.ok) {
        router.push('/crisis');
      }
    } catch (err) {
      setError('Failed to access crisis support. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Emergency Access Banner */}
      <div className="bg-red-600 text-white py-2 px-4 text-center sticky top-0 z-50">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            Crisis Support Available 24/7
          </span>
          <button
            onClick={handleAnonymousAccess}
            className="bg-white text-red-600 px-3 py-1 rounded-full hover:bg-red-50 transition-colors font-medium"
          >
            Emergency Access
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">
                Sign in to your ASTRAL Core account
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* OAuth Providers */}
            {(providers?.google || providers?.github) && (
              <>
                <div className="space-y-3 mb-6">
                  {providers?.google && (
                    <button
                      onClick={() => handleOAuthSignIn('google')}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Chrome className="w-5 h-5 mr-3" />
                      Continue with Google
                    </button>
                  )}

                  {providers?.github && (
                    <button
                      onClick={() => handleOAuthSignIn('github')}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Github className="w-5 h-5 mr-3" />
                      Continue with GitHub
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or choose access type</span>
                  </div>
                </div>
              </>
            )}

            {/* Access Type Selection */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              <button
                onClick={() => setAuthType('email')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  authType === 'email'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email & Password
                  </div>
                  <div className="text-sm text-gray-600">For volunteers and therapists</div>
                </div>
              </button>

              <button
                onClick={() => setAuthType('volunteer')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  authType === 'volunteer'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold flex items-center">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Volunteer Access
                  </div>
                  <div className="text-sm text-gray-600">Quick ID-based access</div>
                </div>
              </button>

              <button
                onClick={() => setAuthType('therapist')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  authType === 'therapist'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Therapist Portal
                  </div>
                  <div className="text-sm text-gray-600">Licensed professionals</div>
                </div>
              </button>

              <button
                onClick={() => setAuthType('anonymous')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  authType === 'anonymous'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Crisis Support
                  </div>
                  <div className="text-sm text-gray-600">Anonymous emergency access</div>
                </div>
              </button>
            </div>

            {/* Email/Password Form */}
            {authType === 'email' && (
              <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Credentials Form for Legacy Access */}
            {(authType === 'volunteer' || authType === 'therapist') && (
              <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {authType === 'therapist' ? 'License ID' : 'Volunteer ID'}
                  </label>
                  <input
                    type="text"
                    value={credentials.id}
                    onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={authType === 'therapist' ? 'Enter your license ID' : 'Enter your volunteer ID'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passcode
                  </label>
                  <input
                    type="password"
                    value={credentials.passcode}
                    onChange={(e) => setCredentials({ ...credentials, passcode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your passcode"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  Demo credentials: Use "{authType}123" as the passcode
                </div>
              </div>
            )}

            {/* Demo Login Section */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-center mb-3">
                <h3 className="font-semibold text-amber-800">🎯 Demo Access</h3>
                <p className="text-sm text-amber-700">Try the platform with pre-configured demo accounts</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <button
                  onClick={() => {
                    setAuthType('volunteer');
                    setCredentials({ id: 'demo-volunteer', passcode: 'volunteer123' });
                  }}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  Demo Volunteer
                </button>
                <button
                  onClick={() => {
                    setAuthType('therapist');
                    setCredentials({ id: 'demo-therapist', passcode: 'therapist123' });
                  }}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  Demo Therapist
                </button>
                <button
                  onClick={() => {
                    setAuthType('email');
                    setFormData({ email: 'admin@astralcore.org', password: 'demo123' });
                  }}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  Demo Admin
                </button>
              </div>
              <div className="text-center">
                <button
                  onClick={() => router.push('/demo')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-medium text-sm shadow-lg"
                >
                  🌟 Full Demo Experience - All User Types
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading || 
                (authType === 'email' && (!formData.email || !formData.password)) ||
                ((authType === 'volunteer' || authType === 'therapist') && (!credentials.id || !credentials.passcode))
              }
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                authType === 'anonymous'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : authType === 'volunteer'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : authType === 'therapist'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Signing in...' : 
               authType === 'anonymous' ? 'Get Crisis Support' :
               authType === 'volunteer' ? 'Access Volunteer Portal' :
               authType === 'therapist' ? 'Access Therapist Portal' :
               'Sign In'}
            </button>

            {/* Footer Links */}
            {authType === 'email' && (
              <div className="mt-6 text-center space-y-2">
                <a
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot your password?
                </a>
                
                <div className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a
                    href="/auth/signup"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sign up
                  </a>
                </div>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <div className="font-medium mb-1">Your privacy is protected</div>
                  <div>All data is encrypted and HIPAA compliant.</div>
                </div>
              </div>
            </div>

            {/* Crisis Notice */}
            {authType === 'anonymous' && (
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Anonymous access ensures your privacy</p>
                <p className="font-semibold text-red-600 mt-2">
                  Emergency? Call 988 immediately
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}