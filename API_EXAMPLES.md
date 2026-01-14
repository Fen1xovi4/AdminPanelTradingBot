# API Examples

This document provides examples of how to interact with the Bots For Trading API.

## Base URL

```
http://localhost:5001/api/v1
```

## Authentication

### 1. Register a New User

```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admin.local",
    "password": "Admin123!"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "base64encodedtoken...",
  "user": {
    "id": 1,
    "email": "admin@admin.local",
    "firstName": "Admin",
    "lastName": "User",
    "role": "Admin",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Get Current User

```bash
curl -X GET http://localhost:5001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:5001/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Logout

```bash
curl -X POST http://localhost:5001/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Trading Bots

### 1. Create a Trading Bot

```bash
curl -X POST http://localhost:5001/api/v1/bots \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Bot",
    "description": "Grid trading strategy on BTC/USDT",
    "strategy": "Grid Trading",
    "exchange": "Binance",
    "tradingPair": "BTC/USDT",
    "initialBalance": 10000
  }'
```

Response:
```json
{
  "id": 1,
  "name": "My First Bot",
  "description": "Grid trading strategy on BTC/USDT",
  "strategy": "Grid Trading",
  "exchange": "Binance",
  "tradingPair": "BTC/USDT",
  "initialBalance": 10000,
  "currentBalance": 10000,
  "status": "Inactive",
  "createdAt": "2024-01-01T12:00:00Z",
  "lastActiveAt": null,
  "userId": 1,
  "statistics": null
}
```

### 2. Get All Bots

```bash
curl -X GET http://localhost:5001/api/v1/bots \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Bot by ID

```bash
curl -X GET http://localhost:5001/api/v1/bots/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Bot

```bash
curl -X PUT http://localhost:5001/api/v1/bots/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Bot Name",
    "status": "Active"
  }'
```

### 5. Delete Bot

```bash
curl -X DELETE http://localhost:5001/api/v1/bots/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Trades

### Get Bot Trades

```bash
curl -X GET http://localhost:5001/api/v1/trades/bot/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
[
  {
    "id": 1,
    "botId": 1,
    "type": "Buy",
    "tradingPair": "BTC/USDT",
    "amount": 0.001,
    "price": 50000,
    "total": 50,
    "fee": 0.05,
    "profitLoss": 0,
    "executedAt": "2024-01-01T12:30:00Z",
    "externalOrderId": "12345"
  }
]
```

## Logs

### Get Bot Logs

```bash
curl -X GET "http://localhost:5001/api/v1/logs/bot/1?limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
[
  {
    "id": 1,
    "botId": 1,
    "level": "Info",
    "message": "Bot started successfully",
    "details": "Initial balance: 10000 USDT",
    "createdAt": "2024-01-01T12:00:00Z"
  },
  {
    "id": 2,
    "botId": 1,
    "level": "Warning",
    "message": "Price volatility detected",
    "details": "Price change > 5% in 1 minute",
    "createdAt": "2024-01-01T12:05:00Z"
  }
]
```

## Using with JavaScript/TypeScript

### Example with Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
});

// Login
const login = async () => {
  const response = await api.post('/auth/login', {
    email: 'admin@admin.local',
    password: 'Admin123!',
  });

  const { accessToken } = response.data;

  // Store token
  localStorage.setItem('token', accessToken);

  return response.data;
};

// Create bot with authentication
const createBot = async () => {
  const token = localStorage.getItem('token');

  const response = await api.post('/bots', {
    name: 'My Bot',
    description: 'Test bot',
    strategy: 'Grid Trading',
    exchange: 'Binance',
    tradingPair: 'BTC/USDT',
    initialBalance: 1000,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Get all bots
const getBots = async () => {
  const token = localStorage.getItem('token');

  const response = await api.get('/bots', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
```

## Using with Python

### Example with requests

```python
import requests

BASE_URL = "http://localhost:5001/api/v1"

# Login
def login():
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@admin.local",
        "password": "Admin123!"
    })
    data = response.json()
    return data["accessToken"]

# Create bot
def create_bot(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/bots",
        headers=headers,
        json={
            "name": "Python Bot",
            "description": "Created from Python",
            "strategy": "DCA",
            "exchange": "Binance",
            "tradingPair": "ETH/USDT",
            "initialBalance": 5000
        }
    )
    return response.json()

# Get all bots
def get_bots(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/bots", headers=headers)
    return response.json()

# Usage
if __name__ == "__main__":
    token = login()
    print(f"Logged in, token: {token[:20]}...")

    bot = create_bot(token)
    print(f"Created bot: {bot['name']}")

    bots = get_bots(token)
    print(f"Total bots: {len(bots)}")
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "detail": "Error details here"
}
```

## Rate Limiting

Currently, there are no rate limits, but it's recommended to:
- Implement rate limiting in production
- Cache GET requests when possible
- Use websockets for real-time updates instead of polling

## Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (httpOnly cookies preferred over localStorage)
3. **Implement token refresh logic** to handle expired tokens
4. **Handle errors gracefully** with proper error messages
5. **Use request timeouts** to prevent hanging requests
6. **Validate data on client side** before sending to API
