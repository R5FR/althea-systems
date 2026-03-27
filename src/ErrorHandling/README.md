# ErrorHandling Project

## Description
Le projet **ErrorHandling** fournit un middleware centralisé pour la gestion des erreurs et la conversion des exceptions Domain en réponses HTTP standardisées.

## Architecture

```
ErrorHandling/
├── Models/
│   └── ErrorResponse.cs         # Réponse d'erreur standardisée
├── Mappers/
│   └── ExceptionToStatusMapper.cs # Mapping exception -> HTTP status
├── Middleware/
│   └── ErrorHandlingMiddleware.cs # Middleware centralisé
└── Extensions/
    └── ErrorHandlingExtensions.cs # Extension pour Program.cs
```

## Configuration

### Dépendances
- **Microsoft.AspNetCore.Http.Abstractions** - HTTP context
- **Microsoft.Extensions.Logging.Abstractions** - Logging

### Intégration dans Program.cs

```csharp
// Dans le middleware pipeline, APRÈS app.UseRouting() et AVANT app.MapControllers()
app.UseErrorHandlingMiddleware();
```

**Important:** Le middleware doit être enregistré après UseRouting() mais avant MapControllers() pour pouvoir capturer les 404s routage.

### Ordre complet du pipeline

```csharp
app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseRouting();
app.UseJwtAuthentication();      // Authentication middleware
app.UseErrorHandlingMiddleware();  // Error handling middleware
app.MapControllers();
```

## ErrorResponse

Structure standardisée pour toutes les réponses d'erreur:

```json
{
  "statusCode": 400,
  "errorCode": "BAD_REQUEST",
  "message": "Email is required",
  "details": {
    "message": "Email is required"
  },
  "traceId": "0HMVGI5SCKE4E:00000001",
  "timestamp": "2026-02-25T10:30:00Z"
}
```

### Propriétés
- **statusCode** - Code HTTP (400, 401, 404, 409, 422, 500)
- **errorCode** - Code d'erreur machine (BAD_REQUEST, UNAUTHORIZED, etc.)
- **message** - Message d'erreur
- **details** - Détails additionnels (optionnel)
- **traceId** - ID de trace pour la corrélation des logs
- **timestamp** - Timestamp UTC de l'erreur

## Exceptions & Mapping

| Exception | HTTP | Code | Description |
|-----------|------|------|-------------|
| ValidationException | 400 | BAD_REQUEST | Données invalides |
| UnauthorizedException | 401 | UNAUTHORIZED | Auth requise |
| NotFoundException | 404 | NOT_FOUND | Ressource inexistante |
| ConflictException | 409 | CONFLICT | Conflit métier |
| DomainException | 422 | UNPROCESSABLE_ENTITY | Erreur métier générique |
| Exception (non-mappée) | 500 | INTERNAL_SERVER_ERROR | Erreur interne |

## Fonctionnalités

✅ **Capture centralisée** - Toutes les exceptions sont traitées en un seul endroit
✅ **Logging structuré** - Chaque erreur est loggée avec le TraceId
✅ **Code d'erreur machine** - Facilite le traitement côté client
✅ **Sérialisation JSON** - Format standard avec camelCase
✅ **Détails additionnels** - Support pour les détails de validation
✅ **TraceId** - Corrélation avec les logs serveur

## Exemples

### Validation Error (400)
```json
{
  "statusCode": 400,
  "errorCode": "BAD_REQUEST",
  "message": "FirstName is required",
  "details": null,
  "traceId": "0HMVGI5SCKE4E:00000001",
  "timestamp": "2026-02-25T10:30:00Z"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "errorCode": "NOT_FOUND",
  "message": "Product with ID '550e8400-e29b-41d4-a716-446655440000' not found",
  "details": null,
  "traceId": "0HMVGI5SCKE4E:00000001",
  "timestamp": "2026-02-25T10:30:00Z"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "errorCode": "CONFLICT",
  "message": "Product with slug 'awesome-product' already exists",
  "details": null,
  "traceId": "0HMVGI5SCKE4E:00000001",
  "timestamp": "2026-02-25T10:30:00Z"
}
```

### Internal Server Error (500)
```json
{
  "statusCode": 500,
  "errorCode": "INTERNAL_SERVER_ERROR",
  "message": "An error occurred while fetching products from the database",
  "details": null,
  "traceId": "0HMVGI5SCKE4E:00000001",
  "timestamp": "2026-02-25T10:30:00Z"
}
```

## Logging

Toutes les exceptions non gérées sont loggées automatiquement avec:
- **TraceId** - Pour la corrélation
- **Path** - Endpoint qui a échoué
- **Exception** - Stack trace complète

Exemple de log:
```
[Error] ErrorHandlingMiddleware: Unhandled exception occurred. TraceId: 0HMVGI5SCKE4E:00000001, Path: /api/products
System.Exception: Database connection failed...
  at DAL.Context.AppDbContext.SaveChangesAsync()
```

## Prochaines Étapes

1. **Configurer Serilog** pour les logs structurés
2. **Ajouter custom exception handlers** pour des types spécifiques
3. **Implémenter Problem Details** (RFC 7807) comme alternative JSON
4. **Ajouter validation errors details** pour les ModelState errors
5. **Configurer CORS error handling** pour les origins non-autorisés
