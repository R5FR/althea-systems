# Web Project - ASP.NET Core API

## Description
Le projet **Web** est la couche d'exposition de l'API ASP.NET Core. Il contient les controllers, la configuration des services, et le middleware pipeline.

## Architecture

```
Web/
├── Controllers/
│   ├── ProductsController       # GET /api/products, POST /api/admin/products
│   ├── CartController           # GET /api/cart, POST /api/cart/items
│   ├── OrdersController         # GET /api/orders, POST /api/checkout
│   └── AdminController          # Admin endpoints
├── Program.cs                   # Composition root - DI & middleware
├── appsettings.json            # Configuration
├── appsettings.Development.json
└── launchSettings.json          # Launch profiles
```

## Configuration

### Dépendances
- **Microsoft.AspNetCore.OpenApi** - OpenAPI/Swagger support
- **Swashbuckle.AspNetCore** - Swagger UI & generation
- **FluentValidation.AspNetCore** - API validation
- **AutoMapper.Extensions.Microsoft.DependencyInjection** - DTO mapping

### Services Enregistrés
- DbContext (EF Core)
- Unit of Work
- AutoMapper (Mapping profiles)
- FluentValidation
- CORS

## Endpoints

### Products
- `GET /api/products` - Search products with filters & pagination
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/top/{limit}` - Get top products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/{id}` - Update product (Admin)
- `DELETE /api/products/{id}` - Delete product (Admin)

### Cart
- `GET /api/cart/{cartId}` - Get cart
- `POST /api/cart/{cartId}/items` - Add item
- `PATCH /api/cart/items/{itemId}` - Update item quantity
- `DELETE /api/cart/items/{itemId}` - Remove item
- `DELETE /api/cart/{cartId}` - Clear cart
- `POST /api/cart/checkout` - Checkout (requires auth)

### Orders
- `GET /api/orders` - List user orders (requires auth)
- `GET /api/orders/{id}` - Get order by ID (requires auth)
- `POST /api/orders/{id}/cancel` - Cancel order (requires auth)
- `GET /api/orders/{id}/export` - Export order (requires auth)

### Admin
- `POST /api/admin/products` - Create product
- `PATCH /api/admin/products/{productId}/stock` - Update stock
- `GET /api/admin/products/export/csv` - Export products CSV
- `GET /api/admin/orders/export/csv` - Export orders CSV
- `GET /api/admin/users/export/csv` - Export users CSV
- `POST /api/admin/restock-alert` - Send restock alert

## Authentication & Authorization

**À intégrer**: Le projet Authentication fournira:
- JWT Bearer token validation
- Role-based authorization (admin, user)
- Claims-based policies

**Actuellement**: Les attributs `[Authorize]` et `[Authorize(Roles = "admin")]` sont en place, en attente du projet Authentication.

## Error Handling

**À intégrer**: Le projet ErrorHandling fournira:
- Middleware centralisé pour capturer les exceptions
- Mapping des exceptions Domain -> HTTP status codes
- Response standardisée avec ErrorCode et TraceId

**Actuellement**: Les controllers gèrent les exceptions Domain et retournent les codes HTTP appropriés.

## CORS

Actuellement configuré pour permettre toutes les origines. À restreindre en production:

```csharp
options.AddPolicy("AllowFrontend", policy =>
{
    policy.WithOrigins("https://yourfrontend.com")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
});
```

## Swagger/OpenAPI

L'API expose Swagger UI à l'adresse racine en développement:
- **URL**: `http://localhost:5000` ou `https://localhost:5001`
- **Swagger JSON**: `/swagger/v1/swagger.json`

## Prochaines Étapes

1. **Implémenter** les services d'application (ProductService, CartService, etc.)
2. **Intégrer** le projet Authentication pour JWT & authorization
3. **Ajouter** le projet ErrorHandling pour la gestion d'erreurs centralisée
4. **Configurer** la base de données et les migrations
5. **Ajouter** des tests unitaires et d'intégration
6. **Configurer** les logs structurés (Serilog)
7. **Limiter** CORS pour la production
8. **Ajouter** rate limiting et throttling
