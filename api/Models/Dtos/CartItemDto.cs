namespace api.Models.Dtos;

public class CartItemDto
{
    public long Id { get; set; }
    public Guid GameId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime AddedAt { get; set; }
    public List<GameCategoryDto> Categories { get; set; } = new();
}

public class CartSummaryDto
{
    public List<CartItemDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public decimal SubTotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
}