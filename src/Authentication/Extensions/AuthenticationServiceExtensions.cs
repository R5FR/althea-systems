namespace Authentication.Extensions;

using Authentication.Services;
using Authentication.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

public static class AuthenticationServiceExtensions
{
    /// <summary>
    /// Enregistre les services d'authentification JWT.
    /// À appeler dans Program.cs avant app.Build()
    /// </summary>
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = new JwtSettings();
        configuration.GetSection("Jwt").Bind(jwtSettings);

        if (string.IsNullOrWhiteSpace(jwtSettings.Key) || jwtSettings.Key.Length < 32)
            throw new InvalidOperationException("JWT Key must be configured and at least 32 characters long");

        services.AddSingleton(jwtSettings);
        services.AddScoped<IJwtService, JwtService>();

        var key = Encoding.ASCII.GetBytes(jwtSettings.Key);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    if (context.Exception is SecurityTokenExpiredException)
                        context.Response.Headers.Add("Token-Expired", "true");

                    return Task.CompletedTask;
                }
            };
        });

        return services;
    }

    /// <summary>
    /// Configure le middleware d'authentification et d'autorisation.
    /// À appeler dans Program.cs après app.UseRouting() et avant app.MapControllers()
    /// </summary>
    public static IApplicationBuilder UseJwtAuthentication(this IApplicationBuilder app)
    {
        app.UseAuthentication();
        app.UseAuthorization();
        return app;
    }
}
