// File: src/common/filters/all-exceptions.filter.spec.ts

import { AllExceptionsFilter } from "./all-exceptions.filter"
import { ArgumentsHost, HttpException, Logger } from "@nestjs/common"
import { HttpStatus } from "@nestjs/common"

describe("AllExceptionsFilter", () => {
	let filter: AllExceptionsFilter
	let mockArgumentsHost: ArgumentsHost
	let mockResponse: any
	let loggerErrorSpy: jest.SpyInstance

	beforeEach(() => {
		filter = new AllExceptionsFilter()

		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		}

		// Mocking the host object
		mockArgumentsHost = {
			switchToHttp: jest.fn().mockReturnValue({
				getResponse: () => mockResponse
			})
		} as unknown as ArgumentsHost

		loggerErrorSpy = jest.spyOn(Logger.prototype, "error").mockImplementation()
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it("should be defined", () => {
		expect(filter).toBeDefined()
	})

	it("should log the exception and return the correct response for HttpException", () => {
		const exception = new HttpException(
			"Test exception",
			HttpStatus.BAD_REQUEST
		)

		filter.catch(exception, mockArgumentsHost)

		// Check logger error call
		expect(loggerErrorSpy).toHaveBeenCalledWith(
			`Error: 400 - Test exception`,
			exception.stack
		)

		// Check response status and body
		expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
		expect(mockResponse.json).toHaveBeenCalledWith({
			statusCode: HttpStatus.BAD_REQUEST,
			message: "Test exception"
		})
	})

	it("should handle non-HttpException and default to status 500", () => {
		const exception = new Error("Unknown error")

		filter.catch(exception as HttpException, mockArgumentsHost)

		// Check logger error call
		expect(loggerErrorSpy).toHaveBeenCalledWith(
			`Error: 500 - Unknown error`,
			exception.stack
		)

		// Check response status and body
		expect(mockResponse.status).toHaveBeenCalledWith(500)
		expect(mockResponse.json).toHaveBeenCalledWith({
			statusCode: 500,
			message: "Unknown error"
		})
	})
})
