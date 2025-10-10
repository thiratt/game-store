namespace api.Models.Request;

public class AddGameRequest
{
    public required string Title { get; set; }
    public required string Description { get; set; }
    public decimal Price { get; set; }
    public DateTime ReleaseDate { get; set; }
    public List<int> CategoryIds { get; set; } = new List<int>();
    public string? ImageUrl { get; set; }
}
