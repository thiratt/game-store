namespace api.Models.Response;

public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public UserInfo? User { get; set; }
}

public class UserInfo
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
    public decimal WalletBalance { get; set; }
}