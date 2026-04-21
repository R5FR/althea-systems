namespace Web.Services;

using Application.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

public class BlobStorageService : IBlobStorageService
{
    private readonly Cloudinary _cloudinary;
    private readonly string _folder;

    public BlobStorageService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"]
            ?? throw new InvalidOperationException("Cloudinary:CloudName is not configured");
        var apiKey = configuration["Cloudinary:ApiKey"]
            ?? throw new InvalidOperationException("Cloudinary:ApiKey is not configured");
        var apiSecret = configuration["Cloudinary:ApiSecret"]
            ?? throw new InvalidOperationException("Cloudinary:ApiSecret is not configured");

        _cloudinary = new Cloudinary(new Account(cloudName, apiKey, apiSecret));
        _cloudinary.Api.Secure = true;
        _folder = configuration["Cloudinary:Folder"] ?? "product-images";
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = _folder,
            UseFilename = false,
            UniqueFilename = true,
            Overwrite = false,
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
            throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");

        return result.SecureUrl.ToString();
    }

    public async Task DeleteAsync(string imageUrl)
    {
        // Extraire le public_id depuis l'URL Cloudinary
        // Format : https://res.cloudinary.com/{cloud}/{type}/{folder}/{public_id}.{ext}
        var uri = new Uri(imageUrl);
        var segments = uri.AbsolutePath.Split('/');

        // Trouver l'index du type (image/upload) et prendre tout ce qui suit sans l'extension
        var uploadIndex = Array.IndexOf(segments, "upload");
        if (uploadIndex < 0 || uploadIndex + 2 >= segments.Length)
            return;

        // Ignorer le segment de version (v1234567) s'il est présent
        var startIndex = uploadIndex + 1;
        if (segments[startIndex].StartsWith("v") && int.TryParse(segments[startIndex][1..], out _))
            startIndex++;

        var publicIdWithExt = string.Join("/", segments[startIndex..]);
        var publicId = System.IO.Path.ChangeExtension(publicIdWithExt, null);

        var deleteParams = new DeletionParams(publicId);
        await _cloudinary.DestroyAsync(deleteParams);
    }
}
