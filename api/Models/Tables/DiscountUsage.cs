using System;
using System.Collections.Generic;

namespace api.Models.Tables;

public partial class DiscountUsage
{
    public long Id { get; set; }

    public Guid DiscountId { get; set; }

    public Guid UserId { get; set; }

    public DateTime UsedAt { get; set; }

    public virtual DiscountCode Discount { get; set; } = null!;

    public virtual Account User { get; set; } = null!;
}
