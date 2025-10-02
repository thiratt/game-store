namespace api.Models.Request;

public class Login
{
    public required string Identifier { get; set; }
    public required string Password { get; set; }
}