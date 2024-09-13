import { Test, TestingModule } from "@nestjs/testing"
import { RedisCacheService } from "./redis-cache.service"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Logger } from "@nestjs/common"

describe("RedisCacheService", () => {
	let service: RedisCacheService
	let loggerLogSpy: jest.SpyInstance
	let loggerWarnSpy: jest.SpyInstance

	const mockCacheManager = {
		get: jest.fn(),
		set: jest.fn(),
		del: jest.fn(),
		reset: jest.fn(),
		store: {
			keys: jest.fn()
		}
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RedisCacheService,
				{
					provide: CACHE_MANAGER,
					useValue: mockCacheManager
				}
			]
		}).compile()

		service = module.get<RedisCacheService>(RedisCacheService)

		loggerLogSpy = jest.spyOn(Logger.prototype, "log").mockImplementation()
		loggerWarnSpy = jest.spyOn(Logger.prototype, "warn").mockImplementation()
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it("should be defined", () => {
		expect(service).toBeDefined()
	})

	describe("get", () => {
		it("should return value from cache and log when key is found", async () => {
			const cachedValue = "testValue"
			mockCacheManager.get.mockResolvedValue(cachedValue)

			const result = await service.get("testKey")
			expect(result).toBe(cachedValue)
			expect(mockCacheManager.get).toHaveBeenCalledWith("testKey")
			expect(loggerLogSpy).toHaveBeenCalledWith("Cache getted key: testKey")
		})

		it("should log when cache key is not found", async () => {
			mockCacheManager.get.mockResolvedValue(undefined)

			const result = await service.get("missingKey")
			expect(result).toBeUndefined()
			expect(mockCacheManager.get).toHaveBeenCalledWith("missingKey")
			expect(loggerLogSpy).toHaveBeenCalledWith("Cache missing key: missingKey")
		})
	})

	describe("set", () => {
		it("should set a value in the cache and log", async () => {
			await service.set("testKey", "testValue", 1000)
			expect(mockCacheManager.set).toHaveBeenCalledWith(
				"testKey",
				"testValue",
				1000
			)
			expect(loggerLogSpy).toHaveBeenCalledWith(
				"Setting cache for key: testKey with TTL: 1000 milliseconds"
			)
		})
	})

	describe("del", () => {
		it("should delete a cache key and log", async () => {
			await service.del("testKey")
			expect(mockCacheManager.del).toHaveBeenCalledWith("testKey")
			expect(loggerLogSpy).toHaveBeenCalledWith(
				"Deleting cache for key: testKey"
			)
		})
	})

	describe("getKeysByPattern", () => {
		it("should get keys by pattern and log", async () => {
			mockCacheManager.store.keys.mockResolvedValue(["key1", "key2"])
			const result = await service.getKeysByPattern("test*")

			expect(result).toEqual(["key1", "key2"])
			expect(mockCacheManager.store.keys).toHaveBeenCalledWith("test*")
			expect(loggerLogSpy).toHaveBeenCalledWith(
				"Get from cache all keys by this patter: test*"
			)
		})
	})

	describe("delKeysByPattern", () => {
		it("should delete all keys matching the pattern and log", async () => {
			mockCacheManager.store.keys.mockResolvedValue(["key1", "key2"])
			mockCacheManager.del.mockResolvedValue(undefined)

			await service.delKeysByPattern("test*")

			expect(mockCacheManager.store.keys).toHaveBeenCalledWith("test*")
			expect(mockCacheManager.del).toHaveBeenCalledWith("key1")
			expect(mockCacheManager.del).toHaveBeenCalledWith("key2")
			expect(loggerLogSpy).toHaveBeenCalledWith(
				"Deleting keys with pattern: test*"
			)
		})

		it("should log a warning if no keys are found for the pattern", async () => {
			mockCacheManager.store.keys.mockResolvedValue([])

			await service.delKeysByPattern("test*")
			expect(loggerWarnSpy).toHaveBeenCalledWith(
				"No keys found for pattern: test*"
			)
		})
	})

	describe("reset", () => {
		it("should reset the cache and log", async () => {
			await service.reset()
			expect(mockCacheManager.reset).toHaveBeenCalled()
			expect(loggerLogSpy).toHaveBeenCalledWith("Resetting all cache")
		})
	})
})
