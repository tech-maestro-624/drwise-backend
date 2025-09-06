const redisConfig = require('../config/redis');

class CacheService {
  constructor() {
    this.client = null;
    this.defaultTTL = 3600; // 1 hour default TTL
    this.isInitialized = false;
  }

  async initialize() {
    try {
      if (!this.isInitialized) {
        if (!redisConfig.isClientConnected()) {
          await redisConfig.connect();
        }
        this.client = redisConfig.getClient();
        this.isInitialized = true;
        console.log('Cache service initialized');
      }
    } catch (error) {
      console.error('Failed to initialize cache service:', error);
      this.isInitialized = false;
    }
  }
  
  async ensureInitialized() {
      if (!this.isInitialized) {
          await this.initialize();
      }
      if (!this.client || !redisConfig.isClientConnected()) {
          return false;
      }
      return true;
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!(await this.ensureInitialized())) return false;

      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      if (!(await this.ensureInitialized())) return null;

      const value = await this.client.get(key);
      if (!value) return null;

      return JSON.parse(value);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async delete(key) {
    try {
      if (!(await this.ensureInitialized())) return false;
      
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }
  
  async deleteByPattern(pattern) {
    try {
      if (!(await this.ensureInitialized())) return 0;
      
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache delete by pattern error:', error);
      return 0;
    }
  }
  
  async getOrSet(key, fallbackFn, ttl = this.defaultTTL) {
    try {
      const cachedValue = await this.get(key);
      if (cachedValue !== null) {
        return cachedValue;
      }

      const freshValue = await fallbackFn();
      
      if(freshValue === null || freshValue === undefined) {
        return freshValue;
      }

      await this.set(key, freshValue, ttl);

      return freshValue;
    } catch (error) {
      console.error('Cache getOrSet error:', error);
      return await fallbackFn();
    }
  }
}

const cacheService = new CacheService();

module.exports = cacheService;
