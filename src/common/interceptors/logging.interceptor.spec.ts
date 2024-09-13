import { LoggingInterceptor } from "./logging.interceptor"
import { CallHandler, ExecutionContext } from "@nestjs/common"
import { Logger } from "@nestjs/common"
import { of } from "rxjs"
import { tap } from "rxjs/operators"

describe("LoggingInterceptor", () => {
	let interceptor: LoggingInterceptor
	let loggerLogSpy: jest.SpyInstance
	let mockExecutionContext: ExecutionContext
	let mockCallHandler: CallHandler

	beforeEach(() => {
		interceptor = new LoggingInterceptor()

		// Spy on the logger's log method
		loggerLogSpy = jest.spyOn(Logger.prototype, "log").mockImplementation()

		// Mock the request object in ExecutionContext
		mockExecutionContext = {
			switchToHttp: jest.fn().mockReturnValue({
				getRequest: jest.fn().mockReturnValue({
					method: "GET",
					url: "/test-url"
				})
			})
		} as unknown as ExecutionContext

		// Mock the CallHandler handle method
		mockCallHandler = {
			handle: jest.fn(() => of("test response")) // Simulate an observable response
		}
	})

	afterEach(() => {
		jest.clearAllMocks() // Clear mocks after each test
	})

	it("should be defined", () => {
		expect(interceptor).toBeDefined()
	})

	it("should log incoming request and request time", done => {
		const nowSpy = jest
			.spyOn(Date, "now")
			.mockReturnValueOnce(1000)
			.mockReturnValueOnce(2000)

		interceptor
			.intercept(mockExecutionContext, mockCallHandler)
			.pipe(
				tap(() => {
					expect(loggerLogSpy).toHaveBeenCalledWith(
						"Incoming Request: GET /test-url"
					)
					expect(loggerLogSpy).toHaveBeenCalledWith(
						"Request GET /test-url took 1000ms"
					)
					expect(mockCallHandler.handle).toHaveBeenCalled() // Ensure the next handle is called
					done() // End the test when observable completes
				})
			)
			.subscribe()

		nowSpy.mockRestore() // Restore Date.now after test
	})
})
