/**
 * 🏗️ ZERO-DEFECT TESTING DASHBOARD
 * Military-Grade Quality Assurance Interface
 * 
 * Interactive dashboard for monitoring and executing the Zero-Defect Testing
 * System for the life-critical ASTRAL Core V2 mental health platform.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Play, 
  Clock, 
  AlertTriangle,
  Target,
  Layers,
  FileCheck,
  Zap
} from 'lucide-react';

interface SystemStatus {
  status: string;
  timestamp: string;
  system: {
    name: string;
    version: string;
    environment: string;
  };
  registry: {
    totalRegistered: number;
    targetTotal: number;
    registrationProgress: number;
    implementationStatus: {
      implemented: number;
      planned: number;
      inProgress: number;
      total: number;
      percentage: number;
    };
  };
  pipeline: {
    totalLayers: number;
    totalTests: number;
    estimatedExecutionTime: number;
  };
  militaryGradeStandards: {
    zeroDefectTolerance: boolean;
    requiredPassRate: number;
    maxCriticalFailures: number;
    maxHighFailures: number;
  };
}

interface TestingStats {
  timestamp: string;
  overview: {
    totalVerificationPoints: number;
    registeredPoints: number;
    implementedPoints: number;
    implementationProgress: number;
  };
  breakdown: {
    byCategory: Record<string, number>;
    byLayer: Record<string, number>;
    byCriticality: Record<string, number>;
  };
  pipeline: {
    layers: string[];
    testsByLayer: Record<string, number>;
    estimatedDuration: string;
  };
  criticalPath: {
    totalCriticalTests: number;
    criticalTestsByLayer: Record<string, number>;
  };
}

interface ExecutionResult {
  success: boolean;
  executionTime: string;
  error?: string;
  [key: string]: any;
}

export default function ZeroDefectTestingDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [testingStats, setTestingStats] = useState<TestingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [lastExecution, setLastExecution] = useState<ExecutionResult | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load system status
      const statusResponse = await fetch('/api/testing/zero-defect?operation=status');
      const statusData = await statusResponse.json();
      setSystemStatus(statusData);

      // Load testing statistics
      const statsResponse = await fetch('/api/testing/zero-defect?operation=stats');
      const statsData = await statsResponse.json();
      setTestingStats(statsData);
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeOperation = async (operation: string, options: any = {}) => {
    try {
      setExecuting(operation);
      setLastExecution(null);

      const response = await fetch('/api/testing/zero-defect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation, options }),
      });

      const result = await response.json();
      setLastExecution(result);
      
      // Refresh data after execution
      await loadInitialData();
      
    } catch (error) {
      setLastExecution({
        success: false,
        executionTime: '0ms',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setExecuting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Zero-Defect Testing System...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1" />Operational</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-4 h-4 mr-1" />Unknown</Badge>;
    }
  };

  const formatTime = (ms: number) => {
    return `${Math.round(ms / 1000 / 60)} minutes`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Zero-Defect Testing System
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Military-Grade Quality Assurance for Life-Critical Mental Health Platform
          </p>
          <div className="flex items-center mt-2">
            {systemStatus && getStatusBadge(systemStatus.status)}
            <span className="ml-4 text-sm text-gray-700">
              {systemStatus?.system.name} v{systemStatus?.system.version}
            </span>
          </div>
        </div>

        {/* System Overview */}
        {systemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {systemStatus.registry.totalRegistered.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Verification Points</p>
                    <p className="text-xs text-gray-700">
                      Target: {systemStatus.registry.targetTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Layers className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {systemStatus.pipeline.totalLayers}
                    </p>
                    <p className="text-sm text-gray-600">Validation Layers</p>
                    <p className="text-xs text-gray-700">
                      {systemStatus.pipeline.totalTests.toLocaleString()} tests
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatTime(systemStatus.pipeline.estimatedExecutionTime)}
                    </p>
                    <p className="text-sm text-gray-600">Est. Duration</p>
                    <p className="text-xs text-gray-700">Full pipeline</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileCheck className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {systemStatus.militaryGradeStandards.requiredPassRate}%
                    </p>
                    <p className="text-sm text-gray-600">Required Pass Rate</p>
                    <p className="text-xs text-gray-700">Zero tolerance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Implementation Progress */}
        {systemStatus && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Implementation Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Test Registration Progress</span>
                    <span>{systemStatus.registry.registrationProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemStatus.registry.registrationProgress} className="h-2" />
                  <p className="text-xs text-gray-700 mt-1">
                    {systemStatus.registry.totalRegistered.toLocaleString()} of {systemStatus.registry.targetTotal.toLocaleString()} verification points registered
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Implementation Progress</span>
                    <span>{systemStatus.registry.implementationStatus.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemStatus.registry.implementationStatus.percentage} className="h-2" />
                  <p className="text-xs text-gray-700 mt-1">
                    {systemStatus.registry.implementationStatus.implemented.toLocaleString()} implemented, {systemStatus.registry.implementationStatus.planned.toLocaleString()} planned
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Testing Statistics */}
        {testingStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Test Distribution by Layer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(testingStats.breakdown.byLayer).map(([layer, count]) => (
                    <div key={layer} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{layer.replace('_', ' ')}</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">{count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(testingStats.breakdown.byLayer))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(testingStats.breakdown.byCriticality).map(([priority, count]) => {
                    const colors = {
                      CRITICAL: 'bg-red-600',
                      HIGH: 'bg-orange-600',
                      MEDIUM: 'bg-yellow-600',
                      LOW: 'bg-green-600'
                    };
                    
                    return (
                      <div key={priority} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{priority}</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">{count}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${colors[priority as keyof typeof colors]} h-2 rounded-full`}
                              style={{ width: `${(count / Math.max(...Object.values(testingStats.breakdown.byCriticality))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Execution Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Testing Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button
                onClick={() => executeOperation('execute_certification')}
                disabled={!!executing}
                className="flex items-center justify-center"
              >
                {executing === 'execute_certification' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Full Certification
              </Button>

              <Button
                onClick={() => executeOperation('execute_pipeline')}
                disabled={!!executing}
                variant="secondary"
                className="flex items-center justify-center"
              >
                {executing === 'execute_pipeline' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                ) : (
                  <Layers className="w-4 h-4 mr-2" />
                )}
                Seven-Layer Pipeline
              </Button>

              <Button
                onClick={() => executeOperation('critical_path')}
                disabled={!!executing}
                variant="destructive"
                className="flex items-center justify-center"
              >
                {executing === 'critical_path' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-2" />
                )}
                Critical Path
              </Button>

              <Button
                onClick={() => executeOperation('validate_zero_defect')}
                disabled={!!executing}
                variant="outline"
                className="flex items-center justify-center"
              >
                {executing === 'validate_zero_defect' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Zero-Defect
              </Button>

              <Button
                onClick={loadInitialData}
                disabled={!!executing}
                variant="ghost"
                className="flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Execution Results */}
        {lastExecution && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                {lastExecution.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                Last Execution Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={lastExecution.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Status: {lastExecution.success ? 'Success' : 'Failed'}
                      </span>
                      <span className="text-sm text-gray-600">
                        Execution Time: {lastExecution.executionTime}
                      </span>
                    </div>
                    
                    {lastExecution.error && (
                      <p className="text-red-600 text-sm">{lastExecution.error}</p>
                    )}
                    
                    {lastExecution.certification && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-700">Certification</p>
                          <p className="font-medium">{lastExecution.certification.certified ? 'Certified' : 'Not Certified'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-700">Overall Score</p>
                          <p className="font-medium">{lastExecution.certification.overallScore}/100</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-700">Deployment</p>
                          <p className="font-medium">{lastExecution.certification.deploymentAuthorized ? 'Authorized' : 'Blocked'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-700">Failures</p>
                          <p className="font-medium">{lastExecution.summary?.criticalFailures || 0} Critical</p>
                        </div>
                      </div>
                    )}
                    
                    {lastExecution.recommendations && lastExecution.recommendations.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Recommendations:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {lastExecution.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Military-Grade Standards */}
        {systemStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Military-Grade Quality Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {systemStatus.militaryGradeStandards.maxCriticalFailures}
                  </p>
                  <p className="text-sm text-gray-600">Max Critical Failures</p>
                  <p className="text-xs text-red-600 font-medium">ZERO TOLERANCE</p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {systemStatus.militaryGradeStandards.maxHighFailures}
                  </p>
                  <p className="text-sm text-gray-600">Max High Failures</p>
                  <p className="text-xs text-orange-600 font-medium">ZERO TOLERANCE</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {systemStatus.militaryGradeStandards.requiredPassRate}%
                  </p>
                  <p className="text-sm text-gray-600">Required Pass Rate</p>
                  <p className="text-xs text-green-600 font-medium">PERFECTION REQUIRED</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {systemStatus.registry.targetTotal.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Verification Points</p>
                  <p className="text-xs text-blue-600 font-medium">COMPREHENSIVE COVERAGE</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-center text-sm text-gray-700 font-medium">
                  "Every line of code, every user interaction, and every crisis intervention must achieve absolute perfection. 
                  Zero defects, zero compromises, zero failures - because lives depend on it."
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}