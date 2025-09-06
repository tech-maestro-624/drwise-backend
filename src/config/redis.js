const redis = require('redis');
require('dotenv').config();

class RedisConfig {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 60000,
          lazyConnect: true,
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              console.error('Redis connection refused');
              return new Error('Redis connection refused');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              console.error('Redis retry time exhausted');
              return new Error('Retry time exhausted');
            }
            if (options.attempt > 10) {
              console.error('Redis retry attempts exhausted');
              return undefined;
            }
            return Math.min(options.attempt * 100, 3000);
          }
        }
      });

      // Event listeners
      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis client connected');
        this.isConnected = true;
        this.retryCount = 0;
      });

      this.client.on('disconnect', () => {
        console.log('Redis client disconnected');
        this.isConnected = false;
      });

      this.client.on('ready', () => {
        console.log('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        console.log('Redis client connection ended');
        this.isConnected = false;
      });

      await this.client.connect();

    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.disconnect();
        console.log('Redis client disconnected gracefully');
      }
    } catch (error) {
      console.error('Error disconnecting Redis:', error);
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }
    return this.client;
  }

  isClientConnected() {
    return this.isConnected;
  }

  async ping() {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping failed:', error);
      return false;
    }
  }

  // Graceful shutdown handler
  async gracefulShutdown() {
    console.log('Initiating graceful shutdown of Redis connection...');
    await this.disconnect();
    process.exit(0);
  }
}

// Create singleton instance
const redisConfig = new RedisConfig();

// Handle process termination
process.on('SIGINT', () => redisConfig.gracefulShutdown());
process.on('SIGTERM', () => redisConfig.gracefulShutdown());

module.exports = redisConfig;
