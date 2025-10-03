namespace api.Helper;

public static class ImageHelper
{
    private static readonly string _uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

    public static async Task<string> SaveAsync(IFormFile image)
    {
        if (image == null || image.Length == 0)
            throw new ArgumentException("Image is null or empty");

        if (!Directory.Exists(_uploadsDir))
            Directory.CreateDirectory(_uploadsDir);

        var fileExtension = Path.GetExtension(image.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(_uploadsDir, uniqueFileName);

        using var stream = new FileStream(filePath, FileMode.Create);

        await image.CopyToAsync(stream);

        return $"/image/{uniqueFileName}";
    }

    public static bool Delete(string imagePath)
    {
        if (string.IsNullOrEmpty(imagePath))
            return false;

        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), imagePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return true;
        }

        return false;
    }
}