namespace api.Models.Dtos;

public class CouponValidationDto
{
    public Guid CouponId { get; set; }
    public string Code { get; set; } = null!;
    public decimal DiscountValue { get; set; }
    public decimal AppliedDiscount { get; set; }
    public string? Description { get; set; }
}