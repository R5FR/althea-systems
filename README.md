# Althea Systems

**B2B e-commerce platform for medical equipment** — built with ASP.NET Core 8 (Clean Architecture) and Angular 21.

> Precise · Progressive · Trustworthy

---

## Overview

Althea Systems is a full-stack procurement platform targeting hospital purchasing agents, practicing clinicians, and biomedical engineers. It covers the complete purchase lifecycle: product discovery, cart, Stripe checkout, order tracking, and admin back-office — with an AI chatbot and multi-language support layered on top.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 21 · Tailwind CSS 3 · TypeScript 5.9 |
| **Backend** | ASP.NET Core 8 · C# 12 · Clean Architecture |
| **Database** | SQL Server 2022 · Entity Framework Core |
| **Auth** | JWT Bearer + Refresh Tokens |
| **Payments** | Stripe |
| **File storage** | Cloudinary |
| **AI chatbot** | Ollama (Mistral) |
| **Translation** | LibreTranslate (self-hosted) |
| **i18n** | ngx-translate (FR / EN / AR) |
| **Infra** | Docker Compose |

---

## Architecture

### Backend — Clean Architecture (6 projects)

```
Domain          → entities, value objects (Money, EmailAddress), domain exceptions, repository interfaces
Application     → service interfaces & implementations, DTOs, AutoMapper profiles, FluentValidation validators
DAL             → EF Core AppDbContext, repository implementations, migrations, UnitOfWork
Authentication  → JwtService (HMAC-SHA256), refresh token management, authorization policies
ErrorHandling   → global exception middleware → standardized HTTP error responses
Web             → ASP.NET Core API (controllers, DI composition root, Swagger)
```

Dependency flow: `Web → Application + DAL + Authentication + ErrorHandling → Domain`. Domain has zero external dependencies.

### Frontend — Angular 21 (standalone, no NgModules)

Feature-based structure under `src/app/`:

```
core/       → guards (auth, admin, guest), JWT interceptor, models, services
features/   → 13 lazy-loaded areas: auth, home, catalog, product, search, cart,
              checkout, orders, account, contact, legal, admin, chatbot
shared/     → layout, header, footer, chatbot components
```

---

## Features

### Customer-facing
- **Product catalog** — browse by category, full-text search, filters
- **Product pages** — images (Cloudinary), specs, stock status
- **Shopping cart** — persistent, quantity management
- **Checkout** — Stripe payment, address selection, order confirmation
- **Account** — profile, saved addresses, payment methods, order history
- **AI chatbot** — powered by Ollama / Mistral, context-aware product assistant
- **Translation** — LibreTranslate integration (FR / EN / AR)
- **Legal** — CGU, mentions légales

### Admin back-office (`/admin`)
- Dashboard with analytics (Chart.js)
- Product & category CRUD with image upload
- Order management and status tracking
- User management
- Homepage content configuration
- Contact message inbox

### Security & Auth
- JWT access tokens (1h) + refresh tokens (7 days)
- Role-based policies (`RequireAdminRole`, `RequireAuthenticatedUser`)
- Ownership verification on sensitive endpoints
- Centralized error handling: `ValidationException→400`, `UnauthorizedException→401`, `ForbiddenException→403`, `NotFoundException→404`, `ConflictException→409`

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
- Or locally: .NET 8 SDK · Node.js 22+ · SQL Server 2022

### Run with Docker (recommended)

```bash
# 1. Copy and fill in the environment file
cp .env.example .env
# Edit .env with your Cloudinary credentials, JWT key, and Stripe keys

# 2. Start the full stack
docker compose up --build
```

| Service | URL |
|---|---|
| Angular frontend | http://localhost:4200 |
| ASP.NET Core API | http://localhost:2500 |
| Swagger UI | http://localhost:2500/swagger |
| LibreTranslate | http://localhost:5100 |
| Ollama | http://localhost:11434 |

> The first startup pulls the Mistral model (~4 GB). Subsequent starts are instant.

### Run locally (without Docker)

**Backend**

```bash
cd althea-systems

# Configure connection string in src/Web/appsettings.Development.json
dotnet build src/Web/Web.csproj
dotnet run --project src/Web/Web.csproj    # API → http://localhost:7100
```

**Frontend**

```bash
cd althea-systems/frontend
npm install
npm start    # Dev server → http://localhost:4200
```

**EF Core migrations**

```bash
# Run from althea-systems/
dotnet ef migrations add <Name> --project src/DAL --startup-project src/Web
dotnet ef database update --project src/DAL --startup-project src/Web
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Cloudinary — image storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT — must be at least 32 characters
JWT_KEY=YourSecretKeyMustBeAtLeast32Characters

# Stripe (test keys are fine for development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

These values are injected into the containers at runtime. Never commit `.env`.

> **Note**: `src/Web/appsettings.json` also needs valid credentials for local (non-Docker) development. Use `appsettings.Development.json` to override with your local values.

---

## Project Structure

```
althea-systems/
├── docker-compose.yml          # Full stack (DB, API, frontend, Ollama, LibreTranslate)
├── Dockerfile.backend
├── seed.sql                    # Initial data: 8 categories, 19 medical products
├── .env.example
│
├── src/                        # ASP.NET Core backend
│   ├── Domain/
│   ├── Application/
│   ├── DAL/
│   ├── Authentication/
│   ├── ErrorHandling/
│   ├── Web/
│   └── Tests/
│
├── frontend/                   # Angular 21 frontend
│   └── src/app/
│       ├── core/
│       ├── features/
│       └── shared/
│
└── docs/
    └── projet-etude/           # School project deliverables (CPI Bachelor)
```

---

## API Reference

Full endpoint documentation is available at `/swagger` when running in development mode.

Key endpoint groups:

| Group | Base path |
|---|---|
| Authentication | `/api/auth` |
| Products | `/api/products` |
| Categories | `/api/categories` |
| Cart | `/api/cart` |
| Orders | `/api/orders` |
| Account | `/api/users` |
| Admin | `/api/admin` |
| Payments | `/api/payments` |
| Contact | `/api/contact` |
| Translation | `/api/translate` |

---

## Testing

```bash
# Backend (xUnit)
dotnet test src/Tests/

# Frontend (Vitest)
cd frontend && npm test
```

---

## Team

| Name | Role |
|---|---|
| Tom Leprieur | Full-stack |
| Tiago Da Costa | Full-stack |
| Arthur L'Afféter | Full-stack |

CPI Bachelor — B3 — 2026
