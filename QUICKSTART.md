# Quick Start Guide

## Fastest Way to Run the Application

### Option 1: Using Docker Compose (Recommended)

1. Make sure Docker and Docker Compose are installed and running

2. Navigate to the project directory:
```bash
cd BotsForTrading
```

3. Start all services:
```bash
docker-compose up -d --build
```

4. Wait for all services to start (about 1-2 minutes)

5. Open your browser:
- **Frontend:** http://localhost:3001
- **Backend Swagger:** http://localhost:5001/swagger

6. Login with default credentials:
- **Email:** admin@admin.local
- **Password:** Admin123!

### Option 2: Using Makefile (Linux/Mac)

```bash
# Start everything
make up

# View logs
make logs

# Stop everything
make down
```

## What Happens on First Run?

1. **PostgreSQL** container starts and creates the database
2. **Backend** container:
   - Applies database migrations
   - Creates tables
   - Seeds admin user
   - Starts API server on port 5001
3. **Frontend** container:
   - Builds the React app
   - Starts Nginx server on port 3001

## Common Issues

### Port Already in Use

If ports 3000, 5000, or 5432 are already in use, you can change them in `.env` file:

```env
FRONTEND_PORT=3001
BACKEND_PORT=5001
POSTGRES_PORT=5433
```

Then restart:
```bash
docker-compose down
docker-compose up -d --build
```

### Containers Not Starting

Check logs:
```bash
docker-compose logs -f
```

Rebuild from scratch:
```bash
docker-compose down -v
docker-compose up -d --build
```

### Database Connection Issues

If backend can't connect to database, wait a bit longer. The database needs time to initialize.

You can check database status:
```bash
docker-compose logs postgres
```

## Development Mode

### Backend Only (Local)

Prerequisites: .NET 8 SDK, PostgreSQL

```bash
cd backend
dotnet restore
dotnet run --project src/BotsForTrading.Api
```

Update connection string in `appsettings.Development.json`

### Frontend Only (Local)

Prerequisites: Node.js 20+

```bash
cd frontend
npm install
npm run dev
```

Update API URL in `.env`:
```env
VITE_API_URL=http://localhost:5001
```

## Stopping the Application

```bash
# Stop containers but keep data
docker-compose down

# Stop containers and remove all data
docker-compose down -v
```

## Next Steps

1. Login to the application
2. Create your first trading bot
3. Explore the dashboard
4. Check the API documentation at http://localhost:5001/swagger

## Need Help?

- Check [README.md](README.md) for detailed documentation
- View logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`
