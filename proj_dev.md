# Plan de développement — Backend (Clean Architecture)

Date: 2026-02-24

But: préparer l'architecture backend en C# (.NET) — ASP.NET pour le web, EF Core pour l'ORM. Rien à coder maintenant, uniquement documentation détaillée.

Résumé haut-niveau
- Séparation en projets (chaque couche = projet distinct) :
  - Domain (coeur, le moins volatile)
  - Application (cas d'utilisation, règles métier)
  - DAL (Infrastructure / EF Core, implémentations de repos)
  - Authentication (gestion JWT, refresh tokens)
  - ErrorHandling (middleware de gestion d'erreurs)
  - Web (ASP.NET Core API, controllers, DI, composition root)

Principe de dépendances (du plus volatile vers le moins volatile):
- Web -> Authentication, ErrorHandling, Application
- Authentication -> Application, Domain
- ErrorHandling -> Domain
- DAL -> Application (abstractions) + Domain (entités)
- Application -> Domain
- Domain -> (aucune dépendance vers l'extérieur)

Authentification & autorisations
- JWT Bearer tokens pour accès stateless
- Rôles: `admin`, `user` (enum dans Domain)
- Endpoints protégés via attributs `[Authorize]` et policies (roles, claims)
- Les endpoints admin exigent la policy `RequireRole:Admin` ; endpoints utilisateur authentifié exigent `RequireAuthenticatedUser`.

Gestion d'erreur
- Exceptions custom dans `Domain.Exceptions` : `DomainException`, `NotFoundException`, `ValidationException`, `UnauthorizedException`, `ConflictException`.
- Lancer (throw) des exceptions dès qu'une règle métier peut échouer (validate early). Ex: constructeur de ValueObject lance `ValidationException` si invalide.
- Middleware centralisé dans le projet `ErrorHandling` : capture toutes exceptions, mappe en `ErrorResponse { code, message, details, traceId }` et retourne code HTTP adapté (400, 401, 403, 404, 409, 500).

Règles de code
- Fonctions courtes, nommage explicite, SOLID, tests unitaires envisagés.
- DTOs clairs ; mappers (AutoMapper ou manuels) dans Application.

Structure des projets et composants (détail)

1) Projet: Domain
- But: Contient entités, value objects, enums, exceptions et interfaces métier (abstractions si nécessaire).
- Dépendances NuGet: Aucune (ou uniquement packages non-opinionnés si indispensables).
- Arborescence proposée:
  - Domain/Entities/
    - User.cs
      - Propriétés: Id:Guid, FirstName, LastName, Email, PasswordHash, AccountStatus(enum), Role(enum), CreatedAt, UpdatedAt, LastLoginAt, EmailVerifiedAt
      - Méthodes: VerifyEmail(DateTime timestamp), UpdateLastLogin(DateTime), SetPasswordHash(string hash)
    - Product.cs
      - Propriétés: Id, Name, Description, PriceHt, TvaRate, PriceTtc, StockQuantity, Status, Slug, CategoryId, CreatedAt, UpdatedAt
      - Méthodes: DecreaseStock(int qty) throws DomainException, IncreaseStock(int qty)
    - Order.cs, OrderItem.cs, Cart.cs, CartItem.cs, Address.cs, PaymentMethod.cs, Invoice.cs, CreditNote.cs, ContactMessage.cs, Category.cs, ProductImage.cs
  - Domain/ValueObjects/
    - Money.cs
      - Propriétés: Amount (decimal), Currency (string)
      - Méthodes: Add(Money), Subtract(Money), Multiply(decimal)
      - Validation: throw ValidationException si montant négatif
    - EmailAddress.cs
      - Constructeur valide et Normalizer ; throw ValidationException si invalide
  - Domain/Enums/
    - AccountStatus.cs (active, inactive, pending, banned)
    - Role.cs (user, admin)
    - ProductStatus.cs (published, draft, archived)
    - OrderStatus.cs, PaymentStatus.cs
  - Domain/Exceptions/
    - DomainException : base (hérite de Exception)
    - NotFoundException : DomainException
    - ValidationException : DomainException (liste d'erreurs possible)
    - UnauthorizedException : DomainException
    - ConflictException : DomainException
  - Domain/Interfaces/
    - IRepository<T> (contrat générique si nécessaire)
    - IUnitOfWork (SaveChangesAsync)
    - IUserRepository, IProductRepository, IOrderRepository, ICartRepository, IInvoiceRepository (méthodes signatures, async)
  - Domain/Services/
    - IPasswordHasher (Hash, Verify)
    - IJwtFactory (optionnel si besoin par Domain pour règles très spécifiques)

2) Projet: Application
- But: Cas d'utilisation, services d'application, DTOs, interfaces pour l'infrastructure, validations.
- Dépendances NuGet recommandées: `FluentValidation`, `AutoMapper` (optionnel), `MediatR` (optionnel), `Microsoft.Extensions.DependencyInjection.Abstractions`.
- Arborescence:
  - Application/DTOs/
    - UserDto.cs, ProductDto.cs, ProductListItemDto.cs, OrderDto.cs, CartDto.cs, AddressDto.cs, PaymentMethodDto.cs
  - Application/Commands/Queries/UseCases/ (ou Services/)
    - IUserService.cs
      - Méthodes: RegisterAsync(RegisterUserDto dto), ConfirmEmailAsync(token), LoginAsync(LoginDto) -> AuthResultDto, GetProfileAsync(Guid id), UpdateProfileAsync(UpdateUserDto)
    - IProductService.cs
      - Méthodes: GetByIdAsync(Guid id), SearchAsync(ProductSearchParams), CreateAsync(CreateProductDto), UpdateAsync(UpdateProductDto), ChangeStockAsync(Guid id, int qty)
    - ICartService.cs
      - Méthodes: GetCartAsync(userOrSession), AddItemAsync(cartId, productId, qty), UpdateItemAsync(itemId, qty), RemoveItemAsync(itemId), CheckoutAsync(cartId, userId)
    - IOrderService.cs
      - Méthodes: PlaceOrderAsync(CheckoutDto), GetOrderAsync(id), ListOrdersAsync(userId, filters)
    - IAdminService.cs (opérations backoffice: CreateProduct, UpdateStock, ExportCsv)
  - Application/Validators/
    - FluentValidation validators: RegisterUserValidator, ProductValidator, AddressValidator, PaymentMethodValidator
    - Chaque validator lance ValidationException via wrapper `ValidateAndThrow` utilisé par les use cases
  - Application/Interfaces/
    - Interfaces pour repositories (contre-injection) : IUserRepository, IProductRepository, etc (référence au Domain.Interfaces ou duplication d'abstraction si souhaité)
  - Application/Mappers/
    - Mapping DTO <-> Entity (AutoMapper profiles ou mapping manuel)
  - Application/Responses/
    - AuthResultDto { AccessToken, ExpiresIn, RefreshToken? }

3) Projet: DAL (Infrastructure)
- But: Implémentations EF Core, DbContext, migrations, repositories concrètes.
- Dépendances NuGet: `Microsoft.EntityFrameworkCore`, `Microsoft.EntityFrameworkCore.SqlServer` (ou provider choisi), `Microsoft.EntityFrameworkCore.Tools`, `Microsoft.Extensions.Configuration`, `Dapper` (optionnel pour requêtes perf), `Npgsql`/`Pomelo.EntityFrameworkCore.MySql` selon SGBD.
- Arborescence:
  - DAL/Context/
    - AppDbContext : DbSet<User>, DbSet<Product>, DbSet<Order>, ...
    - AppDbContextFactory (pour migrations)
  - DAL/Repositories/
    - UserRepository : implements IUserRepository
      - Méthodes: GetByIdAsync(Guid id), GetByEmailAsync(string email), AddAsync(User user), Update(User user)
    - ProductRepository : GetByIdAsync, SearchAsync, AddAsync, UpdateAsync, GetTopProductsAsync(limit)
    - OrderRepository, CartRepository, InvoiceRepository, CategoryRepository
  - DAL/Migrations/
  - DAL/InfrastructureExtras/
    - EF configurations (IEntityTypeConfiguration<T>) pour chaque entité

4) Projet: Authentication
- But: Gestion JWT, génération / validation, refresh tokens, policies.
- Dépendances NuGet: `Microsoft.AspNetCore.Authentication.JwtBearer`, `System.IdentityModel.Tokens.Jwt`, `Microsoft.Extensions.Configuration`, `Microsoft.AspNetCore.Identity` (optionnel si vous utilisez Identity), `Microsoft.IdentityModel.Tokens`.
- Contenu:
  - Authentication/JwtSettings.cs (Issuer, Audience, Key, AccessTokenExpiry, RefreshTokenExpiry)
  - Authentication/IJwtService.cs
    - Méthodes: GenerateToken(User user, IEnumerable<Claim> additionalClaims) -> AuthResultDto, ValidateToken(string token) -> ClaimsPrincipal
  - Authentication/JwtService.cs (implémentation)
    - Méthodes concrètes: CreateAccessToken, CreateRefreshToken, ValidateToken
  - Authentication/IRefreshTokenRepository.cs
    - Méthodes: SaveRefreshToken(userId, token), RevokeRefreshToken(token), GetRefreshToken(token)
  - Authentication/RefreshToken.cs (entity)
  - Authentication/Policies.cs (helpers pour configuration des policies role-based)

5) Projet: ErrorHandling
- But: Middleware centralisé mapping exceptions -> HTTP responses et log.
- Dépendances NuGet: `Serilog` (ou `Microsoft.Extensions.Logging`), `Newtonsoft.Json` (optionnel).
- Contenu:
  - ErrorHandling/ErrorHandlingMiddleware.cs
    - Invoke(HttpContext)
    - Fonctionnalités: catch Exception, map DomainException types -> HttpStatusCode, construire ErrorResponse { StatusCode, ErrorCode, Message, Details, TraceId }, sérialiser JSON, log (structured), renvoyer réponse.
  - ErrorHandling/ErrorResponse.cs
    - Propriétés: int StatusCode, string ErrorCode, string Message, object Details, string TraceId
  - ErrorHandling/ExceptionToStatusMapper.cs
    - Méthode: Map(Exception) -> (int statusCode, string errorCode)

