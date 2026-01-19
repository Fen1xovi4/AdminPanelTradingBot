# BotsForTrading - Checklist for Startup

## Prerequisites Check

### 1. Stop Docker containers (if running)
```bash
docker stop botsfortrading-web botsfortrading-api
# or
docker-compose down
```
**Why:** Docker containers may occupy ports 3001/5001 with old builds.

### 2. Check ports are free
```bash
# Windows
netstat -ano | findstr ":3001"
netstat -ano | findstr ":5001"

# If occupied, find process:
tasklist | findstr <PID>

# Kill if needed:
taskkill /PID <PID> /F
```

**Required ports:**
- 3001 - Vite frontend dev server
- 5001 - .NET backend API
- 5433 - PostgreSQL (Docker)

---

## Startup Order

### Step 1: PostgreSQL (Docker)
```bash
cd BotsForTrading
docker-compose up -d postgres
```
Wait until healthy (5-10 sec).

### Step 2: Backend (.NET API)
```bash
cd BotsForTrading/backend/src/BotsForTrading.Api
dotnet run
```
Wait for `Now listening on: http://localhost:5001`

### Step 3: Frontend (Vite)
```bash
cd BotsForTrading/frontend
npm run dev
```
Wait for `Local: http://localhost:3001/`

---

## Common Issues & Solutions

### Issue: "Invalid login or password"
**Cause:** Password hash mismatch in database.
**Solution:**
```sql
-- Connect to PostgreSQL (port 5433)
DELETE FROM "RefreshTokens" WHERE "UserId" = 1;
DELETE FROM "Users" WHERE "Id" = 1;
```
Then restart backend - it will recreate admin user.

### Issue: 502 Bad Gateway
**Cause:** Docker nginx container running on port 3001 instead of Vite.
**Solution:** Stop Docker containers, start Vite manually.

### Issue: Frontend shows old UI
**Cause:** Browser cache.
**Solution:** Hard refresh (Ctrl+Shift+R) or disable cache in DevTools.

### Issue: Port already in use
**Cause:** Previous process still running.
**Solution:**
```bash
# Windows - find and kill
netstat -ano | findstr ":PORT"
taskkill /PID <PID> /F
```

---

## Default Credentials
- **Admin:** admin@admin.local / Admin123!

---

## Vite Proxy Configuration
Frontend proxies `/api/*` requests to backend:
```
http://localhost:3001/api/* → http://localhost:5001/api/*
```
This is configured in `frontend/vite.config.ts`.
