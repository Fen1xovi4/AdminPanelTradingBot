using BotsForTrading.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace BotsForTrading.Core.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<TradingBot> TradingBots { get; }
    DbSet<Trade> Trades { get; }
    DbSet<BotLog> BotLogs { get; }
    DbSet<BotStatistics> BotStatistics { get; }
    DbSet<TradeHistory> TradeHistories { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
