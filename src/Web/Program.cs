using Application.Mappers;
using Application.Services;
using Application.Interfaces;
using Authentication.Extensions;
using Authentication.Policies;
using Authentication.Services;
using ErrorHandling.Extensions;
using DAL.Context;
using DAL.UnitOfWork;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ========================================
// 1. CONFIGURATION DES CONTRÔLEURS & VALIDATION
// ========================================
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
        opts.JsonSerializerOptions.Converters.Add(new Web.Converters.DateTimeMillisConverter()));

// Fluent Validation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<MappingProfile>();

// ========================================
// 2. INJECTION DE DÉPENDANCES - DATA ACCESS LAYER
// ========================================
// Database Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Unit of Work & Repository Pattern
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// ========================================
// 3. INJECTION DE DÉPENDANCES - APPLICATION SERVICES
// ========================================
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IContactService, ContactService>();
builder.Services.AddHttpClient<Application.Interfaces.IChatbotClient, Web.Services.OllamaChatbotClient>(client =>
{
    var baseUrl = builder.Configuration["Chatbot:BaseUrl"] ?? "http://ollama:11434";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(120);
});
builder.Services.AddScoped<ITokenGenerator, TokenGenerator>();
builder.Services.AddScoped<Project.Domain.Services.IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<Application.Interfaces.IBlobStorageService, Web.Services.BlobStorageService>();
builder.Services.AddHttpClient<Application.Interfaces.ITranslationService, Web.Services.LibreTranslateService>(client =>
{
    var baseUrl = builder.Configuration["LibreTranslate:BaseUrl"] ?? "http://libretranslate:5000";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});
builder.Services.AddSingleton<Application.Interfaces.IRefreshTokenService, Web.Services.InMemoryRefreshTokenService>();
builder.Services.AddSingleton<Application.Services.IHomepageConfigService, Web.Services.HomepageConfigService>();

// ========================================
// 4. CONFIGURATION AUTHENTICATION & AUTHORIZATION
// ========================================
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddAuthorization(options =>
    options.AddAuthorizationPolicies());

// ========================================
// 5. MAPPING & AUTO MAPPER
// ========================================
builder.Services.AddAutoMapper(typeof(MappingProfile));

// ========================================
// 6. DOCUMENTATION API - SWAGGER
// ========================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "B3 E-commerce API",
        Version = "v1",
        Description = "Backend API for B3 E-commerce Platform",
        Contact = new OpenApiContact
        {
            Name = "B3 Development Team",
            Email = "dev@b3.com"
        }
    });

    // JWT Bearer Authentication in Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. " +
                     "Example: \"Authorization: Bearer {token}\""
    });

    // Apply Bearer token to all endpoints by default
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

// ========================================
// 7. CORS CONFIGURATION
// ========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });

    // Optional: Restrict CORS for production
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://yourdomain.com")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Auto-create database schema on startup (remplace les migrations)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    // Add StripeCustomerId column to existing databases
    db.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                       WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'StripeCustomerId')
            ALTER TABLE Users ADD StripeCustomerId NVARCHAR(255) NULL;
    ");
    // Create ChatMessages table if not exists
    db.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ChatMessages')
        BEGIN
            CREATE TABLE ChatMessages (
                Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
                UserId UNIQUEIDENTIFIER NOT NULL,
                Role NVARCHAR(20) NOT NULL,
                Content NVARCHAR(MAX) NOT NULL,
                CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                CONSTRAINT FK_ChatMessages_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
            );
            CREATE INDEX IX_ChatMessages_UserId_CreatedAt ON ChatMessages(UserId, CreatedAt);
        END
    ");
}

// ========================================
// 8. MIDDLEWARE PIPELINE CONFIGURATION
// ========================================

// Error Handling Middleware (MUST BE FIRST)
// Captures and centralizes all unhandled exceptions
app.UseErrorHandlingMiddleware();

// Development environment configuration
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "B3 API v1");
        options.RoutePrefix = string.Empty;
        options.DefaultModelsExpandDepth(2);
    });
}

// HTTPS Redirection
app.UseHttpsRedirection();

// CORS Middleware
app.UseCors("AllowAll");

// Routing Middleware
app.UseRouting();

// ========================================
// 9. AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ========================================
// JWT Authentication
app.UseJwtAuthentication();

// Authorization - Validates policies and roles
app.UseAuthorization();

// ========================================
// 10. ENDPOINT MAPPING
// ========================================
app.MapControllers();

// ========================================
// 11. START APPLICATION
// ========================================
app.Run();
