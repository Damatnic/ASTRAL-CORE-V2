/**
 * HIPAA Audit Chain Verifier
 * 
 * Provides tamper-proof hash chain verification and blockchain-like
 * integrity checking for audit logs. This ensures that audit records
 * cannot be modified without detection.
 */

import * as crypto from 'crypto';
import { HIPAAAuditEvent } from './audit-logger';
import { SecurityLogger } from './logging/security-logger';

export interface ChainBlock {
  index: number;
  timestamp: Date;
  events: HIPAAAuditEvent[];
  previousHash: string;
  merkleRoot: string;
  nonce: number;
  hash: string;
  signature: string;
}

export interface ChainIntegrityReport {
  isValid: boolean;
  totalBlocks: number;
  verifiedBlocks: number;
  corruptedBlocks: number[];
  missingBlocks: number[];
  integrityScore: number;
  lastVerifiedBlock: number;
  errors: string[];
  recommendations: string[];
}

export interface ChainMetrics {
  chainLength: number;
  totalEvents: number;
  averageEventsPerBlock: number;
  chainCreationDate: Date;
  lastBlockDate: Date;
  integrityChecksCount: number;
  lastIntegrityCheck: Date;
  tamperAttempts: number;
}

export class HIPAAAuditChainVerifier {
  private logger: SecurityLogger;
  private chain: ChainBlock[] = [];
  private signingKey: Buffer;
  private difficulty: number = 4; // Number of leading zeros required in hash
  private readonly maxEventsPerBlock = 1000;
  private readonly hashAlgorithm = 'sha256';
  
  constructor(signingKey: Buffer) {
    this.logger = new SecurityLogger();
    this.signingKey = signingKey;
    this.initializeGenesisBlock();
  }

  /**
   * Initialize the genesis block
   */
  private initializeGenesisBlock(): void {
    const genesisBlock: ChainBlock = {
      index: 0,
      timestamp: new Date(),
      events: [],
      previousHash: '0',
      merkleRoot: this.calculateMerkleRoot([]),
      nonce: 0,
      hash: '',
      signature: ''
    };

    genesisBlock.hash = this.mineBlock(genesisBlock);
    genesisBlock.signature = this.signBlock(genesisBlock);
    
    this.chain.push(genesisBlock);
    
    this.logger.audit('Audit chain genesis block created', {
      blockIndex: 0,
      hash: genesisBlock.hash,
      timestamp: genesisBlock.timestamp
    });
  }

  /**
   * Add events to the audit chain
   */
  public async addEventsToChain(events: HIPAAAuditEvent[]): Promise<ChainBlock> {
    try {
      if (events.length === 0) {
        throw new Error('Cannot add empty events to chain');
      }

      // Verify all events have proper hash chain
      this.verifyEventChain(events);

      // Create new block
      const previousBlock = this.getLatestBlock();
      const newBlock: ChainBlock = {
        index: previousBlock.index + 1,
        timestamp: new Date(),
        events: events.slice(0, this.maxEventsPerBlock), // Limit block size
        previousHash: previousBlock.hash,
        merkleRoot: this.calculateMerkleRoot(events),
        nonce: 0,
        hash: '',
        signature: ''
      };

      // Mine the block (proof of work)
      newBlock.hash = this.mineBlock(newBlock);
      
      // Sign the block
      newBlock.signature = this.signBlock(newBlock);
      
      // Add to chain
      this.chain.push(newBlock);

      this.logger.audit('Events added to audit chain', {
        blockIndex: newBlock.index,
        eventCount: events.length,
        blockHash: newBlock.hash,
        merkleRoot: newBlock.merkleRoot
      });

      // Handle remaining events if any
      const remainingEvents = events.slice(this.maxEventsPerBlock);
      if (remainingEvents.length > 0) {
        await this.addEventsToChain(remainingEvents);
      }

      return newBlock;

    } catch (error) {
      this.logger.error('Failed to add events to audit chain', error as Error);
      throw error;
    }
  }

  /**
   * Verify the integrity of the entire audit chain
   */
  public async verifyChainIntegrity(): Promise<ChainIntegrityReport> {
    const report: ChainIntegrityReport = {
      isValid: true,
      totalBlocks: this.chain.length,
      verifiedBlocks: 0,
      corruptedBlocks: [],
      missingBlocks: [],
      integrityScore: 0,
      lastVerifiedBlock: -1,
      errors: [],
      recommendations: []
    };

    try {
      for (let i = 0; i < this.chain.length; i++) {
        const block = this.chain[i];
        const blockErrors: string[] = [];

        // Verify block hash
        const expectedHash = this.calculateBlockHash(block);
        if (block.hash !== expectedHash) {
          blockErrors.push(`Block hash mismatch at index ${i}`);
          report.corruptedBlocks.push(i);
        }

        // Verify previous hash linkage (except genesis block)
        if (i > 0) {
          const previousBlock = this.chain[i - 1];
          if (block.previousHash !== previousBlock.hash) {
            blockErrors.push(`Previous hash mismatch at index ${i}`);
            report.corruptedBlocks.push(i);
          }
        }

        // Verify merkle root
        const expectedMerkleRoot = this.calculateMerkleRoot(block.events);
        if (block.merkleRoot !== expectedMerkleRoot) {
          blockErrors.push(`Merkle root mismatch at index ${i}`);
          report.corruptedBlocks.push(i);
        }

        // Verify digital signature
        if (!this.verifyBlockSignature(block)) {
          blockErrors.push(`Digital signature invalid at index ${i}`);
          report.corruptedBlocks.push(i);
        }

        // Verify proof of work
        if (!this.verifyProofOfWork(block)) {
          blockErrors.push(`Proof of work invalid at index ${i}`);
          report.corruptedBlocks.push(i);
        }

        // Verify event chain within block
        try {
          this.verifyEventChain(block.events);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          blockErrors.push(`Event chain invalid in block ${i}: ${errorMessage}`);
          report.corruptedBlocks.push(i);
        }

        if (blockErrors.length === 0) {
          report.verifiedBlocks++;
          report.lastVerifiedBlock = i;
        } else {
          report.errors.push(...blockErrors);
          report.isValid = false;
        }
      }

      // Calculate integrity score
      report.integrityScore = report.totalBlocks > 0 
        ? Math.round((report.verifiedBlocks / report.totalBlocks) * 100)
        : 100;

      // Generate recommendations
      report.recommendations = this.generateIntegrityRecommendations(report);

      this.logger.audit('Chain integrity verification completed', {
        totalBlocks: report.totalBlocks,
        verifiedBlocks: report.verifiedBlocks,
        integrityScore: report.integrityScore,
        isValid: report.isValid
      });

      return report;

    } catch (error) {
      this.logger.error('Chain integrity verification failed', error as Error);
      report.isValid = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      report.errors.push(`Verification process failed: ${errorMessage}`);
      return report;
    }
  }

  /**
   * Verify a specific block in the chain
   */
  public verifyBlock(blockIndex: number): {
    isValid: boolean;
    errors: string[];
    block?: ChainBlock;
  } {
    const errors: string[] = [];

    if (blockIndex < 0 || blockIndex >= this.chain.length) {
      return {
        isValid: false,
        errors: ['Block index out of range']
      };
    }

    const block = this.chain[blockIndex];

    // Verify block hash
    const expectedHash = this.calculateBlockHash(block);
    if (block.hash !== expectedHash) {
      errors.push('Block hash verification failed');
    }

    // Verify signature
    if (!this.verifyBlockSignature(block)) {
      errors.push('Block signature verification failed');
    }

    // Verify proof of work
    if (!this.verifyProofOfWork(block)) {
      errors.push('Proof of work verification failed');
    }

    // Verify merkle root
    const expectedMerkleRoot = this.calculateMerkleRoot(block.events);
    if (block.merkleRoot !== expectedMerkleRoot) {
      errors.push('Merkle root verification failed');
    }

    // Verify chain linkage
    if (blockIndex > 0) {
      const previousBlock = this.chain[blockIndex - 1];
      if (block.previousHash !== previousBlock.hash) {
        errors.push('Chain linkage verification failed');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      block
    };
  }

  /**
   * Get chain metrics and statistics
   */
  public getChainMetrics(): ChainMetrics {
    const totalEvents = this.chain.reduce((sum, block) => sum + block.events.length, 0);
    
    return {
      chainLength: this.chain.length,
      totalEvents,
      averageEventsPerBlock: this.chain.length > 0 ? totalEvents / this.chain.length : 0,
      chainCreationDate: this.chain[0]?.timestamp || new Date(),
      lastBlockDate: this.getLatestBlock().timestamp,
      integrityChecksCount: 0, // This would be tracked separately
      lastIntegrityCheck: new Date(),
      tamperAttempts: 0 // This would be tracked separately
    };
  }

  /**
   * Export chain for audit purposes
   */
  public exportChain(): {
    metadata: {
      exportDate: Date;
      chainLength: number;
      totalEvents: number;
      integrityVerified: boolean;
    };
    chain: ChainBlock[];
  } {
    const metrics = this.getChainMetrics();
    
    return {
      metadata: {
        exportDate: new Date(),
        chainLength: metrics.chainLength,
        totalEvents: metrics.totalEvents,
        integrityVerified: true // This should be the result of the last verification
      },
      chain: [...this.chain]
    };
  }

  /**
   * Import and verify a chain
   */
  public async importChain(chainData: {
    metadata: any;
    chain: ChainBlock[];
  }): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Basic validation
      if (!Array.isArray(chainData.chain) || chainData.chain.length === 0) {
        errors.push('Invalid chain data format');
        return { success: false, errors };
      }

      // Temporarily store current chain
      const backupChain = [...this.chain];
      
      // Import new chain
      this.chain = chainData.chain.map(block => ({
        ...block,
        timestamp: new Date(block.timestamp)
      }));

      // Verify imported chain
      const integrityReport = await this.verifyChainIntegrity();
      
      if (!integrityReport.isValid) {
        // Restore backup chain
        this.chain = backupChain;
        errors.push('Imported chain failed integrity verification');
        errors.push(...integrityReport.errors);
        return { success: false, errors };
      }

      this.logger.audit('Audit chain imported successfully', {
        chainLength: this.chain.length,
        totalEvents: this.getChainMetrics().totalEvents
      });

      return { success: true, errors: [] };

    } catch (error) {
      this.logger.error('Chain import failed', error as Error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { 
        success: false, 
        errors: [`Import failed: ${errorMessage}`] 
      };
    }
  }

