using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace api.Models.Tables;

public partial class KiroContext : DbContext
{
    public KiroContext(DbContextOptions<KiroContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Account> Accounts { get; set; }

    public virtual DbSet<CartItem> CartItems { get; set; }

    public virtual DbSet<DiscountCode> DiscountCodes { get; set; }

    public virtual DbSet<DiscountUsage> DiscountUsages { get; set; }

    public virtual DbSet<Game> Games { get; set; }

    public virtual DbSet<GameCategory> GameCategories { get; set; }

    public virtual DbSet<Purchase> Purchases { get; set; }

    public virtual DbSet<PurchaseItem> PurchaseItems { get; set; }

    public virtual DbSet<TransactionHistory> TransactionHistories { get; set; }

    public virtual DbSet<UserGame> UserGames { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("account");

            entity.HasIndex(e => e.Email, "email").IsUnique();

            entity.HasIndex(e => e.Username, "username").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
                .HasColumnType("timestamp(3)")
                .HasColumnName("created_at");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.PasswordHash)
                .HasColumnType("text")
                .HasColumnName("password_hash");
            entity.Property(e => e.ProfileImage)
                .HasMaxLength(255)
                .HasColumnName("profile_image");
            entity.Property(e => e.Role)
                .HasDefaultValueSql("'USER'")
                .HasColumnType("enum('USER','ADMIN')")
                .HasColumnName("role");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
                .HasColumnType("timestamp(3)")
                .HasColumnName("updated_at");
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .HasColumnName("username");
            entity.Property(e => e.WalletBalance)
                .HasPrecision(10)
                .HasColumnName("wallet_balance");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("cart_item");

            entity.HasIndex(e => e.GameId, "fk_cart_game");

            entity.HasIndex(e => new { e.UserId, e.GameId }, "user_id").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AddedAt)
                .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
                .HasColumnType("timestamp(3)")
                .HasColumnName("added_at");
            entity.Property(e => e.GameId).HasColumnName("game_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Game).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.GameId)
                .HasConstraintName("fk_cart_game");

            entity.HasOne(d => d.User).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_cart_user");
        });

        modelBuilder.Entity<DiscountCode>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("discount_code");

            entity.HasIndex(e => e.Code, "code").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
                .HasColumnType("timestamp(3)")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.DiscountValue)
                .HasPrecision(10)
                .HasColumnName("discount_value");
            entity.Property(e => e.MaxUsage).HasColumnName("max_usage");
            entity.Property(e => e.UsedCount).HasColumnName("used_count");
        });

        modelBuilder.Entity<DiscountUsage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("discount_usage");

            entity.HasIndex(e => new { e.DiscountId, e.UserId }, "discount_id").IsUnique();

            entity.HasIndex(e => e.UserId, "fk_usage_user");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DiscountId).HasColumnName("discount_id");
            entity.Property(e => e.UsedAt)
                .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
                .HasColumnType("timestamp(3)")
                .HasColumnName("used_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Discount).WithMany(p => p.DiscountUsages)
                .HasForeignKey(d => d.DiscountId)
                .HasConstraintName("fk_usage_discount");

            entity.HasOne(d => d.User).WithMany(p => p.DiscountUsages)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_usage_user");
        });

        modelBuilder.Entity<Game>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("game");

            entity.HasIndex(e => e.CategoryId, "fk_game_category");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(255)
                .HasColumnName("image_url");
            entity.Property(e => e.Price)
                .HasPrecision(10)
                .HasColumnName("price");
            entity.Property(e => e.ReleaseDate)
                .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
                .HasColumnType("timestamp(3)")
                .HasColumnName("release_date");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");

            entity.HasOne(d => d.Category).WithMany(p => p.Games)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_game_category");
        });

        modelBuilder.Entity<GameCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("game_category");

            entity.HasIndex(e => e.Name, "name").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Purchase>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("purchase");

            entity.HasIndex(e => e.DiscountId, "fk_purchase_discount");

            entity.HasIndex(e => e.UserId, "fk_purchase_user");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DiscountId).HasColumnName("discount_id");
            entity.Property(e => e.FinalPrice)
                .HasPrecision(10)
                .HasColumnName("final_price");
            entity.Property(e => e.PurchasedAt)
                .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
                .HasColumnType("timestamp(3)")
                .HasColumnName("purchased_at");
            entity.Property(e => e.TotalPrice)
                .HasPrecision(10)
                .HasColumnName("total_price");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Discount).WithMany(p => p.Purchases)
                .HasForeignKey(d => d.DiscountId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_purchase_discount");

            entity.HasOne(d => d.User).WithMany(p => p.Purchases)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_purchase_user");
        });

        modelBuilder.Entity<PurchaseItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("purchase_item");

            entity.HasIndex(e => e.GameId, "fk_pitem_game");

            entity.HasIndex(e => new { e.PurchaseId, e.GameId }, "purchase_id").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GameId).HasColumnName("game_id");
            entity.Property(e => e.Price)
                .HasPrecision(10)
                .HasColumnName("price");
            entity.Property(e => e.PurchaseId).HasColumnName("purchase_id");

            entity.HasOne(d => d.Game).WithMany(p => p.PurchaseItems)
                .HasForeignKey(d => d.GameId)
                .HasConstraintName("fk_pitem_game");

            entity.HasOne(d => d.Purchase).WithMany(p => p.PurchaseItems)
                .HasForeignKey(d => d.PurchaseId)
                .HasConstraintName("fk_pitem_purchase");
        });

        modelBuilder.Entity<TransactionHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("transaction_history");

            entity.HasIndex(e => e.UserId, "fk_tx_user");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Amount)
                .HasPrecision(10)
                .HasColumnName("amount");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
                .HasColumnType("timestamp(3)")
                .HasColumnName("created_at");
            entity.Property(e => e.ReferenceId).HasColumnName("reference_id");
            entity.Property(e => e.Type)
                .HasColumnType("enum('TOPUP','PURCHASE')")
                .HasColumnName("type");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.TransactionHistories)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_tx_user");
        });

        modelBuilder.Entity<UserGame>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("user_game");

            entity.HasIndex(e => e.GameId, "fk_ug_game");

            entity.HasIndex(e => new { e.UserId, e.GameId }, "user_id").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GameId).HasColumnName("game_id");
            entity.Property(e => e.OwnedAt)
                .HasDefaultValueSql("'CURRENT_TIMESTAMP(3)'")
                .HasColumnType("timestamp(3)")
                .HasColumnName("owned_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Game).WithMany(p => p.UserGames)
                .HasForeignKey(d => d.GameId)
                .HasConstraintName("fk_ug_game");

            entity.HasOne(d => d.User).WithMany(p => p.UserGames)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_ug_user");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
