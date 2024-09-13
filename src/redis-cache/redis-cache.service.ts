import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { Cache } from "cache-manager"

@Injectable()
export class RedisCacheService {
	private readonly logger = new Logger(RedisCacheService.name)

	constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

	// Get value from cache
	async get<T>(key: string): Promise<T | undefined> {
		const value = await this.cacheManager.get<T>(key)

		if (value) {
			this.logger.log(`Cache getted key: ${key}`)
		} else {
			this.logger.log(`Cache missing key: ${key}`)
		}

		return value
	}

	// Set value in cache with optional TTL (time to live)
	async set(key: string, value: any, ttl: number): Promise<void> {
		this.logger.log(
			`Setting cache for key: ${key} with TTL: ${ttl} milliseconds`
		)
		await this.cacheManager.set(key, value, ttl)
	}

	// Delete a cache key
	async del(key: string): Promise<void> {
		this.logger.log(`Deleting cache for key: ${key}`)
		await this.cacheManager.del(key)
	}

	// Reset the entire cache
	async reset(): Promise<void> {
		this.logger.log("Resetting all cache")
		await this.cacheManager.reset()
	}
}
