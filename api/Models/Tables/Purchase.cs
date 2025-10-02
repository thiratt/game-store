using System;
using System.Collections.Generic;

namespace api.Models.Tables;

public partial class Purchase
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid? DiscountId { get; set; }

    public decimal TotalPrice { get; set; }

    public decimal FinalPrice { get; set; }

    public DateTime PurchasedAt { get; set; }

    public virtual DiscountCode? Discount { get; set; }

    public virtual ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();

    public virtual Account User { get; set; } = null!;
}
