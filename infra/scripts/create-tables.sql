-- Drop existing tables if they exist
DROP TABLE IF EXISTS "RefreshTokens" CASCADE;
DROP TABLE IF EXISTS "BotStatistics" CASCADE;
DROP TABLE IF EXISTS "BotLogs" CASCADE;
DROP TABLE IF EXISTS "Trades" CASCADE;
DROP TABLE IF EXISTS "TradingBots" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- Create Users table
CREATE TABLE "Users" (
    "Id" SERIAL PRIMARY KEY,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "FirstName" VARCHAR(100),
    "LastName" VARCHAR(100),
    "Role" VARCHAR(50) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create TradingBots table
CREATE TABLE "TradingBots" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INT NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "Exchange" VARCHAR(100) NOT NULL,
    "TradingPair" VARCHAR(50) NOT NULL,
    "Strategy" VARCHAR(100) NOT NULL,
    "Status" VARCHAR(50) NOT NULL,
    "Balance" DECIMAL(18, 8) NOT NULL DEFAULT 0,
    "Profit" DECIMAL(18, 8) NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_TradingBots_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE
);

-- Create Trades table
CREATE TABLE "Trades" (
    "Id" SERIAL PRIMARY KEY,
    "TradingBotId" INT NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "Symbol" VARCHAR(50) NOT NULL,
    "Amount" DECIMAL(18, 8) NOT NULL,
    "Price" DECIMAL(18, 8) NOT NULL,
    "Total" DECIMAL(18, 8) NOT NULL,
    "Fee" DECIMAL(18, 8) NOT NULL DEFAULT 0,
    "Status" VARCHAR(50) NOT NULL,
    "ExecutedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_Trades_TradingBots_TradingBotId" FOREIGN KEY ("TradingBotId") REFERENCES "TradingBots"("Id") ON DELETE CASCADE
);

-- Create BotLogs table
CREATE TABLE "BotLogs" (
    "Id" SERIAL PRIMARY KEY,
    "TradingBotId" INT NOT NULL,
    "Level" VARCHAR(50) NOT NULL,
    "Message" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_BotLogs_TradingBots_TradingBotId" FOREIGN KEY ("TradingBotId") REFERENCES "TradingBots"("Id") ON DELETE CASCADE
);

-- Create BotStatistics table
CREATE TABLE "BotStatistics" (
    "Id" SERIAL PRIMARY KEY,
    "TradingBotId" INT NOT NULL UNIQUE,
    "TotalTrades" INT NOT NULL DEFAULT 0,
    "SuccessfulTrades" INT NOT NULL DEFAULT 0,
    "FailedTrades" INT NOT NULL DEFAULT 0,
    "TotalProfit" DECIMAL(18, 8) NOT NULL DEFAULT 0,
    "TotalLoss" DECIMAL(18, 8) NOT NULL DEFAULT 0,
    "WinRate" DECIMAL(5, 2) NOT NULL DEFAULT 0,
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "FK_BotStatistics_TradingBots_TradingBotId" FOREIGN KEY ("TradingBotId") REFERENCES "TradingBots"("Id") ON DELETE CASCADE
);

-- Create RefreshTokens table
CREATE TABLE "RefreshTokens" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INT NOT NULL,
    "Token" TEXT NOT NULL UNIQUE,
    "ExpiresAt" TIMESTAMP NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "RevokedAt" TIMESTAMP NULL,
    CONSTRAINT "FK_RefreshTokens_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "IX_TradingBots_UserId" ON "TradingBots"("UserId");
CREATE INDEX "IX_Trades_TradingBotId" ON "Trades"("TradingBotId");
CREATE INDEX "IX_BotLogs_TradingBotId" ON "BotLogs"("TradingBotId");
CREATE INDEX "IX_BotStatistics_TradingBotId" ON "BotStatistics"("TradingBotId");
CREATE INDEX "IX_RefreshTokens_UserId" ON "RefreshTokens"("UserId");
