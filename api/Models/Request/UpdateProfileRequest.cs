namespace api.Models.Request;

public class UpdateProfileRequest
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
    public IFormFile? ProfileImage { get; set; }
    public string? Role { get; set; }
}