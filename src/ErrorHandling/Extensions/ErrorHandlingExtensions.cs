namespace ErrorHandling.Extensions;

using ErrorHandling.Middleware;
using Microsoft.AspNetCore.Builder;

/// <summary>
/// Extensions pour enregistrer et utiliser le middleware de gestion des erreurs.
/// </summary>
public static class ErrorHandlingExtensions
{
    /// <summary>
    /// Ajoute le middleware de gestion des erreurs au pipeline.
    /// À appeler au début du middleware pipeline, après UseRouting().
    /// </summary>
    public static IApplicationBuilder UseErrorHandlingMiddleware(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ErrorHandlingMiddleware>();
    }
}
