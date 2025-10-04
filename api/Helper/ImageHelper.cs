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

    public static async Task<byte[]?> GetImageAsync(string filename)
    {
        if (string.IsNullOrEmpty(filename))
            return null;

        if (!Guid.TryParse(Path.GetFileNameWithoutExtension(filename), out Guid id))
            return null;

        if(Path.GetExtension(filename) == null)
            return null;

        var safeFilename = Path.GetFileName(id.ToString() + Path.GetExtension(filename));
        var fullPath = Path.Combine(_uploadsDir, safeFilename);
        if (!File.Exists(fullPath))
            return null;

        return await File.ReadAllBytesAsync(fullPath);
    }

    public static bool Delete(string filename)
    {
        if (string.IsNullOrEmpty(filename))
            return false;

        if (!Guid.TryParse(Path.GetFileNameWithoutExtension(filename), out Guid id))
            return false;

        if(Path.GetExtension(filename) == null)
            return false;

        var safeFilename = Path.GetFileName(id.ToString() + Path.GetExtension(filename));
        var fullPath = Path.Combine(_uploadsDir, safeFilename);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return true;
        }

        return false;
    }
}