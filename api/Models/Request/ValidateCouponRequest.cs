namespace api.Models.Request;

public class ValidateCouponRequest
{
    public string Code { get; set; } = null!;
    public decimal TotalAmount { get; set; }
}