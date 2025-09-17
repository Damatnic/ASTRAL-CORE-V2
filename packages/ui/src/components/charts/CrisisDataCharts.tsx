import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown,
  Activity, Users, Clock, AlertTriangle, Heart, Shield,
  Calendar, MapPin, Star, Zap, Target, Award
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Data visualization for crisis intervention analytics - 100% FREE
interface CrisisMetric {
  id: string;
  label: string;
  value: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  color: string;
  target?: number;
}

interface TimeSeriesData {
  timestamp: Date;
  activeSessions: number;
  waitingClients: number;
  escalations: number;
  resolutions: number;
  responseTime: number;
}

interface RegionalData {
  region: string;
  sessions: number;
  volunteers: number;
  responseTime: number;
  successRate: number;
}

interface CrisisDataChartsProps {
  timeRange: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: string) => void;
  className?: string;
}

export const CrisisDataCharts: React.FC<CrisisDataChartsProps> = ({
  timeRange = '24h',
  onTimeRangeChange,
  className,
}) => {
  const [metrics, setMetrics] = useState<CrisisMetric[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);

  // Generate sample data
  useEffect(() => {
    const sampleMetrics: CrisisMetric[] = [
      {
        id: 'active-sessions',
        label: 'Active Sessions',
        value: 47,
        change: +12.5,
        trend: 'up',
        color: 'blue',
        target: 50,
      },
      {
        id: 'response-time',
        label: 'Avg Response Time',
        value: 18,
        change: -8.2,
        trend: 'down',
        color: 'green',
        target: 15,
      },
      {
        id: 'success-rate',
        label: 'Resolution Rate',
        value: 94.2,
        change: +2.1,
        trend: 'up',
        color: 'emerald',
        target: 95,
      },
      {
        id: 'escalations',
        label: 'Crisis Escalations',
        value: 8,
        change: -15.3,
        trend: 'down',
        color: 'red',
        target: 5,
      },
    ];

    const sampleTimeSeries: TimeSeriesData[] = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000),
      activeSessions: Math.floor(Math.random() * 30) + 20,
      waitingClients: Math.floor(Math.random() * 10),
      escalations: Math.floor(Math.random() * 3),
      resolutions: Math.floor(Math.random() * 15) + 10,
      responseTime: Math.floor(Math.random() * 20) + 10,
    }));

    const sampleRegional: RegionalData[] = [
      { region: 'Northeast', sessions: 234, volunteers: 45, responseTime: 16, successRate: 96.2 },
      { region: 'Southeast', sessions: 189, volunteers: 38, responseTime: 22, successRate: 94.8 },
      { region: 'Midwest', sessions: 156, volunteers: 32, responseTime: 19, successRate: 95.1 },
      { region: 'Southwest', sessions: 178, volunteers: 41, responseTime: 20, successRate: 93.9 },
      { region: 'West Coast', sessions: 267, volunteers: 52, responseTime: 15, successRate: 97.1 },
    ];

    setMetrics(sampleMetrics);
    setTimeSeries(sampleTimeSeries);
    setRegionalData(sampleRegional);
  }, [timeRange]);

  // Calculate max values for scaling
  const maxActiveSessions = Math.max(...timeSeries.map(d => d.activeSessions));
  const maxResponseTime = Math.max(...timeSeries.map(d => d.responseTime));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Crisis Analytics Dashboard</h2>
              <p className="text-sm text-gray-600">FREE real-time crisis intervention insights</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange && onTimeRangeChange(range)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  timeRange === range
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{metric.label}</span>
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                  {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                  {metric.trend === 'stable' && <Activity className="w-4 h-4 text-gray-600" />}
                  <span className={cn(
                    'text-xs font-medium',
                    metric.change > 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
              
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {metric.id === 'success-rate' ? `${metric.value}%` : 
                 metric.id === 'response-time' ? `${metric.value}s` : 
                 metric.value}
              </div>

              {/* Progress to target */}
              {metric.target && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Target: {metric.target}{metric.id === 'success-rate' ? '%' : metric.id === 'response-time' ? 's' : ''}</span>
                    <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        metric.value >= metric.target ? 'bg-green-500' : 
                        metric.value >= metric.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Active Sessions Over Time
          </h3>
          
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="40"
                  y1={40 + i * 32}
                  x2="380"
                  y2={40 + i * 32}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              ))}
              
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => (
                <text
                  key={i}
                  x="35"
                  y={45 + i * 32}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {Math.round(maxActiveSessions - (i * maxActiveSessions / 4))}
                </text>
              ))}
              
              {/* Line chart */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={timeSeries.map((d, i) => {
                  const x = 40 + (i * 340 / (timeSeries.length - 1));
                  const y = 40 + (1 - d.activeSessions / maxActiveSessions) * 128;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Data points */}
              {timeSeries.map((d, i) => {
                const x = 40 + (i * 340 / (timeSeries.length - 1));
                const y = 40 + (1 - d.activeSessions / maxActiveSessions) * 128;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#3b82f6"
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`${d.activeSessions} sessions at ${d.timestamp.toLocaleTimeString()}`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-600" />
            Average Response Time
          </h3>
          
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="40"
                  y1={40 + i * 32}
                  x2="380"
                  y2={40 + i * 32}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              ))}
              
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => (
                <text
                  key={i}
                  x="35"
                  y={45 + i * 32}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {Math.round(maxResponseTime - (i * maxResponseTime / 4))}s
                </text>
              ))}
              
              {/* Area chart */}
              <path
                fill="url(#greenGradient)"
                stroke="#10b981"
                strokeWidth="2"
                d={`
                  M 40,${40 + (1 - timeSeries[0].responseTime / maxResponseTime) * 128}
                  ${timeSeries.map((d, i) => {
                    const x = 40 + (i * 340 / (timeSeries.length - 1));
                    const y = 40 + (1 - d.responseTime / maxResponseTime) * 128;
                    return `L ${x},${y}`;
                  }).join(' ')}
                  L 380,168
                  L 40,168
                  Z
                `}
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.05"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Regional Data */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-purple-600" />
          Regional Performance
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                <th className="pb-2">Region</th>
                <th className="pb-2">Sessions</th>
                <th className="pb-2">Volunteers</th>
                <th className="pb-2">Response Time</th>
                <th className="pb-2">Success Rate</th>
                <th className="pb-2">Performance</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {regionalData.map((region, index) => (
                <tr key={region.region} className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-900">{region.region}</td>
                  <td className="py-3">{region.sessions}</td>
                  <td className="py-3">{region.volunteers}</td>
                  <td className="py-3">{region.responseTime}s</td>
                  <td className="py-3">{region.successRate}%</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      {/* Performance bar */}
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={cn(
                            'h-2 rounded-full',
                            region.successRate >= 96 ? 'bg-green-500' :
                            region.successRate >= 94 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                          style={{ width: `${region.successRate}%` }}
                        />
                      </div>
                      {/* Rating stars */}
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'w-3 h-3',
                              star <= Math.round(region.successRate / 20) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crisis Severity Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          Crisis Severity Distribution
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { level: 'Immediate', count: 8, color: 'red', percentage: 6.2 },
            { level: 'High', count: 23, color: 'orange', percentage: 17.8 },
            { level: 'Moderate', count: 47, color: 'yellow', percentage: 36.4 },
            { level: 'Low', count: 51, color: 'green', percentage: 39.5 },
          ].map((item) => (
            <div key={item.level} className="text-center">
              <div className={cn(
                'w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg',
                item.color === 'red' ? 'bg-red-500' :
                item.color === 'orange' ? 'bg-orange-500' :
                item.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
              )}>
                {item.count}
              </div>
              <div className="text-sm font-medium text-gray-900">{item.level}</div>
              <div className="text-xs text-gray-500">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          System Health
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              name: 'Server Uptime', 
              value: 99.9, 
              target: 99.9, 
              unit: '%',
              status: 'excellent',
              icon: Shield
            },
            { 
              name: 'API Response', 
              value: 142, 
              target: 200, 
              unit: 'ms',
              status: 'good',
              icon: Zap
            },
            { 
              name: 'Error Rate', 
              value: 0.02, 
              target: 0.1, 
              unit: '%',
              status: 'excellent',
              icon: Target
            },
          ].map((health) => (
            <div key={health.name} className="text-center">
              <div className={cn(
                'w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center',
                health.status === 'excellent' ? 'bg-green-100 text-green-600' :
                health.status === 'good' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              )}>
                <health.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{health.value}{health.unit}</div>
              <div className="text-sm text-gray-600">{health.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                Target: {health.target}{health.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free Platform Notice */}
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-700">
          📊 All analytics and insights are 100% FREE • No premium dashboards • Equal access for all
        </p>
      </div>
    </div>
  );
};

// Simple pie chart component
export const SimplePieChart: React.FC<{
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  className?: string;
}> = ({ data, size = 200, className }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className={cn('flex items-center', className)}>
      <svg width={size} height={size} className="mr-4">
        {data.map((item, index) => {
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const largeArc = angle > 180 ? 1 : 0;
          const x1 = size/2 + (size/2 - 10) * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = size/2 + (size/2 - 10) * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = size/2 + (size/2 - 10) * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = size/2 + (size/2 - 10) * Math.sin((endAngle - 90) * Math.PI / 180);
          
          currentAngle += angle;
          
          return (
            <path
              key={index}
              d={`M ${size/2} ${size/2} L ${x1} ${y1} A ${size/2 - 10} ${size/2 - 10} 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-700">{item.label}</span>
            <span className="text-sm font-medium text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrisisDataCharts;