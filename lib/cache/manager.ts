import { CacheEntry, CacheOptions } from '@/types';

/**
 * Cache Manager for Figma to React Converter
 * Handles caching of conversion results, API responses, and build artifacts
 */
export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private options: CacheOptions;
  private cacheDirectory: string;
  private maxMemorySize: number;
  private currentSize: number = 0;

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      ttl: options.ttl || 24 * 60 * 60 * 1000, // 24 hours default
      maxSize: options.maxSize || 100, // 100MB default
      directory: options.directory || './.figma-cache'
    };
    this.cacheDirectory = this.options.directory;
    this.maxMemorySize = this.options.maxSize * 1024 * 1024; // Convert MB to bytes
    
    this.initializeCache();
  }

  /**
   * Get cached data by key
   */
  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      // Try to load from disk cache
      const diskEntry = await this.loadFromDisk(key);
      if (diskEntry && this.isValidEntry(diskEntry)) {
        this.cache.set(key, diskEntry);
        return diskEntry.data;
      }
      return null;
    }

    if (!this.isValidEntry(entry)) {
      this.cache.delete(key);
      await this.removeFromDisk(key);
      return null;
    }

    // Update access time
    entry.timestamp = Date.now();
    
    return entry.data;
  }

  /**
   * Set cached data with key
   */
  async set<T = any>(key: string, data: T, hash?: string): Promise<void> {
    const serializedData = JSON.stringify(data);
    const size = Buffer.byteLength(serializedData, 'utf8');
    
    // Check if we need to evict entries to make room
    if (this.currentSize + size > this.maxMemorySize) {
      await this.evictLeastRecentlyUsed(size);
    }

    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      hash: hash || this.generateHash(serializedData),
      ttl: this.options.ttl
    };

    this.cache.set(key, entry);
    this.currentSize += size;
    
    // Persist to disk
    await this.saveToDisk(entry);
    
    console.log(`📦 Cached entry: ${key} (${this.formatSize(size)})`);
  }

  /**
   * Check if cache entry exists and is valid
   */
  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  /**
   * Remove entry from cache
   */
  async delete(key: string): Promise<boolean> {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    await this.removeFromDisk(key);
    
    if (existed) {
      console.log(`🗑️ Removed cache entry: ${key}`);
    }
    
    return existed;
  }

  /**
   * Clear all cached entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.currentSize = 0;
    
    try {
      const fs = await import('fs/promises');
      await fs.rm(this.cacheDirectory, { recursive: true, force: true });
      await fs.mkdir(this.cacheDirectory, { recursive: true });
    } catch (error) {
      console.warn('Failed to clear disk cache:', error);
    }
    
    console.log('🧹 Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    entries: number;
    memorySize: string;
    hitRate: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);
    
    return {
      entries: this.cache.size,
      memorySize: this.formatSize(this.currentSize),
      hitRate: this.calculateHitRate(),
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
    };
  }

  /**
   * Cache specific operations for Figma data
   */
  async cacheFigmaFile(fileId: string, data: any): Promise<void> {
    const key = `figma:file:${fileId}`;
    await this.set(key, data);
  }

  async getCachedFigmaFile(fileId: string): Promise<any | null> {
    const key = `figma:file:${fileId}`;
    return await this.get(key);
  }

  async cacheConversionResult(nodeId: string, options: any, result: any): Promise<void> {
    const optionsHash = this.generateHash(JSON.stringify(options));
    const key = `conversion:${nodeId}:${optionsHash}`;
    await this.set(key, result);
  }

  async getCachedConversionResult(nodeId: string, options: any): Promise<any | null> {
    const optionsHash = this.generateHash(JSON.stringify(options));
    const key = `conversion:${nodeId}:${optionsHash}`;
    return await this.get(key);
  }

  async cacheDesignTokens(nodeId: string, tokens: any): Promise<void> {
    const key = `tokens:${nodeId}`;
    await this.set(key, tokens);
  }

  async getCachedDesignTokens(nodeId: string): Promise<any | null> {
    const key = `tokens:${nodeId}`;
    return await this.get(key);
  }

  /**
   * Invalidate cache entries based on conditions
   */
  async invalidate(pattern?: string | RegExp): Promise<number> {
    let invalidated = 0;
    const keysToDelete: string[] = [];

    for (const [key] of this.cache) {
      if (!pattern || this.matchesPattern(key, pattern)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key);
      invalidated++;
    }

    console.log(`🔄 Invalidated ${invalidated} cache entries`);
    return invalidated;
  }

  /**
   * Preload frequently used cache entries
   */
  async preload(keys: string[]): Promise<void> {
    console.log(`🔄 Preloading ${keys.length} cache entries...`);
    
    const loadPromises = keys.map(async (key) => {
      try {
        await this.get(key);
      } catch (error) {
        console.warn(`Failed to preload cache entry: ${key}`, error);
      }
    });

    await Promise.all(loadPromises);
    console.log('✅ Cache preloading completed');
  }

  /**
   * Optimize cache by removing expired entries
   */
  async optimize(): Promise<{ removed: number; size: string }> {
    const initialSize = this.currentSize;
    let removed = 0;

    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache) {
      if (!this.isValidEntry(entry)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      await this.delete(key);
      removed++;
    }

    const sizeReduced = this.formatSize(initialSize - this.currentSize);
    
    console.log(`🔧 Cache optimized: removed ${removed} entries, freed ${sizeReduced}`);
    
    return {
      removed,
      size: sizeReduced
    };
  }

  private async initializeCache(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      await fs.mkdir(this.cacheDirectory, { recursive: true });
      
      // Load existing cache entries from disk
      const files = await fs.readdir(this.cacheDirectory);
      const cacheFiles = files.filter(file => file.endsWith('.cache.json'));
      
      console.log(`🔄 Loading ${cacheFiles.length} cache entries from disk...`);
      
      for (const file of cacheFiles) {
        try {
          const entry = await this.loadFromDisk(file.replace('.cache.json', ''));
          if (entry && this.isValidEntry(entry)) {
            this.cache.set(entry.key, entry);
            this.currentSize += Buffer.byteLength(JSON.stringify(entry.data), 'utf8');
          }
        } catch (error) {
          console.warn(`Failed to load cache file: ${file}`, error);
        }
      }
      
      console.log(`✅ Loaded ${this.cache.size} cache entries`);
    } catch (error) {
      console.warn('Failed to initialize cache:', error);
    }
  }

  private isValidEntry(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  private async evictLeastRecentlyUsed(requiredSize: number): Promise<void> {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    let freedSize = 0;
    const evicted: string[] = [];

    for (const [key, entry] of entries) {
      if (freedSize >= requiredSize) break;
      
      const entrySize = Buffer.byteLength(JSON.stringify(entry.data), 'utf8');
      this.cache.delete(key);
      await this.removeFromDisk(key);
      
      freedSize += entrySize;
      this.currentSize -= entrySize;
      evicted.push(key);
    }

    if (evicted.length > 0) {
      console.log(`🗑️ Evicted ${evicted.length} LRU entries (${this.formatSize(freedSize)})`);
    }
  }

  private async saveToDisk(entry: CacheEntry): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const filePath = path.join(this.cacheDirectory, `${this.sanitizeKey(entry.key)}.cache.json`);
      await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
    } catch (error) {
      console.warn(`Failed to save cache entry to disk: ${entry.key}`, error);
    }
  }

  private async loadFromDisk(key: string): Promise<CacheEntry | null> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const filePath = path.join(this.cacheDirectory, `${this.sanitizeKey(key)}.cache.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  private async removeFromDisk(key: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const filePath = path.join(this.cacheDirectory, `${this.sanitizeKey(key)}.cache.json`);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore errors when removing non-existent files
    }
  }

  private sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9\-_]/g, '_');
  }

  private generateHash(data: string): string {
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private matchesPattern(key: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return key.includes(pattern);
    }
    return pattern.test(key);
  }

  private calculateHitRate(): number {
    // This would be tracked in a real implementation
    // For now, return a placeholder
    return 0.85;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();