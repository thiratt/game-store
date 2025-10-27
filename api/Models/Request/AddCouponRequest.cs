namespace api.Models.Request;

public class AddCouponRequest
{
    public string Code { get; set; } = null!;
    public string? Description { get; set; }
    public decimal DiscountValue { get; set; }
    public int MaxUsage { get; set; }
}