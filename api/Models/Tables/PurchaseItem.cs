using System;
using System.Collections.Generic;

namespace api.Models.Tables;

public partial class PurchaseItem
{
    public long Id { get; set; }

    public Guid PurchaseId { get; set; }

    public Guid GameId { get; set; }

    public decimal Price { get; set; }

    public virtual Game Game { get; set; } = null!;

    public virtual Purchase Purchase { get; set; } = null!;
}
