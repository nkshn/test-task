import * as dotenv from "dotenv"
import { DataSource } from "typeorm"
import ClearDatabase from "./seeds/clear-database.seed"
import CreateTaskPriorityStatuses from "./seeds/task-priority-status.seed"
import CreateTasks from "./seeds/task.seed"
import { TaskPriorityStatus } from "./task-priority-status/task-priority-status.entity"
import { Task } from "./task/task.entity"

// Load environment variables based on the NODE_ENV value
if (process.env.NODE_ENV === "test") {
	dotenv.config({ path: ".env.test.local" })
} else if (process.env.NODE_ENV === "production") {
	dotenv.config({ path: ".env.production.local" })
} else {
	dotenv.config() // Default to .env for development
}

async function runSeed() {
	const dataSource = new DataSource({
		type: "postgres",
		host: process.env.DATABASE_HOST,
		port: parseInt(process.env.DATABASE_PORT, 10),
		username: process.env.DATABASE_USERNAME,
		password: String(process.env.DATABASE_PASSWORD),
		database: process.env.DATABASE_NAME,
		entities: [Task, TaskPriorityStatus],
		synchronize: process.env.NODE_ENV !== "production" // only for local environment
	})

	// Initialize the data source
	await dataSource.initialize()

	console.log("Database connection initialized") // eslint-disable-line no-console

	try {
		// Run the seeders
		await new ClearDatabase().run(null, dataSource)
		await new CreateTaskPriorityStatuses().run(null, dataSource)
		await new CreateTasks().run(null, dataSource)

		console.log("Seeding complete!\n") // eslint-disable-line no-console
	} catch (error) {
		console.error("Error during seeding:", error) // eslint-disable-line no-console
	} finally {
		// Destroy the connection once seeding is done
		await dataSource.destroy()
	}
}

// Execute the seed function
runSeed()
	.then(() => process.exit(0))
	.catch(error => {
		console.error("Seeding failed:", error) // eslint-disable-line no-console
		process.exit(1)
	})
