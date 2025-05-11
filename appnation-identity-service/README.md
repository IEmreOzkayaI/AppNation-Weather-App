# AppNation Identity Service (`appnation-identity-service`)

This project is the Identity Service responsible for managing user and admin authentication and authorization within the AppNation microservice architecture.

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Technologies Used](#technologies-used)
* [Configuration](#configuration)

  * [Environment Variables](#environment-variables)
  * [Private Key](#private-key)
* [Database](#database)

  * [Schema Management (Prisma)](#schema-management-prisma)
* [Prerequisites (For Standalone Development)](#prerequisites-for-standalone-development)
* [Getting Started](#getting-started)

  * [Setup (Standalone Development)](#setup-standalone-development)
  * [Running](#running)

    * [Using Docker Compose (Recommended)](#using-docker-compose-recommended)
    * [Running Standalone](#running-standalone)
* [API Endpoints (Internal Service)](#api-endpoints-internal-service)
* [Package Manager](#package-manager)

## Overview

`appnation-identity-service` enables users and administrators to securely sign in, register, and access resources based on their roles. It uses a **JWT (JSON Web Token)** based authentication mechanism.

## Key Features

* **User & Admin Authentication:** Separate signup and signin processes for each role.
* **JWT Generation:** Produces Access and Refresh Tokens upon successful login.
* **Password Management:** Uses `bcrypt` for securely hashing passwords.
* **Role-Based Access Control (RBAC):** Differentiated permissions for users and admins.
* **Database Integration:** Stores user and admin data in a PostgreSQL database.
* **Prisma ORM:** Used for database operations and schema management.


## Technologies Used

* Node.js
* NestJS (TypeScript-based Node.js framework)
* TypeScript
* Prisma (ORM and DB toolkit)
* PostgreSQL (Database)
* JWT (JSON Web Tokens)
* `bcrypt` (Password hashing)
* `pnpm` (Package manager)


## Configuration

### Environment Variables

The service requires certain environment variables to function. These are defined in the `.env` file located in the root directory of the service (`./appnation-identity-service/.env`).
The root `docker-compose.yml` file references this `.env` file.

**Current important environment variables include:**

* `PORT`: Port on which the service runs (e.g., `3000`)
* `DATABASE_URL`: PostgreSQL connection string (e.g., `"postgresql://appnation-db_owner:postgres@postgres:5432/appnation-db"`)
* `JWT_ACCESS_EXPIRATION_TIME`: Access token expiration time (e.g., `15m`)

**Note:** Additional environment variables may be required for full functionality or future development, such as:
`NODE_ENV`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRATION_TIME`, `BCRYPT_SALT_ROUNDS`, `ADMIN_DEFAULT_EMAIL`, `ADMIN_DEFAULT_PASSWORD`, etc.


### Private Key

This service uses an RSA **private key** (`private.pem`) to sign JWTs.
This file must be placed in the service’s root directory (`./private.pem`), or as configured in the `docker-compose.yml` file.
The API Gateway (`appnation-gw`) uses the corresponding **public key** (`JWT_PUBLIC_KEY`) to verify these tokens.


## Database

The service uses **PostgreSQL** to store user and admin data.


### Schema Management (Prisma)

The database schema is defined in `schema.prisma`.
Prisma uses this file to manage migrations and generate a type-safe database client.

**Common Prisma Commands (For Development):**

* Run and apply migrations:

  ```bash
  pnpm prisma:dev-migrate
  ```
* Generate Prisma Client:

  ```bash
  pnpm prisma:generate
  ```
* Reset the database (use with caution):

  ```bash
  pnpm prisma migrate:reset
  ```



## Prerequisites (For Standalone Development)

* Node.js (LTS recommended)
* `pnpm` package manager
* A running PostgreSQL instance
* `private.pem` file



## Getting Started

### Setup (Standalone Development)

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create/check the `.env` file and define necessary environment variables
   (especially `DATABASE_URL`, `PORT`, `JWT_ACCESS_EXPIRATION_TIME`).

3. Place the `private.pem` file in the root directory of the project.

4. Run Prisma migrations:

   ```bash
   pnpm prisma migrate deploy # or for development: pnpm prisma migrate dev
   ```



### Running

#### Using Docker Compose (Recommended)

You can start the Identity Service using Docker Compose with the entire AppNation project by running from the project root:

```bash
docker-compose up --build -d appnation-identity-service
```

Or to start all services:

```bash
docker-compose up --build -d
```



#### Running Standalone

To run the Identity Service independently (without Docker):

1. Make sure all setup steps are completed.
2. Start the service:

   ```bash
   pnpm run start:dev
   ```

   Or for production:

   ```bash
   pnpm run build
   pnpm run start:prod
   ```



## API Endpoints (Internal Service)

Besides the paths exposed via API Gateway, the service defines the following internal endpoints (based on NestJS controllers):

* **Admin Auth:**

  * `POST /admin/auth/signup`
  * `POST /admin/auth/signin`
  * `POST /admin/auth/refresh`
  * `POST /admin/auth/logout`

* **Admin Users (User management by admin):**

  * `GET /admin/users`
  * `GET /admin/users/:id`
  * `PATCH /admin/users/:id`
  * `DELETE /admin/users/:id`

* **User Auth:**

  * `POST /user/auth/signup`
  * `POST /user/auth/signin`
  * `POST /user/auth/refresh`
  * `POST /user/auth/logout`

> *Note: These routes are accessed internally after API Gateway's `StripPrefix` filter is applied.*



## Package Manager

This service uses `pnpm` as its package manager.
Use `pnpm` instead of `npm` or `yarn` for all package operations (e.g., `pnpm install`, `pnpm run build`).
