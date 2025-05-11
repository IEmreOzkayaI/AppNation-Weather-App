# AppNation Weather Service (`appnation-weather-service`)

This project is the Weather Service within the AppNation microservice architecture, responsible for providing users and administrators with location or coordinate-based weather information and recording historical weather queries.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technologies Used](#technologies-used)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
- [External Services](#external-services)
  - [OpenWeather API](#openweather-api)
  - [Redis](#redis)
- [Database](#database)
- [Prerequisites (for Standalone Development)](#prerequisites-for-standalone-development)
- [Getting Started](#getting-started)
  - [Setup (Standalone Development)](#setup-standalone-development)
  - [Running the Service](#running-the-service)
    - [With Docker Compose (Recommended)](#with-docker-compose-recommended)
    - [Standalone](#standalone)
- [API Endpoints (Internal to Service)](#api-endpoints-internal-to-service)
- [Package Manager](#package-manager)

## Overview

`appnation-weather-service` retrieves current weather data using an external weather provider, the OpenWeather API. The retrieved data is cached in Redis to improve performance and avoid exceeding API call limits. Additionally, past queries made by users and administrators are stored in a PostgreSQL database.

## Key Features

-   **Location-Based Weather:** Query weather by city name or latitude/longitude.
-   **OpenWeather API Integration:** Uses OpenWeather API for reliable weather data. <mcreference link="https://api.openweathermap.org" index="0">0</mcreference>
-   **Redis Caching:** Results of frequent queries are cached in Redis to improve response times and conserve API limits (<mcsymbol name="RedisService" filename="redis.service.ts" path="appnation-weather-service/src/modules/shared/redis/redis.service.ts" startline="8" type="class"></mcsymbol>).
-   **Historical Query Logging:** Weather queries made by users and administrators are saved to the database.
-   **User and Admin-Based History Querying:** Saved weather history can be queried on a per-user and per-admin basis (<mcsymbol name="WeatherService" filename="weather.service.ts" path="appnation-weather-service/src/modules/features/weather/v1/weather.service.ts" startline="9" type="class"></mcsymbol>).

## Technologies Used

-   Node.js
-   NestJS (TypeScript-based Node.js framework)
-   TypeScript
-   OpenWeather API (External weather data provider) <mcreference link="https://api.openweathermap.org" index="0">0</mcreference>
-   Redis (For caching)
-   PostgreSQL (For historical query logs)
-   Prisma (ORM - if used for database operations)
-   `pnpm` (Package manager - could also be `npm` or `yarn` depending on project setup)

## Configuration

### Environment Variables

The service requires certain environment variables to run. These variables are defined in the <mcfile name=".env" path="appnation-weather-service/.env"></mcfile> file in the root directory of this service. The main project's <mcfile name="docker-compose.yml" path="docker-compose.yml"></mcfile> file uses this `.env` file.

The environment variables currently defined in your project are (from <mcfile name=".env" path="/Users/25200282/Desktop/appNation/appnation-weather-service/.env"></mcfile>):

-   `PORT`: The port on which the service will run (e.g., `3002`).
-   `DATABASE_URL`: Connection string for the PostgreSQL database (e.g., `"postgresql://appnation-db_owner:postgres@postgres:5432/appnation-db"`).
-   `OPEN_WEATHER_API_KEY`: The API key required for the OpenWeather API.
-   `OPEN_WEATHER_BASE_URL`: The base URL for the OpenWeather API (e.g., `https://api.openweathermap.org`).
-   `REDIS_HOST`: The address of the Redis server (e.g., `redis-server`).
-   `REDIS_PORT`: The port of the Redis server (e.g., `6379`).
-   `REDIS_PASSWORD`: The password for the Redis server.
-   `REDIS_DB_INDEX`: The Redis database index to be used (e.g., `1`).

**Note:** Additional environment variables (e.g., `NODE_ENV`) might be required for full functionality.

## External Services

### OpenWeather API

This service uses the <mcurl name="OpenWeather API" url="https://api.openweathermap.org"></mcurl> to fetch weather data. <mcreference link="https://api.openweathermap.org" index="0">0</mcreference> A valid `OPEN_WEATHER_API_KEY` is necessary for the service to function correctly. <mcreference link="https://api.openweathermap.org" index="0">0</mcreference> The OpenWeather API offers a free plan with a certain daily call limit. <mcreference link="https://api.openweathermap.org" index="0">0</mcreference>

### Redis

Frequently accessed weather data is cached in Redis to reduce API calls and improve performance. It's important that the `REDIS_HOST`, `REDIS_PORT`, and, if necessary, `REDIS_PASSWORD` environment variables are configured correctly.

## Database

The service uses a PostgreSQL database to store historical weather queries made by users and administrators. If Prisma ORM is used, the database schema is typically defined in a `prisma/schema.prisma` file, and migrations are managed with the Prisma CLI.

## Prerequisites (for Standalone Development)

-   Node.js (LTS version recommended)
-   `pnpm` (or the package manager used by the project: `npm`, `yarn`)
-   A running PostgreSQL instance
-   A running Redis instance
-   A valid OpenWeather API key

## Getting Started

### Setup (Standalone Development)

1.  Install project dependencies (according to your project's package manager):
    ```bash
    pnpm install
    # or npm install / yarn install
    ```
2.  Create/check the <mcfile name=".env" path="appnation-weather-service/.env"></mcfile> file and set all the environment variables listed above correctly.
3.  If Prisma is used, run database migrations:
    ```bash
    pnpm prisma migrate deploy # Or 'pnpm prisma migrate dev' for development
    ```

### Running the Service

#### With Docker Compose (Recommended)

The Weather Service can be easily started along with the entire AppNation project using Docker Compose. In the project's root directory (<mcfolder name="appNation" path="/Users/25200282/Desktop/appNation"></mcfolder>), run the following command:

```bash
docker-compose up --build -d appnation-weather-service
```

Or to start all services:

```bash
docker-compose up --build -d
```

#### Standalone

To run the Weather Service standalone (outside of Docker):

1.  Ensure you have completed the necessary setup steps.
2.  Start the service (according to your project's `package.json` scripts):
    ```bash
    pnpm run start:dev
    # or npm run start:dev / yarn start:dev
    ```
    Or for a production build:
    ```bash
    pnpm run build
    pnpm run start:prod
    # or npm run build; npm run start:prod / yarn build; yarn start:prod
    ```

## API Endpoints (Internal to Service)

In addition to the paths accessed via the API Gateway, the basic endpoints defined within the service itself are typically as follows (based on NestJS controllers):

-   **User Weather Queries:**
    -   `GET /weather/city/:cityName`
    -   `GET /weather/coordinates/:lat/:lon`
    -   `GET /weather/history` (User's own history)
-   **Admin Weather Queries (Authorization Required):**
    -   `GET /admin/weather/history/all` (History of all users)
    -   `GET /admin/weather/history/user/:userId` (History of a specific user)

*Note: These paths are the paths that reach the service after the `StripPrefix` filter in the API Gateway has been applied.*

## Package Manager

This service uses `pnpm` (or `npm` or `yarn`, depending on your project's configuration) for package management. Use the appropriate package manager commands.
        