6) Projet: Web (ASP.NET Core API)
- But: API endpoints, controllers, composition root (Program.cs / Startup.cs), DI registration, middleware pipeline.
- Dépendances NuGet: `Microsoft.AspNetCore.App` (inclut Auth), `Swashbuckle.AspNetCore` (Swagger), `FluentValidation.AspNetCore`.
- Arborescence et composants:
  - Web/Program.cs (composition root)
    - ConfigureServices: register Application services, DAL, Authentication services, ErrorHandling middleware, AutoMapper, validators
    - Configure: UseRouting, UseAuthentication, UseAuthorization, UseMiddleware<ErrorHandlingMiddleware>, UseEndpoints
  - Web/Controllers/
    - AuthController
      - POST /api/auth/register -> RegisterAsync(RegisterDto)
      - POST /api/auth/login -> LoginAsync(LoginDto)
      - POST /api/auth/refresh -> RefreshTokenAsync(RefreshDto)
      - POST /api/auth/logout -> LogoutAsync
    - UsersController
      - GET /api/users/me -> GetProfile (requires auth)
      - PUT /api/users/me -> UpdateProfile
    - ProductsController
      - GET /api/products -> Search (public)
      - GET /api/products/{id} -> GetById (public)
      - POST /api/admin/products -> Create (RequireRole:Admin)
      - PUT /api/admin/products/{id} -> Update (Admin)
    - CartController
      - GET /api/cart -> GetCart (auth or session)
      - POST /api/cart/items -> AddItem
      - PATCH /api/cart/items/{id} -> UpdateItem
    - OrdersController
      - POST /api/checkout -> Checkout (requires authenticated user)
      - GET /api/orders/{id} -> GetOrder (owner or admin)
    - AdminController
      - Endpoints backoffice (RequireRole:Admin)
  - Web/Filters (optionnel)
  - Web/DTOs/Requests and Responses

