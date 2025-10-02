using System;
using System.Collections.Generic;

namespace api.Models.Tables;

public partial class TransactionHistory
{
    public long Id { get; set; }

    public Guid UserId { get; set; }

    public string Type { get; set; } = null!;

    public decimal Amount { get; set; }

    public Guid? ReferenceId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Account User { get; set; } = null!;
}
