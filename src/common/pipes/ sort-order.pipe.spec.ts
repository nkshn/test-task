import { SortOrderPipe } from "./sort-order.pipe"
import { SortOrder } from "../enums/sort-order.enum"

describe("SortOrderPipe", () => {
	let pipe: SortOrderPipe

	beforeEach(() => {
		pipe = new SortOrderPipe(SortOrder.ASC)
	})

	it("should be defined", () => {
		expect(pipe).toBeDefined()
	})

	it("should return the correct value when valid SortOrder is provided", () => {
		expect(pipe.transform(SortOrder.ASC)).toEqual(SortOrder.ASC)
		expect(pipe.transform(SortOrder.DESC)).toEqual(SortOrder.DESC)
	})

	it("should return default value when undefined is provided", () => {
		expect(pipe.transform(undefined)).toEqual(SortOrder.ASC) // Default is ASC
	})

	it("should return default value when invalid value is provided", () => {
		expect(pipe.transform("INVALID")).toEqual(SortOrder.ASC) // Default is ASC
	})
})
