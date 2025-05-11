# AppNation Project [General Software Documentation Of The Project](https://pure-2.gitbook.io/appnation-weather-app)

This project is a microservice-based application consisting of an **API Gateway**, an **Authentication Service**, and a **Weather Service**.

## Table of Contents

* [Overview](#overview)
* [Services](#services)

  * [AppNation Gateway (`appnation-gw`)](#appnation-gateway-appnation-gw)
  * [AppNation Identity Service (`appnation-identity-service`)](#appnation-identity-service-appnation-identity-service)
  * [AppNation Weather Service (`appnation-weather-service`)](#appnation-weather-service-appnation-weather-service)
* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)

  * [Setup](#setup)
  * [Running the App](#running-the-app)
* [Environment Variables](#environment-variables)
* [API Endpoints](#api-endpoints)
* [Technologies Used](#technologies-used)

---

## Overview

This project is designed with a **microservice architecture** to provide a scalable and maintainable infrastructure for modern web applications. The main components include:

* An **API Gateway** responsible for request routing and security,
* An **Identity Service** for handling user authentication and authorization,
* A **Weather Service** to provide real-time weather data.

---

## Services

### AppNation Gateway (`appnation-gw`)

* **Purpose:**
  Routes requests to backend services and handles common gateway responsibilities such as authentication, rate limiting, and circuit breaking.
* **Technology:**
  Java, Spring Cloud Gateway.
* **Key Features:**

  * JWT-based authentication (via `AdminFilter`, `UserFilter`)
  * Redis-based rate limiting
  * Circuit breaker with Resilience4j
  * Service configuration available in the `application.yml` file

---

### AppNation Identity Service (`appnation-identity-service`)

* **Purpose:**
  Manages authentication and authorization for users and administrators.
* **Technology:**
  Node.js, NestJS, Prisma, PostgreSQL
* **Key Features:**

  * User/Admin registration and login
  * JWT (Access & Refresh Token) generation
  * Password hashing (with bcrypt)
  * Role-based access control
* **Note:**
  This service uses a `private.pem` file for JWT signing. The file is mounted into the Docker container from `./appnation-identity-service/private.pem` as defined in the root `docker-compose.yml`.

---

### AppNation Weather Service (`appnation-weather-service`)

* **Purpose:**
  Provides weather data based on location or coordinates and logs historical weather queries.
* **Technology:**
  Node.js, NestJS, OpenWeather API, Redis (for caching)
* **Key Features:**

  * Weather query by location name or coordinates
  * Integration with OpenWeather API
  * Caching responses in Redis
  * Fetching historical queries by user/admin

---

## Prerequisites

* [Docker](https://www.docker.com/get-started)
* [Docker Compose](https://docs.docker.com/compose/install/)
* Node.js (required only if you plan to develop services outside Docker)
* Java Development Kit (JDK) (required only if developing `appnation-gw` outside Docker)
* `pnpm` package manager (required for `appnation-identity-service`, as defined in its `package.json`)

---

## Getting Started

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd appNation
```

2. **Check and Customize Environment Variables (if needed):**
   The project includes `.env` files for each service (`./appnation-gw/.env`, `./appnation-identity-service/.env`, `./appnation-weather-service/.env`) which are referenced in the main `docker-compose.yml`.
   Review and update these files according to your local setup or deployment environment.

**Important Environment Variables to Review:**

* `POSTGRES_PASSWORD`: Password for the PostgreSQL database
* `REDIS_PASSWORD`: Password for the Redis server
* `JWT_PUBLIC_KEY`: Used by `appnation-gw` to verify JWT tokens
* `OPEN_WEATHER_API_KEY`: API key for accessing OpenWeather data
* `PORT` and other service-specific configurations (e.g. `APPNATION_IDENTITY_BASE_URL`) should also be correctly defined.

3. Place the `private.pem` file at `./appnation-identity-service/private.pem`.
   This file is used for signing JWT tokens in the identity service.

---

### Running the App

To start all services using Docker Compose, navigate to the root directory of the project and run:

```bash
docker-compose up --build -d
```
