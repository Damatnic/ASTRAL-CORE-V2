'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge } from './base';
import { ScreenReaderOnly, LiveRegion } from './accessibility';
import { designTokens } from '../design-system';

// Data Visualization Types
interface CrisisAnalytics {
  totalCrises: number;
  activeCrises: number;
  resolvedCrises: number;
  escalatedCrises: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  resolutionRate: number;
  trendData: {
    date: Date;
    crises: number;
    resolved: number;
    responseTime: number;
  }[];
}

interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface VolunteerMetrics {
  totalVolunteers: number;
  activeVolunteers: number;
  averageRating: number;
  totalHours: number;
  performanceData: {
    volunteerId: string;
    name: string;
    casesHandled: number;
    averageRating: number;
    responseTime: number;
    completionRate: number;
  }[];
}

interface OutcomeTracking {
  successfulInterventions: number;
  clientSatisfaction: number;
  followUpRate: number;
  recurringClients: number;
  impactMetrics: {
    livesImpacted: number;
    crisesPrevented: number;
    resourcesConnected: number;
    trainingCompleted: number;
  };
}

// Chart Components
interface ChartProps {
  data: any[];
  width?: number;
  height?: number;
  className?: string;
}

// Simple Line Chart Component
export const LineChart: React.FC<ChartProps & { 
  xKey: string; 
  yKey: string; 
  color?: string;
  showGrid?: boolean;
}> = ({ 
  data, 
  xKey, 
  yKey, 
  color = designTokens.colors.primary.main, 
  width = 400, 
  height = 200,
  showGrid = true,
  className = '' 
}) => {
  const maxValue = Math.max(...data.map(d => d[yKey]));
  const minValue = Math.min(...data.map(d => d[yKey]));
  const range = maxValue - minValue || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d[yKey] - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`relative ${className}`} role="img" aria-label="Line chart showing trend data">
      <svg width={width} height={height} className="w-full h-auto">
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-20">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={0}
                y1={height * ratio}
                x2={width}
                y2={height * ratio}
                stroke="currentColor"
                strokeWidth={1}
              />
            ))}
          </g>
        )}
        
        {/* Data line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((d[yKey] - minValue) / range) * height;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill={color}
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{`${d[xKey]}: ${d[yKey]}`}</title>
            </circle>
          );
        })}
      </svg>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-12">
        <span>{maxValue}</span>
        <span>{Math.round((maxValue + minValue) / 2)}</span>
        <span>{minValue}</span>
      </div>
    </div>
  );
};

// Simple Bar Chart Component
export const BarChart: React.FC<ChartProps & { 
  xKey: string; 
  yKey: string; 
  colorKey?: string;
}> = ({ 
  data, 
  xKey, 
  yKey, 
  colorKey,
  width = 400, 
  height = 200,
  className = '' 
}) => {
  const maxValue = Math.max(...data.map(d => d[yKey]));
  const barWidth = width / data.length * 0.8;
  const barSpacing = width / data.length * 0.2;

  return (
    <div className={`relative ${className}`} role="img" aria-label="Bar chart showing category data">
      <svg width={width} height={height} className="w-full h-auto">
        {data.map((d, i) => {
          const barHeight = (d[yKey] / maxValue) * height;
          const x = i * (barWidth + barSpacing) + barSpacing / 2;
          const y = height - barHeight;
          const color = colorKey && d[colorKey] ? d[colorKey] : designTokens.colors.primary.main;
          
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{`${d[xKey]}: ${d[yKey]}`}</title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={height + 15}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {d[xKey]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Donut Chart Component
export const DonutChart: React.FC<ChartProps & { 
  labelKey: string; 
  valueKey: string; 
  colorKey?: string;
}> = ({ 
  data, 
  labelKey, 
  valueKey, 
  colorKey,
  width = 200, 
  height = 200,
  className = '' 
}) => {
  const total = data.reduce((sum, d) => sum + d[valueKey], 0);
  const radius = Math.min(width, height) / 2 - 20;
  const innerRadius = radius * 0.6;
  const centerX = width / 2;
  const centerY = height / 2;

  let currentAngle = -Math.PI / 2; // Start at top

  const segments = data.map((d, i) => {
    const percentage = d[valueKey] / total;
    const angle = percentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = centerX + Math.cos(startAngle) * radius;
    const y1 = centerY + Math.sin(startAngle) * radius;
    const x2 = centerX + Math.cos(endAngle) * radius;
    const y2 = centerY + Math.sin(endAngle) * radius;
    
    const x3 = centerX + Math.cos(endAngle) * innerRadius;
    const y3 = centerY + Math.sin(endAngle) * innerRadius;
    const x4 = centerX + Math.cos(startAngle) * innerRadius;
    const y4 = centerY + Math.sin(startAngle) * innerRadius;
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
    
    currentAngle = endAngle;
    
    const color = colorKey && d[colorKey] ? d[colorKey] : 
      designTokens.colors.chart[i % designTokens.colors.chart.length];
    
    return {
      pathData,
      color,
      label: d[labelKey],
      value: d[valueKey],
      percentage: Math.round(percentage * 100)
    };
  });

  return (
    <div className={`relative ${className}`} role="img" aria-label="Donut chart showing distribution">
      <svg width={width} height={height} className="w-full h-auto">
        {segments.map((segment, i) => (
          <path
            key={i}
            d={segment.pathData}
            fill={segment.color}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <title>{`${segment.label}: ${segment.value} (${segment.percentage}%)`}</title>
          </path>
        ))}
        
        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="text-lg font-bold fill-gray-800"
        >
          {total}
        </text>
        <text
          x={centerX}
          y={centerY + 12}
          textAnchor="middle"
          className="text-sm fill-gray-600"
        >
          Total
        </text>
      </svg>
      
      {/* Legend */}
      <div className="mt-4 space-y-1">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: segment.color }}
            ></div>
            <span className="text-gray-700">
              {segment.label}: {segment.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Crisis Trends Chart Component
interface CrisisTrendsChartProps {
  data: CrisisAnalytics['trendData'];
  className?: string;
}

export const CrisisTrendsChart: React.FC<CrisisTrendsChartProps> = ({
  data,
  className = ''
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'crises' | 'resolved' | 'responseTime'>('crises');
  
  const chartData = data.map(d => ({
    date: d.date.toLocaleDateString(),
    value: d[selectedMetric]
  }));

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'crises': return designTokens.colors.crisis.high;
      case 'resolved': return designTokens.colors.status.success;
      case 'responseTime': return designTokens.colors.status.info;
      default: return designTokens.colors.primary.main;
    }
  };

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Crisis Trends</h3>
          <div className="flex space-x-2">
            {(['crises', 'resolved', 'responseTime'] as const).map((metric) => (
              <Button
                key={metric}
                variant={selectedMetric === metric ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric(metric)}
                className="capitalize"
              >
                {metric === 'responseTime' ? 'Response Time' : metric}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <LineChart
          data={chartData}
          xKey="date"
          yKey="value"
          color={getMetricColor(selectedMetric)}
          height={250}
        />
      </div>
    </Card>
  );
};

// Category Breakdown Component
interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
  className?: string;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  data,
  className = ''
}) => {
  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Crisis Categories</h3>
        <p className="text-sm text-gray-600 mt-1">
          Distribution of crisis types and trends
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div>
            <DonutChart
              data={data}
              labelKey="category"
              valueKey="count"
              colorKey="color"
            />
          </div>
          
          {/* Category List */}
          <div className="space-y-3">
            {data.map((category, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <div>
                    <div className="font-medium text-gray-900">{category.category}</div>
                    <div className="text-sm text-gray-600">{category.count} cases</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {category.percentage}%
                  </span>
                  <div className={`flex items-center ${
                    category.trend === 'up' ? 'text-red-600' : 
                    category.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {category.trend === 'up' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                    )}
                    {category.trend === 'down' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                      </svg>
                    )}
                    {category.trend === 'stable' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Volunteer Performance Chart Component
interface VolunteerPerformanceChartProps {
  data: VolunteerMetrics['performanceData'];
  className?: string;
}

export const VolunteerPerformanceChart: React.FC<VolunteerPerformanceChartProps> = ({
  data,
  className = ''
}) => {
  const [sortBy, setSortBy] = useState<'casesHandled' | 'averageRating' | 'completionRate'>('casesHandled');
  
  const sortedData = [...data].sort((a, b) => b[sortBy] - a[sortBy]);
  const topPerformers = sortedData.slice(0, 10);

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Volunteer Performance</h3>
            <p className="text-sm text-gray-600 mt-1">
              Top performing volunteers by various metrics
            </p>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="casesHandled">Cases Handled</option>
            <option value="averageRating">Average Rating</option>
            <option value="completionRate">Completion Rate</option>
          </select>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          {topPerformers.map((volunteer, i) => (
            <div key={volunteer.volunteerId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-medium text-sm">
                  {i + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{volunteer.name}</div>
                  <div className="text-sm text-gray-600">
                    {volunteer.casesHandled} cases • {volunteer.responseTime}min avg response
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-900">{volunteer.averageRating.toFixed(1)}</div>
                  <div className="text-gray-600">Rating</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{volunteer.completionRate}%</div>
                  <div className="text-gray-600">Completion</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Key Metrics Overview Component
interface KeyMetricsOverviewProps {
  crisisAnalytics: CrisisAnalytics;
  volunteerMetrics: VolunteerMetrics;
  outcomeTracking: OutcomeTracking;
  className?: string;
}

export const KeyMetricsOverview: React.FC<KeyMetricsOverviewProps> = ({
  crisisAnalytics,
  volunteerMetrics,
  outcomeTracking,
  className = ''
}) => {
  const metrics = [
    {
      title: 'Total Crises',
      value: crisisAnalytics.totalCrises,
      change: '+12%',
      trend: 'up' as const,
      icon: '🚨',
      color: 'text-red-600'
    },
    {
      title: 'Resolution Rate',
      value: `${crisisAnalytics.resolutionRate}%`,
      change: '+3%',
      trend: 'up' as const,
      icon: '✅',
      color: 'text-green-600'
    },
    {
      title: 'Avg Response Time',
      value: `${crisisAnalytics.averageResponseTime}min`,
      change: '-15%',
      trend: 'down' as const,
      icon: '⏱️',
      color: 'text-blue-600'
    },
    {
      title: 'Active Volunteers',
      value: volunteerMetrics.activeVolunteers,
      change: '+8%',
      trend: 'up' as const,
      icon: '👥',
      color: 'text-purple-600'
    },
    {
      title: 'Client Satisfaction',
      value: `${outcomeTracking.clientSatisfaction}%`,
      change: '+2%',
      trend: 'up' as const,
      icon: '⭐',
      color: 'text-yellow-600'
    },
    {
      title: 'Lives Impacted',
      value: outcomeTracking.impactMetrics.livesImpacted,
      change: '+25%',
      trend: 'up' as const,
      icon: '❤️',
      color: 'text-pink-600'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 ${className}`}>
      {metrics.map((metric, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl">{metric.icon}</div>
            <div className={`flex items-center text-sm ${
              metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{metric.change}</span>
              {metric.trend === 'up' ? (
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                </svg>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {metric.title}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Main Data Visualization Dashboard Component
interface DataVisualizationDashboardProps {
  className?: string;
}

export const DataVisualizationDashboard: React.FC<DataVisualizationDashboardProps> = ({
  className = ''
}) => {
  // Mock data - would come from API
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  const crisisAnalytics: CrisisAnalytics = {
    totalCrises: 1247,
    activeCrises: 23,
    resolvedCrises: 1186,
    escalatedCrises: 38,
    averageResponseTime: 3.2,
    averageResolutionTime: 45.6,
    resolutionRate: 95,
    trendData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      crises: Math.floor(Math.random() * 20) + 30,
      resolved: Math.floor(Math.random() * 18) + 28,
      responseTime: Math.random() * 2 + 2
    }))
  };

  const categoryBreakdown: CategoryBreakdown[] = [
    { category: 'Mental Health', count: 487, percentage: 39, trend: 'up', color: designTokens.colors.chart[0] },
    { category: 'Domestic Violence', count: 312, percentage: 25, trend: 'stable', color: designTokens.colors.chart[1] },
    { category: 'Substance Abuse', count: 218, percentage: 17, trend: 'down', color: designTokens.colors.chart[2] },
    { category: 'Crisis Counseling', count: 156, percentage: 13, trend: 'up', color: designTokens.colors.chart[3] },
    { category: 'Emergency Response', count: 74, percentage: 6, trend: 'stable', color: designTokens.colors.chart[4] }
  ];

  const volunteerMetrics: VolunteerMetrics = {
    totalVolunteers: 89,
    activeVolunteers: 67,
    averageRating: 4.7,
    totalHours: 2840,
    performanceData: Array.from({ length: 20 }, (_, i) => ({
      volunteerId: `vol-${i}`,
      name: `Volunteer ${i + 1}`,
      casesHandled: Math.floor(Math.random() * 50) + 10,
      averageRating: Math.random() * 1.5 + 3.5,
      responseTime: Math.random() * 3 + 1,
      completionRate: Math.floor(Math.random() * 20) + 80
    }))
  };

  const outcomeTracking: OutcomeTracking = {
    successfulInterventions: 1142,
    clientSatisfaction: 94,
    followUpRate: 87,
    recurringClients: 23,
    impactMetrics: {
      livesImpacted: 1247,
      crisesPrevented: 892,
      resourcesConnected: 2156,
      trainingCompleted: 145
    }
  };

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="Crisis Analytics Dashboard">
      <ScreenReaderOnly>
        <h1>Crisis Intervention Analytics Dashboard</h1>
      </ScreenReaderOnly>
      
      <LiveRegion>
        Dashboard updated with latest crisis intervention data
      </LiveRegion>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Crisis intervention insights and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <KeyMetricsOverview
        crisisAnalytics={crisisAnalytics}
        volunteerMetrics={volunteerMetrics}
        outcomeTracking={outcomeTracking}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Crisis Trends */}
        <CrisisTrendsChart data={crisisAnalytics.trendData} />
        
        {/* Category Breakdown */}
        <CategoryBreakdownChart data={categoryBreakdown} />
      </div>

      {/* Volunteer Performance */}
      <VolunteerPerformanceChart data={volunteerMetrics.performanceData} />

      {/* Impact Metrics */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Impact Metrics</h3>
          <p className="text-sm text-gray-600 mt-1">
            Measuring the real-world impact of our crisis intervention efforts
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {outcomeTracking.impactMetrics.livesImpacted}
              </div>
              <div className="text-sm font-medium text-blue-800">Lives Impacted</div>
              <div className="text-xs text-blue-600 mt-1">
                People who received direct crisis support
              </div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {outcomeTracking.impactMetrics.crisesPrevented}
              </div>
              <div className="text-sm font-medium text-green-800">Crises Prevented</div>
              <div className="text-xs text-green-600 mt-1">
                Potential crises averted through intervention
              </div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {outcomeTracking.impactMetrics.resourcesConnected}
              </div>
              <div className="text-sm font-medium text-purple-800">Resources Connected</div>
              <div className="text-xs text-purple-600 mt-1">
                Referrals made to support services
              </div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {outcomeTracking.impactMetrics.trainingCompleted}
              </div>
              <div className="text-sm font-medium text-orange-800">Training Completed</div>
              <div className="text-xs text-orange-600 mt-1">
                Volunteer training sessions finished
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataVisualizationDashboard;