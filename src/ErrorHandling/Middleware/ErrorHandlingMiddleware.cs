namespace ErrorHandling.Middleware;

using Project.Domain.Exceptions;
using ErrorHandling.Mappers;
using ErrorHandling.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;

/// <summary>
/// Middleware centralisé pour la gestion des erreurs.
/// Capture toutes les exceptions non gérées et les mappe à des réponses HTTP standardisées.
/// </summary>
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Invoque le middleware.
    /// </summary>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    /// <summary>
    /// Traite une exception et crée une réponse HTTP appropriée.
    /// </summary>
    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;

        // Logger l'exception
        var logger = context.RequestServices.GetRequiredService<ILogger<ErrorHandlingMiddleware>>();
        logger.LogError(exception, "Unhandled exception occurred. TraceId: {TraceId}, Path: {Path}",
            traceId, context.Request.Path);

        // Créer la réponse d'erreur
        var errorResponse = ExceptionToStatusMapper.CreateErrorResponse(exception, traceId);

        // Configurer la réponse HTTP
        context.Response.StatusCode = errorResponse.StatusCode;
        context.Response.ContentType = "application/json";

        // Sérialiser et retourner la réponse
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        var json = JsonSerializer.Serialize(errorResponse, jsonOptions);
        return context.Response.WriteAsync(json);
    }
}
