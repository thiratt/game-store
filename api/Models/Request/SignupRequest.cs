namespace api.Models.Request;

public class SignupRequest
{
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public IFormFile? ProfileImage { get; set; }
}