# Bots For Trading - Admin Panel for Trading Bots Monitoring

A full-stack web application for monitoring and managing cryptocurrency trading bots. Built with modern technologies following Clean Architecture principles.

## Tech Stack

### Backend (.NET 8, Clean Architecture)
- **ASP.NET Core 8** Web API
- **Entity Framework Core 8** + PostgreSQL (Npgsql)
- **JWT Authentication** with Refresh Token
- **Serilog** for logging
- **FluentValidation** for validation
- **API Versioning** (v1)
- **Swagger/OpenAPI** documentation
- **BCrypt** for password hashing
- **Health checks**

### Frontend (React + TypeScript)
- **React 18** + TypeScript
- **Vite 5** (build tool)
- **TailwindCSS 3** + tailwindcss-animate
- **TanStack Query** (React Query) for API requests
- **Zustand** for state management
- **React Router DOM 6**
- **React Hook Form** + Zod for forms
- **Axios** for HTTP
- **Radix UI** primitives + custom UI components
- **Lucide React** for icons

### Infrastructure
- **Docker** + docker-compose
- **PostgreSQL 16** Alpine
- **Nginx** for frontend

## Ports

- **PostgreSQL:** 5432
- **Backend API:** 5001
- **Frontend:** 3001 (nginx -> 80 inside container)

## Project Structure

```
BotsForTrading/
├── backend/
│   ├── AdminPanel.sln
│   ├── Directory.Build.props
│   ├── Dockerfile
│   └── src/
│       ├── BotsForTrading.Api/         # Web API
│       ├── BotsForTrading.Core/        # Entities, Interfaces
│       ├── BotsForTrading.Infrastructure/  # EF, Services
│       └── BotsForTrading.Shared/      # DTOs, Validators
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── stores/
│       └── types/
├── infra/
│   └── scripts/
├── docker-compose.yml
├── .env
└── Makefile
```

## Features

### Authentication
- User registration and login
- JWT token authentication with refresh tokens
- Protected routes
- Role-based access control (Admin/User)

### Trading Bot Management
- Create, view, update, and delete trading bots
- Monitor bot status (Active, Paused, Inactive, Error)
- Track bot performance metrics
- View trading history
- Monitor bot logs

### Dashboard
- Overview of all trading bots
- Real-time statistics
- Quick status updates
- Performance indicators

### Bot Details
- Detailed bot information
- Trading statistics (win rate, profit/loss, etc.)
- Recent trades history
- Activity logs
- Start/Pause/Stop controls

## Getting Started

### Prerequisites

- Docker and Docker Compose
- (Optional) Node.js 20+ for local frontend development
- (Optional) .NET 8 SDK for local backend development

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd BotsForTrading
```

2. Copy the environment file:
```bash
cp env.example .env
```

3. Start all services:
```bash
docker-compose up -d --build
```

4. Access the application:
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:5001/swagger
- **Default Login:** admin@admin.local / Admin123!

### Using Makefile

```bash
# Build all containers
make build

# Start all services
make up

# Stop all services
make down

# Restart services
make restart

# View logs
make logs

# Clean up everything
make clean
```

## Environment Variables

All configuration is managed through environment variables. See [env.example](env.example) for all available options.

Key variables:
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` - Database configuration
- `JWT_SECRET` - JWT signing key (change in production!)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Initial admin user credentials
- `VITE_API_URL` - Backend API URL for frontend

## API Documentation

Once the backend is running, visit http://localhost:5001/swagger for interactive API documentation.

### Main Endpoints

**Authentication:**
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

**Bots:**
- `GET /api/v1/bots` - Get all bots
- `GET /api/v1/bots/{id}` - Get bot by ID
- `POST /api/v1/bots` - Create new bot
- `PUT /api/v1/bots/{id}` - Update bot
- `DELETE /api/v1/bots/{id}` - Delete bot

**Trades:**
- `GET /api/v1/trades/bot/{botId}` - Get bot trades

**Logs:**
- `GET /api/v1/logs/bot/{botId}` - Get bot logs

## Development

### Backend Development

```bash
cd backend
dotnet restore
dotnet run --project src/BotsForTrading.Api
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Database Migrations

```bash
cd backend/src/BotsForTrading.Api
dotnet ef migrations add InitialCreate --project ../BotsForTrading.Infrastructure
dotnet ef database update
```

## Database Schema

### Main Entities

- **User** - Application users
- **RefreshToken** - JWT refresh tokens
- **TradingBot** - Trading bot configurations
- **Trade** - Trading history
- **BotLog** - Bot activity logs
- **BotStatistics** - Bot performance metrics

## Security

- Passwords are hashed using BCrypt
- JWT tokens for authentication
- Refresh token rotation
- CORS protection
- Input validation with FluentValidation
- SQL injection protection via EF Core

## Production Deployment

1. Update `.env` file with production values:
   - Change `JWT_SECRET` to a strong random value
   - Update `ADMIN_PASSWORD`
   - Configure production database credentials
   - Set `ASPNETCORE_ENVIRONMENT=Production`

2. Build and deploy:
```bash
docker-compose -f docker-compose.yml up -d --build
```

3. Set up reverse proxy (e.g., Nginx) for SSL/TLS termination

4. Configure backups for PostgreSQL database

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
