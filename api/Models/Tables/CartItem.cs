using System;
using System.Collections.Generic;

namespace api.Models.Tables;

public partial class CartItem
{
    public long Id { get; set; }

    public Guid UserId { get; set; }

    public Guid GameId { get; set; }

    public DateTime AddedAt { get; set; }

    public virtual Game Game { get; set; } = null!;

    public virtual Account User { get; set; } = null!;
}
