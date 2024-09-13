# Test Task for SDA

This is my implementation of the test task provided by SDA, showcasing my skills in building a full-stack REST API with caching, logging, testing, and more.

### Technologies

The project leverages the following technologies:

- **TypeScript** – A typed superset of JavaScript that scales.
- **NestJS** – A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **TypeORM** – A powerful ORM framework for TypeScript and JavaScript (ES7, ES6) that supports PostgreSQL.
- **PostgreSQL** – A powerful, open-source object-relational database system.
- **Redis** – An in-memory data structure store, used as a distributed, in-memory key–value database, cache, and message broker.
- **Swagger** – An open-source tool for designing, building, documenting, and consuming RESTful web services.
- **Docker** – A platform to develop, ship, and run applications in isolated containers.
- **Jest** – A JavaScript testing framework designed to ensure the correctness of any JavaScript codebase.

### Features

- [x] **REST API**
  - [x] CRUD operations for **Tasks**
    - [x] Customizing the sorting for getting all **Tasks**
  - [x] CRUD operations for **Task Priority Status**
- [x] **Caching** – Efficient caching for task retrieval using Redis.
- [x] **Logger** – Logs requests, cache hits/misses, and errors.
- [x] **API Documentation** – Swagger integrated for easy API exploration.
- [x] **Unit Tests** – Comprehensive unit tests using Jest.
- [x] **End-to-End Tests** – E2E tests covering all major workflows.
- [x] **Database Seeder** – Seeder for pre-populating the database with initial data.

### How to run the API

Follow these steps to run the application:

**1. Create .env file**

Create a .env file in the project root and add the following configuration:

```
NODE_ENV="development"

# database configuration
DATABASE_HOST=postgres-db
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=test_task_for_sda

# redis configuration
REDIS_NAME=redisdb_for_sda_test_task
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_TTL=60000 # 60 seconds
```

**2. Build and Run the Docker Containers**
Use Docker Compose to build and run the app in a containerized environment:
```sh
docker-compose up --build
```

**3. Verify the Containers are Running**
Once Docker finishes building, check that all containers (PostgreSQL, Redis, NestJS) are up and running

```sh
docker ps
```

**4. Access the API and Documentation**
- **Base API URL**: http://localhost:3000/api
- **Swagger API Documentation**: You can explore the available API endpoints and try out requests through the integrated Swagger interface: http://localhost:3000/docs

## How to Test the API

The following commands will help you run the tests for the application:

**1. Unit Tests**

Run the unit tests to ensure individual components are functioning as expected:

```bash
npm run test
```

**2. End-to-End (E2E) Tests**

Run the end-to-end tests to simulate user workflows:

```bash
npm run test:e2e
```

**3. Test Coverage**

Generate a test coverage report to assess how much of your codebase is covered by tests:

```bash
npm run test:cov
```

### Seeding the Database

Before running the API, the database should be seeded with initial data. This is automatically handled when you run the app using Docker. However, if you need to seed manually, run the following command inside your Docker container:

```bash
npm run seed
```

### Closing Remarks

Thank you for the opportunity to work on this task. It was a great experience building this application with real-world features like caching, logging, and testing.

> P.S. Looking forward to your review and feedback! ;)
