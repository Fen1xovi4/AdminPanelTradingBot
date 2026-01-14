using BotsForTrading.Core.Entities;
using BotsForTrading.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BotsForTrading.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<TradingBot> TradingBots => Set<TradingBot>();
    public DbSet<Trade> Trades => Set<Trade>();
    public DbSet<BotLog> BotLogs => Set<BotLog>();
    public DbSet<BotStatistics> BotStatistics => Set<BotStatistics>();
    public DbSet<TradeHistory> TradeHistories => Set<TradeHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.Role).HasMaxLength(50).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
        });

        // RefreshToken configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.Property(e => e.Token).HasMaxLength(500).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TradingBot configuration
        modelBuilder.Entity<TradingBot>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Strategy).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Exchange).HasMaxLength(100).IsRequired();
            entity.Property(e => e.TradingPair).HasMaxLength(20).IsRequired();
            entity.Property(e => e.InitialBalance).HasColumnType("decimal(18,8)");
            entity.Property(e => e.CurrentBalance).HasColumnType("decimal(18,8)");
            entity.Property(e => e.Status).HasMaxLength(50).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.User)
                .WithMany(u => u.TradingBots)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Trade configuration
        modelBuilder.Entity<Trade>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasMaxLength(10).IsRequired();
            entity.Property(e => e.TradingPair).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Amount).HasColumnType("decimal(18,8)");
            entity.Property(e => e.Price).HasColumnType("decimal(18,8)");
            entity.Property(e => e.Total).HasColumnType("decimal(18,8)");
            entity.Property(e => e.Fee).HasColumnType("decimal(18,8)");
            entity.Property(e => e.ProfitLoss).HasColumnType("decimal(18,8)");
            entity.Property(e => e.ExecutedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.ExternalOrderId).HasMaxLength(100);

            entity.HasOne(e => e.Bot)
                .WithMany(b => b.Trades)
                .HasForeignKey(e => e.BotId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ExecutedAt);
        });

        // BotLog configuration
        modelBuilder.Entity<BotLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Level).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Message).HasMaxLength(1000).IsRequired();
            entity.Property(e => e.Details).HasMaxLength(4000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Bot)
                .WithMany(b => b.Logs)
                .HasForeignKey(e => e.BotId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Level);
        });

        // BotStatistics configuration
        modelBuilder.Entity<BotStatistics>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BotId).IsUnique();
            entity.Property(e => e.TotalProfit).HasColumnType("decimal(18,8)");
            entity.Property(e => e.TotalLoss).HasColumnType("decimal(18,8)");
            entity.Property(e => e.NetProfit).HasColumnType("decimal(18,8)");
            entity.Property(e => e.WinRate).HasColumnType("decimal(5,2)");
            entity.Property(e => e.AverageProfit).HasColumnType("decimal(18,8)");
            entity.Property(e => e.AverageLoss).HasColumnType("decimal(18,8)");
            entity.Property(e => e.MaxDrawdown).HasColumnType("decimal(18,8)");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Bot)
                .WithOne(b => b.Statistics)
                .HasForeignKey<BotStatistics>(e => e.BotId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TradeHistory configuration
        modelBuilder.Entity<TradeHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TradingPair).HasMaxLength(20).IsRequired();
            entity.Property(e => e.PositionSide).HasMaxLength(10).IsRequired();
            entity.Property(e => e.EntryPrice).HasColumnType("decimal(18,8)");
            entity.Property(e => e.ExitPrice).HasColumnType("decimal(18,8)");
            entity.Property(e => e.PositionSize).HasColumnType("decimal(18,8)");
            entity.Property(e => e.RealizedPnL).HasColumnType("decimal(18,8)");
            entity.Property(e => e.Status).HasMaxLength(20).IsRequired();
            entity.Property(e => e.ErrorMessage).HasMaxLength(1000);
            entity.Property(e => e.ClosedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Bot)
                .WithMany(b => b.TradeHistories)
                .HasForeignKey(e => e.BotId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ClosedAt);
            entity.HasIndex(e => e.Status);
        });
    }
}