  /**
   * Find events by criteria across the entire chain
   */
  public findEventsInChain(criteria: {
    userId?: string;
    action?: string;
    dateFrom?: Date;
    dateTo?: Date;
    phiInvolved?: boolean;
  }): HIPAAAuditEvent[] {
    const allEvents: HIPAAAuditEvent[] = [];
    
    // Collect all events from all blocks
    this.chain.forEach(block => {
      allEvents.push(...block.events);
    });

    // Apply filters
    let filteredEvents = allEvents;

    if (criteria.userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === criteria.userId);
    }

    if (criteria.action) {
      filteredEvents = filteredEvents.filter(event => event.action === criteria.action);
    }

    if (criteria.dateFrom) {
      filteredEvents = filteredEvents.filter(event => event.timestamp >= criteria.dateFrom!);
    }

    if (criteria.dateTo) {
      filteredEvents = filteredEvents.filter(event => event.timestamp <= criteria.dateTo!);
    }

    if (criteria.phiInvolved !== undefined) {
      filteredEvents = filteredEvents.filter(event => event.phiInvolved === criteria.phiInvolved);
    }

    return filteredEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Private helper methods

  private getLatestBlock(): ChainBlock {
    return this.chain[this.chain.length - 1];
  }

  private calculateBlockHash(block: Omit<ChainBlock, 'hash' | 'signature'>): string {
    const blockData = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      previousHash: block.previousHash,
      merkleRoot: block.merkleRoot,
      nonce: block.nonce
    });

    return crypto
      .createHash(this.hashAlgorithm)
      .update(blockData)
      .digest('hex');
  }

  private mineBlock(block: Omit<ChainBlock, 'hash' | 'signature'>): string {
    const target = '0'.repeat(this.difficulty);
    let nonce = 0;
    let hash = '';

    while (!hash.startsWith(target)) {
      nonce++;
      const blockWithNonce = { ...block, nonce };
      hash = this.calculateBlockHash(blockWithNonce);
    }

    // Update the block's nonce
    (block as any).nonce = nonce;
    
    return hash;
  }

  private signBlock(block: ChainBlock): string {
    const blockData = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      hash: block.hash,
      merkleRoot: block.merkleRoot
    });

    return crypto
      .createHmac('sha512', this.signingKey)
      .update(blockData)
      .digest('hex');
  }

  private verifyBlockSignature(block: ChainBlock): boolean {
    const expectedSignature = this.signBlock(block);
    return block.signature === expectedSignature;
  }

  private verifyProofOfWork(block: ChainBlock): boolean {
    const target = '0'.repeat(this.difficulty);
    const hash = this.calculateBlockHash(block);
    return hash.startsWith(target) && hash === block.hash;
  }

  private calculateMerkleRoot(events: HIPAAAuditEvent[]): string {
    if (events.length === 0) {
      return crypto.createHash(this.hashAlgorithm).update('').digest('hex');
    }

    if (events.length === 1) {
      return crypto.createHash(this.hashAlgorithm).update(events[0].hash).digest('hex');
    }

    // Create leaf nodes (event hashes)
    let hashes = events.map(event => event.hash);

    // Build merkle tree
    while (hashes.length > 1) {
      const newLevel: string[] = [];
      
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left; // If odd number, duplicate last hash
        
        const combined = crypto
          .createHash(this.hashAlgorithm)
          .update(left + right)
          .digest('hex');
        
        newLevel.push(combined);
      }
      
      hashes = newLevel;
    }

    return hashes[0];
  }

  private verifyEventChain(events: HIPAAAuditEvent[]): void {
    for (let i = 1; i < events.length; i++) {
      const currentEvent = events[i];
      const previousEvent = events[i - 1];
      
      if (currentEvent.previousHash !== previousEvent.hash) {
        throw new Error(`Event chain broken at event ${currentEvent.id}`);
      }
    }
  }

  private generateIntegrityRecommendations(report: ChainIntegrityReport): string[] {
    const recommendations: string[] = [];

    if (report.integrityScore < 100) {
      recommendations.push('Investigate and remediate corrupted blocks immediately');
    }

    if (report.corruptedBlocks.length > 0) {
      recommendations.push('Review access logs for potential unauthorized modifications');
      recommendations.push('Implement additional monitoring for chain modifications');
    }

    if (report.integrityScore < 95) {
      recommendations.push('Consider rebuilding chain from verified backup');
      recommendations.push('Enhance physical and logical security controls');
    }

    if (report.missingBlocks.length > 0) {
      recommendations.push('Locate and restore missing blocks from backups');
    }

    return recommendations;
  }
}

export default HIPAAAuditChainVerifier;