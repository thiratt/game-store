using System;
using System.Collections.Generic;

namespace api.Models.Dtos
{
    public class PurchaseDto
    {
        public Guid Id { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal FinalPrice { get; set; }
        public DateTime PurchasedAt { get; set; }
        public List<PurchaseItemDto> Items { get; set; } = new List<PurchaseItemDto>();
    }
}