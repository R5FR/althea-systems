namespace ErrorHandling.Models;

/// <summary>
/// Réponse standardisée pour les erreurs API.
/// </summary>
public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string ErrorCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public object? Details { get; set; }
    public string TraceId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public ErrorResponse()
    {
    }

    public ErrorResponse(int statusCode, string errorCode, string message, string traceId, object? details = null)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
        Message = message;
        TraceId = traceId;
        Details = details;
    }
}
