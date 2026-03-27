namespace ErrorHandling.Mappers;

using Project.Domain.Exceptions;
using ErrorHandling.Models;

/// <summary>
/// Mappe les exceptions Domain aux codes HTTP et ErrorResponse.
/// </summary>
public static class ExceptionToStatusMapper
{
    /// <summary>
    /// Mappe une exception à un code HTTP et un ErrorResponse.
    /// </summary>
    public static (int statusCode, string errorCode) Map(Exception exception)
    {
        return exception switch
        {
            ValidationException => (400, "BAD_REQUEST"),
            UnauthorizedException => (401, "UNAUTHORIZED"),
            NotFoundException => (404, "NOT_FOUND"),
            ConflictException => (409, "CONFLICT"),
            DomainException => (422, "UNPROCESSABLE_ENTITY"),
            _ => (500, "INTERNAL_SERVER_ERROR")
        };
    }

    /// <summary>
    /// Crée un ErrorResponse complet avec message et détails.
    /// </summary>
    public static ErrorResponse CreateErrorResponse(Exception exception, string traceId)
    {
        var (statusCode, errorCode) = Map(exception);

        var message = exception.Message ?? exception.GetType().Name;
        object? details = null;

        // Pour les validation exceptions, extraire les détails
        if (exception is ValidationException validationEx)
        {
            details = new { message = validationEx.Message };
        }

        return new ErrorResponse
        {
            StatusCode = statusCode,
            ErrorCode = errorCode,
            Message = message,
            TraceId = traceId,
            Details = details
        };
    }

    /// <summary>
    /// Retourne le message d'erreur approprié pour l'utilisateur.
    /// </summary>
    public static string GetUserFriendlyMessage(Exception exception)
    {
        return exception switch
        {
            ValidationException => "Les données fournies sont invalides",
            UnauthorizedException => "Authentification requise",
            NotFoundException => "La ressource demandée n'a pas été trouvée",
            ConflictException => "L'opération ne peut pas être effectuée en raison d'un conflit",
            DomainException => "Une erreur métier s'est produite",
            _ => "Une erreur interne s'est produite. Veuillez réessayer plus tard."
        };
    }
}