Sécurité des endpoints
- Appliquer `[Authorize]` et policies. Vérifier ownership au niveau Application services (ex: GetOrderAsync vérifie userId ou role admin sinon throw UnauthorizedException).

Mapping erreurs -> codes HTTP (exemples)
- ValidationException -> 400 Bad Request (body: details list)
- UnauthorizedException -> 401 Unauthorized
- Forbidden (Role/Policy) -> 403 Forbidden
- NotFoundException -> 404 Not Found
- ConflictException -> 409 Conflict
- DomainException non-mappée -> 422 Unprocessable Entity (ou 400)
- Exception non contrôlée -> 500 Internal Server Error

Conventions importantes
- Tous les services exposent méthodes `Async` retournant `Task<T>`
- Les méthodes valident leurs arguments et lancent `ValidationException`/`DomainException` dès que nécessaire
- Les repositories exposent signatures `Task<Entity?> GetByIdAsync(Guid id)` et `Task AddAsync(Entity entity)` etc.
- Les DTOs contiennent uniquement les champs nécessaires et sont immutables quand possible

Exemples de signatures (Application interfaces)
- IUserService
  - Task<AuthResultDto> RegisterAsync(RegisterUserDto dto)
  - Task<AuthResultDto> LoginAsync(LoginDto dto)
  - Task<UserDto> GetProfileAsync(Guid userId)
  - Task UpdateProfileAsync(Guid userId, UpdateUserDto dto)
