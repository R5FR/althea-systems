using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Web.Converters;

/// <summary>
/// Serializes DateTime values as ISO 8601 with exactly 3 millisecond decimal places.
/// Prevents Angular DatePipe issues caused by .NET's variable 1-7 fractional second precision.
/// </summary>
public class DateTimeMillisConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var str = reader.GetString();
        if (str is null) return default;
        return DateTime.Parse(str, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        var utc = value.Kind == DateTimeKind.Utc ? value : value.ToUniversalTime();
        writer.WriteStringValue(utc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture));
    }
}
