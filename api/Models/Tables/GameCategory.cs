using System;
using System.Collections.Generic;

namespace api.Models.Tables;

public partial class GameCategory
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Game> Games { get; set; } = new List<Game>();
}
