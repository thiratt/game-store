namespace api.Models.Dtos;

public class CouponDto
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
    public string Code { get; set; } = null!;
    public string? Description { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal UsedAmount { get; set; }
    public decimal RemainingAmount { get; set; }
}