/**
 * 🚀 ZERO-DEFECT TESTING API ENDPOINT
 * Production-Ready Testing Agent API
 * 
 * This API endpoint provides access to the military-grade Zero-Defect Testing
 * System for the life-critical ASTRAL Core V2 mental health platform.
 */

import { NextRequest, NextResponse } from 'next/server';
import { zeroDefectEngine } from '@/lib/zero-defect-engine';
import { sevenLayerPipeline } from '@/lib/seven-layer-pipeline';
import { automatedCertification } from '@/lib/automated-certification';
import { testRegistry } from '@/lib/test-registry';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation') || 'status';

    switch (operation) {
      case 'status':
        return NextResponse.json(await getSystemStatus());
      
      case 'stats':
        return NextResponse.json(await getTestingStats());
      
      case 'registry':
        return NextResponse.json(await getRegistryInfo());
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation. Supported: status, stats, registry' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Zero-Defect API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, options = {} } = body;

    switch (operation) {
      case 'execute_certification':
        return NextResponse.json(await executeCertification(options));
      
      case 'execute_pipeline':
        return NextResponse.json(await executePipeline(options));
      
      case 'execute_layer':
        return NextResponse.json(await executeLayer(options));
      
      case 'critical_path':
        return NextResponse.json(await executeCriticalPath());
      
      case 'validate_zero_defect':
        return NextResponse.json(await validateZeroDefect());
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Zero-Defect API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get system status
 */
async function getSystemStatus() {
  const registryStats = testRegistry.getRegistryStats();
  const pipelineStats = sevenLayerPipeline.getPipelineStats();
  
  return {
    status: 'operational',
    timestamp: new Date().toISOString(),
    system: {
      name: 'Zero-Defect Testing System',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    },
    registry: {
      totalRegistered: registryStats.totalRegistered,
      targetTotal: registryStats.targetTotal,
      registrationProgress: registryStats.registrationProgress,
      implementationStatus: testRegistry.getImplementationStatus()
    },
    pipeline: {
      totalLayers: pipelineStats.totalLayers,
      totalTests: pipelineStats.totalTests,
      estimatedExecutionTime: pipelineStats.estimatedExecutionTime
    },
    militaryGradeStandards: {
      zeroDefectTolerance: true,
      requiredPassRate: 100.0,
      maxCriticalFailures: 0,
      maxHighFailures: 0
    }
  };
}

/**
 * Get comprehensive testing statistics
 */
async function getTestingStats() {
  const registryStats = testRegistry.getRegistryStats();
  const implementationStatus = testRegistry.getImplementationStatus();
  const pipelineStats = sevenLayerPipeline.getPipelineStats();
  
  return {
    timestamp: new Date().toISOString(),
    overview: {
      totalVerificationPoints: registryStats.targetTotal,
      registeredPoints: registryStats.totalRegistered,
      implementedPoints: implementationStatus.implemented,
      implementationProgress: implementationStatus.percentage
    },
    breakdown: {
      byCategory: registryStats.byCategory,
      byLayer: registryStats.byLayer,
      byCriticality: registryStats.byCriticality
    },
    pipeline: {
      layers: pipelineStats.layerNames,
      testsByLayer: pipelineStats.testsByLayer,
      estimatedDuration: `${Math.round(pipelineStats.estimatedExecutionTime / 1000 / 60)} minutes`
    },
    criticalPath: {
      totalCriticalTests: testRegistry.getCriticalPathTests().length,
      criticalTestsByLayer: Object.fromEntries(
        Object.entries(pipelineStats.testsByLayer).map(([layer, count]) => [
          layer,
          testRegistry.getTestsByLayer(layer as any).filter(t => t.criticality === 'CRITICAL').length
        ])
      )
    }
  };
}

/**
 * Get test registry information
 */
async function getRegistryInfo() {
  const stats = testRegistry.getRegistryStats();
  const executionPlan = testRegistry.generateExecutionPlan();
  
  return {
    timestamp: new Date().toISOString(),
    registry: {
      totalTests: stats.totalRegistered,
      targetTests: stats.targetTotal,
      progress: stats.registrationProgress,
      categories: stats.byCategory,
      layers: stats.byLayer,
      criticality: stats.byCriticality
    },
    executionPlan: {
      totalPhases: executionPlan.phases.length,
      totalDuration: `${Math.round(executionPlan.totalDuration / 1000 / 60)} minutes`,
      phases: executionPlan.phases.map(phase => ({
        phase: phase.phase,
        name: phase.name,
        testCount: phase.tests.length,
        estimatedDuration: `${Math.round(phase.estimatedDuration / 1000 / 60)} minutes`
      }))
    },
    sampleTests: {
      critical: testRegistry.getCriticalPathTests().slice(0, 5).map(t => ({
        id: t.id,
        description: t.description,
        category: t.category,
        layer: t.layer
      })),
      byCategory: Object.fromEntries(
        Object.keys(stats.byCategory).map(category => [
          category,
          testRegistry.getTestsByCategory(category as any).slice(0, 3).map(t => ({
            id: t.id,
            description: t.description
          }))
        ])
      )
    }
  };
}

/**
 * Execute full certification workflow
 */
async function executeCertification(options: any = {}) {
  const startTime = Date.now();
  
  console.log('🚀 API: Starting automated certification workflow...');
  
  try {
    const certificationReport = await automatedCertification.executeCertificationWorkflow();
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      executionTime: `${executionTime}ms`,
      certification: {
        id: certificationReport.certificationId,
        certified: certificationReport.certified,
        overallScore: certificationReport.overallScore,
        timestamp: certificationReport.timestamp,
        deploymentAuthorized: certificationReport.deploymentAuthorization.authorized
      },
      summary: {
        totalLayers: certificationReport.pipelineResult.totalLayers,
        passedLayers: certificationReport.pipelineResult.passedLayers,
        totalTests: certificationReport.pipelineResult.certification.verificationCount,
        passRate: certificationReport.pipelineResult.certification.passRate,
        failures: certificationReport.failureAnalysis.totalFailures,
        criticalFailures: certificationReport.failureAnalysis.criticalFailures
      },
      recommendations: certificationReport.recommendations,
      deploymentRestrictions: certificationReport.deploymentAuthorization.restrictions
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Certification failed',
      executionTime: `${Date.now() - startTime}ms`
    };
  }
}

/**
 * Execute seven-layer pipeline
 */
async function executePipeline(options: any = {}) {
  const startTime = Date.now();
  
  console.log('🔧 API: Starting seven-layer pipeline execution...');
  
  try {
    const pipelineResult = await sevenLayerPipeline.executeFullPipeline();
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      executionTime: `${executionTime}ms`,
      pipeline: {
        id: pipelineResult.pipelineId,
        overallPassed: pipelineResult.overallPassed,
        totalLayers: pipelineResult.totalLayers,
        passedLayers: pipelineResult.passedLayers,
        totalExecutionTime: pipelineResult.totalExecutionTime
      },
      layers: pipelineResult.layerResults.map(layer => ({
        layer: layer.layer,
        name: layer.layerName,
        passed: layer.passed,
        tests: `${layer.passedTests}/${layer.totalTests}`,
        passRate: ((layer.passedTests / layer.totalTests) * 100).toFixed(1) + '%',
        executionTime: `${layer.executionTime}ms`,
        criticalFailures: layer.criticalFailures.length
      })),
      certification: {
        certified: pipelineResult.certification.certified,
        passRate: pipelineResult.certification.passRate,
        failedVerifications: pipelineResult.certification.failedVerifications.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Pipeline execution failed',
      executionTime: `${Date.now() - startTime}ms`
    };
  }
}

/**
 * Execute specific layer
 */
async function executeLayer(options: any = {}) {
  const { layer } = options;
  
  if (!layer) {
    throw new Error('Layer parameter required');
  }
  
  const startTime = Date.now();
  
  console.log(`🔄 API: Executing layer: ${layer}`);
  
  try {
    const layerResult = await sevenLayerPipeline.executeSpecificLayer(layer);
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      executionTime: `${executionTime}ms`,
      layer: {
        name: layerResult.layerName,
        passed: layerResult.passed,
        totalTests: layerResult.totalTests,
        passedTests: layerResult.passedTests,
        failedTests: layerResult.failedTests,
        passRate: ((layerResult.passedTests / layerResult.totalTests) * 100).toFixed(1) + '%',
        executionTime: `${layerResult.executionTime}ms`,
        criticalFailures: layerResult.criticalFailures
      },
      results: layerResult.results.map(result => ({
        id: result.verificationId,
        passed: result.passed,
        executionTime: result.executionTime,
        error: result.errorDetails
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Layer execution failed',
      executionTime: `${Date.now() - startTime}ms`
    };
  }
}

/**
 * Execute critical path tests only
 */
async function executeCriticalPath() {
  const startTime = Date.now();
  
  console.log('🚨 API: Starting critical path execution...');
  
  try {
    const pipelineResult = await sevenLayerPipeline.executeCriticalPath();
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      executionTime: `${executionTime}ms`,
      criticalPath: {
        id: pipelineResult.pipelineId,
        overallPassed: pipelineResult.overallPassed,
        totalLayers: pipelineResult.totalLayers,
        passedLayers: pipelineResult.passedLayers
      },
      summary: {
        totalCriticalTests: pipelineResult.certification.verificationCount,
        passRate: pipelineResult.certification.passRate,
        failures: pipelineResult.certification.failedVerifications.length
      },
      layers: pipelineResult.layerResults.map(layer => ({
        layer: layer.layer,
        criticalTests: layer.totalTests,
        passed: layer.passed,
        failures: layer.criticalFailures.length
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Critical path execution failed',
      executionTime: `${Date.now() - startTime}ms`
    };
  }
}

/**
 * Execute zero-defect validation
 */
async function validateZeroDefect() {
  const startTime = Date.now();
  
  console.log('⚡ API: Starting zero-defect validation...');
  
  try {
    const certification = await zeroDefectEngine.certifyForProduction();
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      executionTime: `${executionTime}ms`,
      zeroDefect: {
        certified: certification.certified,
        verificationCount: certification.verificationCount,
        passRate: certification.passRate,
        deploymentAuthorized: certification.deploymentAuthorized,
        failedVerifications: certification.failedVerifications,
        timestamp: certification.timestamp
      },
      militaryGradeCompliance: {
        zeroToleranceEnforced: true,
        requiredPassRate: 100.0,
        actualPassRate: certification.passRate,
        criticalFailures: certification.failedVerifications.length,
        deploymentReady: certification.deploymentAuthorized
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Zero-defect validation failed',
      executionTime: `${Date.now() - startTime}ms`,
      deploymentBlocked: true
    };
  }
}