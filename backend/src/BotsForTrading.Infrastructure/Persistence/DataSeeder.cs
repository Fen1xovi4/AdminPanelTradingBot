using BotsForTrading.Core.Entities;
using BotsForTrading.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BotsForTrading.Infrastructure.Persistence;

public class DataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(
        ApplicationDbContext context,
        IAuthService authService,
        IConfiguration configuration,
        ILogger<DataSeeder> logger)
    {
        _context = context;
        _authService = authService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            // Apply migrations
            // await _context.Database.MigrateAsync();

            // Seed admin user
            await SeedAdminUserAsync();

            // Save admin user before creating bots (so we can find them by query)
            await _context.SaveChangesAsync();

            // Seed test bots
            await SeedTestBotsAsync();

            await _context.SaveChangesAsync();
            _logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }

    private async Task SeedAdminUserAsync()
    {
        var adminEmail = _configuration["Admin:Email"] ?? "admin@admin.local";

        var existingAdmin = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == adminEmail);

        if (existingAdmin == null)
        {
            var adminPassword = _configuration["Admin:Password"] ?? "Admin123!";
            var passwordHash = _authService.HashPassword(adminPassword);

            var admin = new User
            {
                Email = adminEmail,
                PasswordHash = passwordHash,
                FirstName = "Admin",
                LastName = "User",
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(admin);
            _logger.LogInformation("Admin user created with email: {Email}", adminEmail);
        }
        else
        {
            _logger.LogInformation("Admin user already exists with email: {Email}", adminEmail);
        }
    }

    private async Task SeedTestBotsAsync()
    {
        if (await _context.TradingBots.AnyAsync())
        {
            _logger.LogInformation("Bots already exist, skipping seeding");
            return;
        }

        var admin = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
        if (admin == null)
        {
            _logger.LogWarning("Admin user not found, cannot seed test bots");
            return;
        }

        // Real bots - names will be updated by TradingBot terminal when it connects
        var testBots = new List<TradingBot>
        {
            new TradingBot
            {
                Name = "BitGet - MAR - XRP",
                Description = "XRP trading bot on Bitget MAR account",
                Exchange = "Bitget",
                Account = "MAR",
                ExternalBotId = "4bd3725b-11ad-45ba-bddd-84edab280e93",
                TradingPair = "XRP/USDT",
                Strategy = "EMA Deviation",
                Status = "Active",
                InitialBalance = 1000,
                CurrentBalance = 1000,
                UserId = admin.Id,
                CreatedAt = DateTime.UtcNow
            },
            new TradingBot
            {
                Name = "BitGet-MAR-Attic-DOT",
                Description = "DOT trading bot on Bitget MAR-Attic account",
                Exchange = "Bitget",
                Account = "MAR-Attic",
                ExternalBotId = "06756bac-7520-47fe-8789-241720243522",
                TradingPair = "DOT/USDT",
                Strategy = "EMA Deviation",
                Status = "Active",
                InitialBalance = 1000,
                CurrentBalance = 1000,
                UserId = admin.Id,
                CreatedAt = DateTime.UtcNow
            },
            new TradingBot
            {
                Name = "BitGet-KOL-ATTIC-2",
                Description = "XLM trading bot on Bitget KOL-ATTIC account",
                Exchange = "Bitget",
                Account = "KOL-ATTIC",
                ExternalBotId = "8ff431be-ed87-4b10-adaa-1cbc76984561",
                TradingPair = "XLM/USDT",
                Strategy = "EMA Deviation",
                Status = "Active",
                InitialBalance = 1000,
                CurrentBalance = 1000,
                UserId = admin.Id,
                CreatedAt = DateTime.UtcNow
            },
            new TradingBot
            {
                Name = "BitGet-KOL-K2",
                Description = "ADA trading bot on Bitget KOL account",
                Exchange = "Bitget",
                Account = "KOL",
                ExternalBotId = "8f5780e4-639f-4650-b82b-70fb58f658f5",
                TradingPair = "ADA/USDT",
                Strategy = "EMA Deviation",
                Status = "Active",
                InitialBalance = 1000,
                CurrentBalance = 1000,
                UserId = admin.Id,
                CreatedAt = DateTime.UtcNow
            },
            new TradingBot
            {
                Name = "BitGet - MAR - SOL",
                Description = "SOL trading bot on Bitget MAR account",
                Exchange = "Bitget",
                Account = "MAR",
                ExternalBotId = "",
                TradingPair = "SOL/USDT",
                Strategy = "EMA Deviation",
                Status = "Active",
                InitialBalance = 1000,
                CurrentBalance = 1000,
                UserId = admin.Id,
                CreatedAt = DateTime.UtcNow
            }
        };

        _context.TradingBots.AddRange(testBots);
        _logger.LogInformation("Created {Count} test bots", testBots.Count);
    }
}
