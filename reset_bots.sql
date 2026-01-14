-- Delete all existing bots
DELETE FROM "TradingBots";

-- Reset the sequence (if needed)
ALTER SEQUENCE "TradingBots_Id_seq" RESTART WITH 1;
