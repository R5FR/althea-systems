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
builder.Services.AddControllers();

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
builder.Services.AddScoped<ITokenGenerator, TokenGenerator>();

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
