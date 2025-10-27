namespace api.Models.Dtos;

public class CouponDto
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
    public string Code { get; set; } = null!;
    public string? Description { get; set; }
    public decimal DiscountValue { get; set; }
    public int MaxUsage { get; set; }
    public int UsedCount { get; set; }
    public int RemainingUsage { get; set; }
}