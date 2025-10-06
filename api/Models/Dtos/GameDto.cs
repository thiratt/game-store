namespace api.Models.Dtos;

public class GameDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<GameCategoryDto> Categories { get; set; } = [];
    public DateTime ReleaseDate { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
}

public class GameCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}