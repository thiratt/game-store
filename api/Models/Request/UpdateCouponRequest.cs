namespace api.Models.Request;

public class UpdateCouponRequest
{
    public string Code { get; set; } = null!;
    public string? Description { get; set; }
    public decimal DiscountValue { get; set; }
    public int MaxUsage { get; set; }
}