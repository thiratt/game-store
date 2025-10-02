using System;
using System.Collections.Generic;

namespace api.Models.Tables;

public partial class Game
{
    public Guid Id { get; set; }

    public string Title { get; set; } = null!;

    public decimal Price { get; set; }

    public int CategoryId { get; set; }

    public string ImageUrl { get; set; } = null!;

    public string Description { get; set; } = null!;

    public DateTime ReleaseDate { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual GameCategory Category { get; set; } = null!;

    public virtual ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();

    public virtual ICollection<UserGame> UserGames { get; set; } = new List<UserGame>();
}
