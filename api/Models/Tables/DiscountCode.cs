using System;
using System.Collections.Generic;

namespace api.Models.Tables;

public partial class DiscountCode
{
    public Guid Id { get; set; }

    public string Code { get; set; } = null!;

    public string? Description { get; set; }

    public decimal DiscountValue { get; set; }

    public int MaxUsage { get; set; }

    public int UsedCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<DiscountUsage> DiscountUsages { get; set; } = new List<DiscountUsage>();

    public virtual ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
}
