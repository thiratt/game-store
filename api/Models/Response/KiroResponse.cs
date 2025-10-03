namespace api.Models.Response;

public class KiroResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? Data { get; set; }
}