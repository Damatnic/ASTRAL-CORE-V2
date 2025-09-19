'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BarChart3, TrendingUp, Users, Brain, Heart,
  Download, Filter, Calendar, FileText, Search,
  PieChart, LineChart, Database, Eye, Lock
} from 'lucide-react';

interface ResearchMetric {
  name: string;
  value: string | number;
  change: number;
  period: string;
}

interface StudyData {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'draft';
  participants: number;
  completionRate: number;
  lastUpdated: string;
  primaryOutcome: string;
}

export default function ResearcherDashboard() {
  const { data: session } = useSession();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'studies' | 'analytics' | 'exports'>('overview');

  const researchMetrics: ResearchMetric[] = [
    { name: 'Total Participants', value: 2847, change: 15.2, period: '30 days' },
    { name: 'Active Studies', value: 12, change: 0, period: '30 days' },
    { name: 'Data Points Collected', value: '45.2K', change: 23.1, period: '30 days' },
    { name: 'Completion Rate', value: '78.5%', change: 4.2, period: '30 days' },
    { name: 'Mood Assessments', value: '12.8K', change: 18.7, period: '30 days' },
    { name: 'Crisis Interventions', value: 156, change: -8.3, period: '30 days' }
  ];

  const activeStudies: StudyData[] = [
    {
      id: '1',
      title: 'AI Therapy Effectiveness in Crisis Intervention',
      status: 'active',
      participants: 450,
      completionRate: 82.3,
      lastUpdated: '2 hours ago',
      primaryOutcome: 'Reduction in suicidal ideation scores'
    },
    {
      id: '2',
      title: 'Family Support Impact on Recovery Outcomes',
      status: 'active',
      participants: 287,
      completionRate: 76.4,
      lastUpdated: '1 day ago',
      primaryOutcome: 'Improved treatment adherence'
    },
    {
      id: '3',
      title: 'Digital Therapeutic Engagement Patterns',
      status: 'completed',
      participants: 1240,
      completionRate: 91.2,
      lastUpdated: '1 week ago',
      primaryOutcome: 'Usage patterns and effectiveness'
    },
    {
      id: '4',
      title: 'Zero-Knowledge Encryption Impact on Trust',
      status: 'draft',
      participants: 0,
      completionRate: 0,
      lastUpdated: '3 days ago',
      primaryOutcome: 'User trust and disclosure rates'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const demographicData = [
    { label: 'Age 18-25', value: 32, color: 'bg-blue-500' },
    { label: 'Age 26-35', value: 28, color: 'bg-green-500' },
    { label: 'Age 36-45', value: 22, color: 'bg-purple-500' },
    { label: 'Age 46-55', value: 12, color: 'bg-orange-500' },
    { label: 'Age 55+', value: 6, color: 'bg-red-500' }
  ];

  const interventionOutcomes = [
    { type: 'AI Therapy Sessions', total: 3247, successful: 2891, rate: 89.1 },
    { type: 'Crisis Interventions', total: 156, successful: 143, rate: 91.7 },
    { type: 'Safety Plan Completions', total: 892, successful: 734, rate: 82.3 },
    { type: 'Family Engagement', total: 445, successful: 356, rate: 80.0 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
                Research Analytics Center
              </h1>
              <p className="text-gray-600">Mental health research insights and data analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['7d', '30d', '90d', '1y'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedTimeframe(period as any)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      selectedTimeframe === period
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'studies', label: 'Studies', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'exports', label: 'Data Exports', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-700 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Privacy Notice */}
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex items-center">
            <Lock className="w-5 h-5 text-blue-400 mr-3" />
            <div>
              <p className="text-blue-800 font-medium">Privacy-Protected Research Data</p>
              <p className="text-blue-700 text-sm">All data is anonymized and encrypted. IRB approval required for access.</p>
            </div>
          </div>
        </div>

        {/* Research Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {researchMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">{metric.period}</div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.name}</p>
                <p className={`text-xs mt-1 ${
                  metric.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Studies */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Research Studies</h3>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Manage Studies
              </button>
            </div>
            <div className="space-y-4">
              {activeStudies.map((study) => (
                <div key={study.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{study.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(study.status)}`}>
                      {study.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{study.primaryOutcome}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-700">Participants</p>
                      <p className="font-medium">{study.participants}</p>
                    </div>
                    <div>
                      <p className="text-gray-700">Completion Rate</p>
                      <p className="font-medium">{study.completionRate}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 mt-2">Updated: {study.lastUpdated}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Participant Demographics</h3>
            <div className="space-y-4">
              {demographicData.map((demo, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{demo.label}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${demo.color}`}
                        style={{ width: `${demo.value}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-10">{demo.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Intervention Outcomes */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Intervention Outcomes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {interventionOutcomes.map((outcome, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{outcome.type}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total</span>
                    <span className="font-medium">{outcome.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Successful</span>
                    <span className="font-medium text-green-600">{outcome.successful}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-bold text-purple-600">{outcome.rate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Tools */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Database className="w-6 h-6 text-purple-600 mr-3" />
              <span className="font-medium text-purple-700">Data Query</span>
            </button>
            <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
              <span className="font-medium text-blue-700">Analytics</span>
            </button>
            <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Download className="w-6 h-6 text-green-600 mr-3" />
              <span className="font-medium text-green-700">Export</span>
            </button>
            <button className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <FileText className="w-6 h-6 text-orange-600 mr-3" />
              <span className="font-medium text-orange-700">Reports</span>
            </button>
          </div>
        </div>

        {/* Ethics & Compliance */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ethics & Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🔒 Data Protection</h4>
              <p className="text-sm text-blue-700">
                HIPAA compliant with zero-knowledge encryption. All data anonymized before analysis.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ IRB Approval</h4>
              <p className="text-sm text-green-700">
                All studies approved by Institutional Review Board. Consent management automated.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">📊 Open Science</h4>
              <p className="text-sm text-purple-700">
                Commitment to open research practices. Anonymized datasets available for meta-analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}