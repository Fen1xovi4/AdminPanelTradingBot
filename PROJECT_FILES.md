# Project Files Structure

Complete list of all files created for the Bots For Trading project.

## Root Files
- `.env` - Environment variables
- `.gitignore` - Git ignore rules
- `.dockerignore` - Docker ignore rules
- `docker-compose.yml` - Docker Compose configuration
- `env.example` - Example environment variables
- `Makefile` - Make commands for easy management
- `README.md` - Main documentation
- `QUICKSTART.md` - Quick start guide
- `API_EXAMPLES.md` - API usage examples
- `PROJECT_FILES.md` - This file

## Infrastructure
- `infra/scripts/init-db.sql` - Database initialization script

## Backend (.NET 8)

### Solution Files
- `backend/Directory.Build.props` - Build properties
- `backend/AdminPanel.sln` - Solution file
- `backend/Dockerfile` - Backend Docker image

### BotsForTrading.Core (Domain Layer)
- `backend/src/BotsForTrading.Core/BotsForTrading.Core.csproj`
- `backend/src/BotsForTrading.Core/Entities/User.cs`
- `backend/src/BotsForTrading.Core/Entities/TradingBot.cs`
- `backend/src/BotsForTrading.Core/Entities/Trade.cs`
- `backend/src/BotsForTrading.Core/Entities/BotLog.cs`
- `backend/src/BotsForTrading.Core/Entities/BotStatistics.cs`
- `backend/src/BotsForTrading.Core/Entities/RefreshToken.cs`
- `backend/src/BotsForTrading.Core/Interfaces/IAuthService.cs`
- `backend/src/BotsForTrading.Core/Interfaces/IApplicationDbContext.cs`

### BotsForTrading.Infrastructure (Data Layer)
- `backend/src/BotsForTrading.Infrastructure/BotsForTrading.Infrastructure.csproj`
- `backend/src/BotsForTrading.Infrastructure/Persistence/ApplicationDbContext.cs`
- `backend/src/BotsForTrading.Infrastructure/Persistence/DataSeeder.cs`
- `backend/src/BotsForTrading.Infrastructure/Services/AuthService.cs`

### BotsForTrading.Shared (DTOs & Validators)
- `backend/src/BotsForTrading.Shared/BotsForTrading.Shared.csproj`
- `backend/src/BotsForTrading.Shared/DTOs/Auth/LoginRequest.cs`
- `backend/src/BotsForTrading.Shared/DTOs/Auth/LoginResponse.cs`
- `backend/src/BotsForTrading.Shared/DTOs/Auth/RegisterRequest.cs`
- `backend/src/BotsForTrading.Shared/DTOs/Auth/RefreshTokenRequest.cs`
- `backend/src/BotsForTrading.Shared/DTOs/Auth/UserDto.cs`
- `backend/src/BotsForTrading.Shared/DTOs/Bots/TradingBotDto.cs`
- `backend/src/BotsForTrading.Shared/DTOs/Bots/CreateBotRequest.cs`
- `backend/src/BotsForTrading.Shared/DTOs/Bots/UpdateBotRequest.cs`
- `backend/src/BotsForTrading.Shared/DTOs/Bots/BotStatisticsDto.cs`
- `backend/src/BotsForTrading.Shared/DTOs/Trades/TradeDto.cs`
- `backend/src/BotsForTrading.Shared/DTOs/Logs/BotLogDto.cs`
- `backend/src/BotsForTrading.Shared/Validators/LoginRequestValidator.cs`
- `backend/src/BotsForTrading.Shared/Validators/RegisterRequestValidator.cs`
- `backend/src/BotsForTrading.Shared/Validators/CreateBotRequestValidator.cs`

### BotsForTrading.Api (Presentation Layer)
- `backend/src/BotsForTrading.Api/BotsForTrading.Api.csproj`
- `backend/src/BotsForTrading.Api/Program.cs`
- `backend/src/BotsForTrading.Api/appsettings.json`
- `backend/src/BotsForTrading.Api/appsettings.Development.json`
- `backend/src/BotsForTrading.Api/Middleware/ExceptionMiddleware.cs`
- `backend/src/BotsForTrading.Api/Authorization/CurrentUserService.cs`
- `backend/src/BotsForTrading.Api/Controllers/HealthController.cs`
- `backend/src/BotsForTrading.Api/Controllers/V1/AuthController.cs`
- `backend/src/BotsForTrading.Api/Controllers/V1/BotsController.cs`
- `backend/src/BotsForTrading.Api/Controllers/V1/TradesController.cs`
- `backend/src/BotsForTrading.Api/Controllers/V1/LogsController.cs`

## Frontend (React + TypeScript)

### Configuration Files
- `frontend/package.json` - NPM dependencies
- `frontend/vite.config.ts` - Vite configuration
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/tsconfig.node.json` - TypeScript Node configuration
- `frontend/tailwind.config.js` - Tailwind CSS configuration
- `frontend/postcss.config.js` - PostCSS configuration
- `frontend/.eslintrc.cjs` - ESLint configuration
- `frontend/Dockerfile` - Frontend Docker image
- `frontend/nginx.conf` - Nginx configuration
- `frontend/index.html` - HTML entry point

### Source Files
- `frontend/src/main.tsx` - Application entry point
- `frontend/src/App.tsx` - Main App component
- `frontend/src/index.css` - Global styles
- `frontend/src/vite-env.d.ts` - Vite environment types

### Types
- `frontend/src/types/index.ts` - TypeScript type definitions

### Services & Stores
- `frontend/src/services/api.ts` - Axios instance with interceptors
- `frontend/src/services/authApi.ts` - Authentication API calls
- `frontend/src/services/botsApi.ts` - Bots API calls
- `frontend/src/stores/authStore.ts` - Zustand auth store

### UI Components
- `frontend/src/lib/utils.ts` - Utility functions
- `frontend/src/components/ui/button.tsx` - Button component
- `frontend/src/components/ui/input.tsx` - Input component
- `frontend/src/components/ui/label.tsx` - Label component
- `frontend/src/components/ui/card.tsx` - Card component
- `frontend/src/components/ui/toast.tsx` - Toast component
- `frontend/src/components/ui/toaster.tsx` - Toaster component
- `frontend/src/components/ui/use-toast.ts` - Toast hook
- `frontend/src/components/ui/spinner.tsx` - Spinner component
- `frontend/src/components/ui/dialog.tsx` - Dialog component

### Layout Components
- `frontend/src/components/layout/Header.tsx` - Header component
- `frontend/src/components/layout/Layout.tsx` - Layout wrapper

### Auth Components
- `frontend/src/components/auth/ProtectedRoute.tsx` - Route protection

### Bot Components
- `frontend/src/components/bots/CreateBotDialog.tsx` - Create bot dialog

### Pages
- `frontend/src/pages/LoginPage.tsx` - Login page
- `frontend/src/pages/RegisterPage.tsx` - Register page
- `frontend/src/pages/DashboardPage.tsx` - Dashboard page
- `frontend/src/pages/BotDetailPage.tsx` - Bot detail page

## Total Files Count

- **Backend**: 35 files
- **Frontend**: 35 files
- **Infrastructure**: 10 files
- **Documentation**: 5 files
- **Total**: ~85 files

## Technology Versions

- .NET: 8.0
- Node.js: 20+
- PostgreSQL: 16
- React: 18.3
- TypeScript: 5.4
- Vite: 5.2

## Next Steps

1. Navigate to project directory
2. Run `docker-compose up -d --build`
3. Access http://localhost:3000
4. Login with admin@admin.local / Admin123!
5. Start creating trading bots!
