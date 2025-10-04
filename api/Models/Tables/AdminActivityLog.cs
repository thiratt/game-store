using System;
using System.Collections.Generic;

namespace api.Models.Tables;

public partial class AdminActivityLog
{
    public long Id { get; set; }

    public Guid AdminId { get; set; }

    public string ActionType { get; set; } = null!;

    public Guid? TargetId { get; set; }

    public string? TargetTable { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Account Admin { get; set; } = null!;
}
