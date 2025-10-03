namespace api.Models.Response;

public class KiroResponse
{
    public bool Success { get; set; }
    public required string Message { get; set; }
    public object? Data { get; set; }
}