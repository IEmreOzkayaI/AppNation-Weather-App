import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ENV } from '../env/env.module';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(@Inject(ENV.KEY) private readonly envService: ConfigType<typeof ENV>, private readonly logger: Logger) {
    this.client = new Redis({
      host: this.envService.REDIS_HOST,
      port: this.envService.REDIS_PORT,
      // username: this.envService.REDIS_USERNAME,
      password: this.envService.REDIS_PASSWORD,
      db: this.envService.REDIS_DB_INDEX
    });

    this.client.on('connect', () => this.logger.log('Redis connection successfully started'));
    this.client.on('error', (err) => this.logger.error('Redis error', err));
  }

  // --- Basic Key-Value Operations ---

  async set(key: string, value: string, ttlInSeconds?: number): Promise<'OK'> {
    if (ttlInSeconds) {
      return this.client.set(key, value, 'EX', ttlInSeconds);
    }
    return this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  // --- Custom HSET-based Object Caching ---

  async setHSet(key: string, val: object, ttlInSeconds: number = null): Promise<void> {
    if (typeof val !== 'object' || val === null) {
      throw new Error('Value must be a non-null object');
    }

    const fieldValuePairs: string[] = [];

    for (const [field, value] of Object.entries(val)) {
      fieldValuePairs.push(field, JSON.stringify(value));
    }

    await this.client.hset(key, ...fieldValuePairs);

    if (ttlInSeconds !== null) {
      await this.client.expire(key, ttlInSeconds);
    }
  }

  async getHSet(key: string): Promise<Record<string, any> | null> {
    const entries = await this.client.hgetall(key);

    if (!entries || Object.keys(entries).length === 0) return null;

    const result: Record<string, any> = {};

    for (const [field, value] of Object.entries(entries)) {
      try {
        result[field] = JSON.parse(value);
      } catch {
        result[field] = value; // fallback: raw string
      }
    }

    return result;
  }

  // Optional alias
  async delete(key: string): Promise<void> {
    await this.del(key);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
