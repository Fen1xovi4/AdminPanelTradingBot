namespace BotsForTrading.Core.Interfaces;

public interface IAuthService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
    string GenerateJwtToken(int userId, string email, string role);
    string GenerateRefreshToken();
}
