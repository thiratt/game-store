using System;

namespace api.Models.Dtos
{
    public class PurchaseItemDto
    {
        public Guid GameId { get; set; }
        public string GameTitle { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}