- IProductService
  - Task<ProductDto> GetByIdAsync(Guid id)
  - Task<PaginatedResult<ProductListItemDto>> SearchAsync(ProductSearchParams p)
  - Task<Guid> CreateAsync(CreateProductDto dto)
- IOrderService
  - Task<Guid> PlaceOrderAsync(CheckoutDto dto)
  - Task<OrderDto> GetOrderAsync(Guid orderId, Guid callerUserId)

Dépendances par projet (liste succincte)
- Domain: aucune externe
- Application:
  - FluentValidation
  - AutoMapper (optionnel)
  - MediatR (optionnel)
- DAL:
  - Microsoft.EntityFrameworkCore
  - Microsoft.EntityFrameworkCore.Design
  - Microsoft.EntityFrameworkCore.SqlServer (ou provider choisi)
- Authentication:
  - Microsoft.AspNetCore.Authentication.JwtBearer
  - Microsoft.IdentityModel.Tokens
  - System.IdentityModel.Tokens.Jwt
- ErrorHandling:
  - Microsoft.Extensions.Logging
  - Serilog (optionnel)
- Web:
  - Microsoft.AspNetCore.App
  - Swashbuckle.AspNetCore
  - FluentValidation.AspNetCore

Checklist d'implémentation (prochaine étape si vous voulez coder)
- Créer solution .sln et les projets dans cet ordre: Domain, Application, DAL, Authentication, ErrorHandling, Web
- Ajouter références projets: Application -> Domain ; DAL -> Domain + Application (pour interfaces) ; Authentication -> Application + Domain ; ErrorHandling -> Domain ; Web -> Application + Authentication + ErrorHandling + DAL
- Implémenter entités et exceptions dans Domain
- Implémenter interfaces et DTOs dans Application
- Implémenter DbContext et repositories dans DAL
- Implémenter JwtService et RefreshToken handling dans Authentication
- Implémenter ErrorHandling middleware et tests map des exceptions
- Implémenter Controllers et wiring dans Web

Notes / recommandations
- Préférez validation dans ValueObjects/Constructors pour fail-fast.
- Garder les méthodes courtes et nom explicite.
- Pour la recherche (100ms requirement) prévoir indexes fulltext (voir model_data.txt), cache (Redis) et requêtes optimisées (Dapper pour hotspots).
- Stocker uniquement `last4` et `stripe_payment_method_id` pour moyens de paiement (conforme PCI-DSS).
- Pour le backoffice admin, protéger endpoints par 2FA (hors scope technique ici) ; prévoir middleware / policy spécifique.

Fichiers lus pour préparation:
- [message.txt](message.txt)
- [model_data.txt](model_data.txt)

Fin du document — prêt à être transformé en template de projets et tickets de développement.
