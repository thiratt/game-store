using System.ComponentModel.DataAnnotations;

namespace api.Models.Request
{
    public class TopupRequest
    {
        [Required(ErrorMessage = "จำนวนเงินเป็นข้อมูลที่จำเป็น")]
        [Range(1, 100000, ErrorMessage = "จำนวนเงินต้องอยู่ระหว่าง 1 - 100,000 บาท")]
        public decimal Amount { get; set; }

        public string? PaymentMethod { get; set; } = "MANUAL";

        public string? Note { get; set; }
    }
}