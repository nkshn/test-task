import { PipeTransform, Injectable } from "@nestjs/common"
import { SortOrder } from "../enums/sort-order.enum"

@Injectable()
export class SortOrderPipe implements PipeTransform {
	constructor(private readonly defaultValue: SortOrder) {}

	// if sorting value is not correct or is not specified we return passed default value
	transform(value: any): SortOrder {
		return value === undefined || !Object.values(SortOrder).includes(value)
			? this.defaultValue
			: value
	}
}
