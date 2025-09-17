// Bundle Optimization Script for ASTRAL CORE 2.0
// Crisis-first optimization targeting <200KB initial bundle

const fs = require('fs');
const path = require('path');
const { gzipSize } = require('gzip-size');

// Crisis performance targets
const PERFORMANCE_TARGETS = {
  initialBundle: 150 * 1024, // 150KB
  chunkSize: 50 * 1024,      // 50KB per chunk
  totalSize: 500 * 1024,     // 500KB total
  compressionRatio: 0.3      // 70% compression target
};

// Critical components that must be in initial bundle
const CRITICAL_COMPONENTS = [
  'CrisisButton',
  'EmergencyContact',
  'HotlineAccess',
  'EmotionTheme',
  'GestureControls',
  'NotificationSystem'
];

// Components that can be lazy loaded
const LAZY_LOAD_COMPONENTS = [
  'AdminDashboard',
  'AnalyticsCharts',
  'AdvancedSettings',
  'DetailedProfile',
  'DocumentationViewer',
  'TestingUtilities'
];

// Bundle analyzer and optimizer
class CrisisBundleOptimizer {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || './dist',
      sourceDir: options.sourceDir || './src',
      compressionLevel: options.compressionLevel || 9,
      ...options
    };
    
    this.bundleStats = {
      components: new Map(),
      totalSize: 0,
      compressedSize: 0,
      criticalSize: 0,
      lazySize: 0
    };
  }
  
  // Analyze current bundle composition
  async analyzeBundles() {
    console.log('🔍 Analyzing ASTRAL CORE bundles for crisis optimization...\n');
    
    const components = await this.scanComponents();
    
    for (const component of components) {
      const stats = await this.analyzeComponent(component);
      this.bundleStats.components.set(component.name, stats);
      this.bundleStats.totalSize += stats.size;
      
      if (CRITICAL_COMPONENTS.includes(component.name)) {
        this.bundleStats.criticalSize += stats.size;
      } else {
        this.bundleStats.lazySize += stats.size;
      }
    }
    
    await this.calculateCompression();
    this.generateReport();
    this.checkPerformanceTargets();
    
    return this.bundleStats;
  }
  
  // Scan for React components
  async scanComponents() {
    const components = [];
    const componentDirs = [
      'components',
      'providers',
      'hooks',
      'layouts'
    ];
    
    for (const dir of componentDirs) {
      const dirPath = path.join(this.options.sourceDir, dir);
      if (fs.existsSync(dirPath)) {
        const files = await this.scanDirectory(dirPath);
        components.push(...files);
      }
    }
    
    return components;
  }
  
  async scanDirectory(dirPath) {
    const components = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        const subdirComponents = await this.scanDirectory(fullPath);
        components.push(...subdirComponents);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        const name = path.basename(entry.name, path.extname(entry.name));
        components.push({
          name,
          path: fullPath,
          type: this.getComponentType(name)
        });
      }
    }
    
    return components;
  }
  
  getComponentType(name) {
    if (CRITICAL_COMPONENTS.includes(name)) return 'critical';
    if (LAZY_LOAD_COMPONENTS.includes(name)) return 'lazy';
    if (name.startsWith('Crisis')) return 'critical';
    if (name.includes('Admin')) return 'lazy';
    return 'standard';
  }
  
  // Analyze individual component
  async analyzeComponent(component) {
    try {
      const content = fs.readFileSync(component.path, 'utf8');
      const size = Buffer.byteLength(content, 'utf8');
      const compressedSize = await gzipSize(content);
      
      // Analyze dependencies
      const dependencies = this.extractDependencies(content);
      const complexity = this.calculateComplexity(content);
      
      return {
        size,
        compressedSize,
        dependencies,
        complexity,
        compressionRatio: compressedSize / size,
        isCritical: component.type === 'critical',
        canLazyLoad: component.type === 'lazy'
      };
    } catch (error) {
      console.error(`Error analyzing component ${component.name}:`, error);
      return {
        size: 0,
        compressedSize: 0,
        dependencies: [],
        complexity: 0,
        compressionRatio: 1,
        isCritical: false,
        canLazyLoad: true,
        error: error.message
      };
    }
  }
  
  extractDependencies(content) {
    const importRegex = /import\s+(?:{[^}]*}|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    const dependencies = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }
    
    return dependencies;
  }
  
  calculateComplexity(content) {
    // Simple complexity metrics
    const lines = content.split('\n').length;
    const functions = (content.match(/function|const\s+\w+\s*=/g) || []).length;
    const hooks = (content.match(/use[A-Z]\w*/g) || []).length;
    const jsx = (content.match(/<[A-Z]/g) || []).length;
    
    return {
      lines,
      functions,
      hooks,
      jsx,
      score: lines + functions * 2 + hooks * 3 + jsx
    };
  }
  
  async calculateCompression() {
    this.bundleStats.compressedSize = Array.from(this.bundleStats.components.values())
      .reduce((total, stats) => total + stats.compressedSize, 0);
  }
  
  generateReport() {
    console.log('📊 ASTRAL CORE 2.0 Bundle Analysis Report\n');
    console.log('═'.repeat(60));
    
    // Size breakdown
    const totalSizeKB = (this.bundleStats.totalSize / 1024).toFixed(2);
    const compressedSizeKB = (this.bundleStats.compressedSize / 1024).toFixed(2);
    const criticalSizeKB = (this.bundleStats.criticalSize / 1024).toFixed(2);
    const lazySizeKB = (this.bundleStats.lazySize / 1024).toFixed(2);
    
    console.log(`📦 Total Bundle Size: ${totalSizeKB}KB (uncompressed)`);
    console.log(`🗜️  Compressed Size: ${compressedSizeKB}KB (gzipped)`);
    console.log(`🚨 Critical Bundle: ${criticalSizeKB}KB (crisis components)`);
    console.log(`⏳ Lazy Loadable: ${lazySizeKB}KB (non-critical components)`);
    console.log(`📊 Compression Ratio: ${((1 - this.bundleStats.compressedSize / this.bundleStats.totalSize) * 100).toFixed(1)}%`);
    console.log('');
    
    // Component breakdown
    console.log('📋 Component Analysis:');
    console.log('─'.repeat(60));
    
    const sortedComponents = Array.from(this.bundleStats.components.entries())
      .sort(([,a], [,b]) => b.size - a.size);
    
    sortedComponents.slice(0, 10).forEach(([name, stats]) => {
      const sizeKB = (stats.size / 1024).toFixed(1);
      const compressedKB = (stats.compressedSize / 1024).toFixed(1);
      const type = stats.isCritical ? '🚨' : stats.canLazyLoad ? '⏳' : '📄';
      
      console.log(`${type} ${name.padEnd(30)} ${sizeKB.padStart(8)}KB → ${compressedKB.padStart(8)}KB`);
    });
    
    console.log('');
    
    // Crisis-specific optimizations
    console.log('🏥 Crisis Optimization Recommendations:');
    console.log('─'.repeat(60));
    
    this.generateOptimizationRecommendations();
  }
  
  generateOptimizationRecommendations() {
    const recommendations = [];
    
    // Check bundle size targets
    if (this.bundleStats.criticalSize > PERFORMANCE_TARGETS.initialBundle) {
      recommendations.push({
        priority: 'HIGH',
        message: `Critical bundle (${(this.bundleStats.criticalSize / 1024).toFixed(1)}KB) exceeds crisis target (${PERFORMANCE_TARGETS.initialBundle / 1024}KB)`,
        action: 'Move non-essential components to lazy loading'
      });
    }
    
    // Check for large components that can be optimized
    const largeComponents = Array.from(this.bundleStats.components.entries())
      .filter(([, stats]) => stats.size > 10 * 1024) // >10KB
      .filter(([, stats]) => !stats.isCritical);
    
    if (largeComponents.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        message: `${largeComponents.length} large non-critical components found`,
        action: 'Consider lazy loading: ' + largeComponents.map(([name]) => name).slice(0, 3).join(', ')
      });
    }
    
    // Check compression effectiveness
    const avgCompressionRatio = this.bundleStats.compressedSize / this.bundleStats.totalSize;
    if (avgCompressionRatio > PERFORMANCE_TARGETS.compressionRatio) {
      recommendations.push({
        priority: 'LOW',
        message: `Compression ratio (${(avgCompressionRatio * 100).toFixed(1)}%) could be improved`,
        action: 'Consider using more compressible code patterns'
      });
    }
    
    // Display recommendations
    if (recommendations.length === 0) {
      console.log('✅ Bundle optimization looks good for crisis scenarios!');
    } else {
      recommendations.forEach(rec => {
        const priority = rec.priority === 'HIGH' ? '🚨' : rec.priority === 'MEDIUM' ? '⚠️' : 'ℹ️';
        console.log(`${priority} ${rec.priority}: ${rec.message}`);
        console.log(`   Action: ${rec.action}\n`);
      });
    }
  }
  
  checkPerformanceTargets() {
    console.log('🎯 Crisis Performance Target Analysis:');
    console.log('─'.repeat(60));
    
    const targets = [
      {
        name: 'Initial Bundle Size',
        current: this.bundleStats.criticalSize,
        target: PERFORMANCE_TARGETS.initialBundle,
        unit: 'KB'
      },
      {
        name: 'Total Bundle Size',
        current: this.bundleStats.totalSize,
        target: PERFORMANCE_TARGETS.totalSize,
        unit: 'KB'
      },
      {
        name: 'Compression Ratio',
        current: this.bundleStats.compressedSize / this.bundleStats.totalSize,
        target: PERFORMANCE_TARGETS.compressionRatio,
        unit: '%',
        invert: true
      }
    ];
    
    targets.forEach(target => {
      const currentValue = target.unit === '%' 
        ? (target.current * 100).toFixed(1) 
        : (target.current / 1024).toFixed(1);
      const targetValue = target.unit === '%'
        ? (target.target * 100).toFixed(1)
        : (target.target / 1024).toFixed(1);
      
      const isWithinTarget = target.invert 
        ? target.current <= target.target
        : target.current <= target.target;
      
      const status = isWithinTarget ? '✅' : '❌';
      const percentage = target.invert
        ? ((target.target / target.current) * 100).toFixed(1)
        : ((target.current / target.target) * 100).toFixed(1);
      
      console.log(`${status} ${target.name}: ${currentValue}${target.unit} / ${targetValue}${target.unit} (${percentage}%)`);
    });
    
    console.log('');
  }
  
  // Generate optimization script
  generateOptimizationScript() {
    const script = `
// Auto-generated optimization configuration for ASTRAL CORE 2.0
// Crisis-first bundle optimization

export const BUNDLE_CONFIG = {
  // Critical components for immediate loading
  critical: [
    ${CRITICAL_COMPONENTS.map(comp => `'${comp}'`).join(',\n    ')}
  ],
  
  // Components for lazy loading
  lazy: [
    ${LAZY_LOAD_COMPONENTS.map(comp => `'${comp}'`).join(',\n    ')}
  ],
  
  // Performance targets
  targets: {
    initialBundle: ${PERFORMANCE_TARGETS.initialBundle / 1024}KB,
    chunkSize: ${PERFORMANCE_TARGETS.chunkSize / 1024}KB,
    totalSize: ${PERFORMANCE_TARGETS.totalSize / 1024}KB
  },
  
  // Current metrics
  current: {
    totalSize: ${(this.bundleStats.totalSize / 1024).toFixed(2)}KB,
    compressedSize: ${(this.bundleStats.compressedSize / 1024).toFixed(2)}KB,
    criticalSize: ${(this.bundleStats.criticalSize / 1024).toFixed(2)}KB,
    lazySize: ${(this.bundleStats.lazySize / 1024).toFixed(2)}KB
  }
};

// Webpack optimization configuration
export const WEBPACK_OPTIMIZATION = {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      critical: {
        name: 'critical',
        test: /[\\\\/]components[\\\\/](crisis|emergency|hotline)/,
        priority: 30,
        enforce: true
      },
      vendor: {
        name: 'vendor',
        test: /[\\\\/]node_modules[\\\\/]/,
        priority: 20
      },
      common: {
        name: 'common',
        minChunks: 2,
        priority: 10
      }
    }
  },
  
  usedExports: true,
  sideEffects: false,
  
  minimizer: [
    // Crisis-optimized compression settings
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.debug']
        }
      }
    })
  ]
};
`;
    
    fs.writeFileSync(
      path.join(this.options.outputDir, 'bundle-config.js'),
      script
    );
    
    console.log('📝 Generated optimization configuration: bundle-config.js');
  }
}

// CLI usage
if (require.main === module) {
  const optimizer = new CrisisBundleOptimizer({
    sourceDir: process.argv[2] || './src',
    outputDir: process.argv[3] || './dist'
  });
  
  optimizer.analyzeBundles()
    .then(() => {
      optimizer.generateOptimizationScript();
      console.log('\n🎉 Bundle optimization analysis complete!');
      console.log('💚 All optimizations support the 100% FREE crisis platform commitment');
    })
    .catch(error => {
      console.error('❌ Bundle optimization failed:', error);
      process.exit(1);
    });
}

module.exports = CrisisBundleOptimizer;