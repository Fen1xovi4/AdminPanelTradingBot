UPDATE "TradingBots"
SET "TradingPair" = 'ADA/USDT',
    "Name" = 'BitGet-M MAR ADA Bot'
WHERE "ExternalBotId" = '4bd3725b-11ad-45ba-bddd-84edab280e93';

SELECT "Id", "Name", "TradingPair", "ExternalBotId"
FROM "TradingBots"
WHERE "ExternalBotId" = '4bd3725b-11ad-45ba-bddd-84edab280e93';
