export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface TradingBot {
  id: number
  name: string
  description: string
  strategy: string
  exchange: string
  account?: string
  tradingPair: string
  externalBotId?: string
  initialBalance: number
  currentBalance: number
  status: string
  createdAt: string
  lastActiveAt?: string
  userId: number
  statistics?: BotStatistics
}

export interface BotStatistics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  totalProfit: number
  totalLoss: number
  netProfit: number
  winRate: number
  averageProfit: number
  averageLoss: number
  maxDrawdown: number
  updatedAt: string
}

export interface CreateBotRequest {
  name: string
  description: string
  strategy: string
  exchange: string
  tradingPair: string
  initialBalance: number
}

export interface UpdateBotRequest {
  name?: string
  description?: string
  strategy?: string
  status?: string
}

export interface Trade {
  id: number
  botId: number
  type: string
  tradingPair: string
  amount: number
  price: number
  total: number
  fee: number
  profitLoss: number
  executedAt: string
  externalOrderId?: string
}

export interface BotLog {
  id: number
  botId: number
  level: string
  message: string
  details?: string
  createdAt: string
}

export interface TradeHistory {
  id: number
  botId: number
  tradingPair: string
  positionSide: string
  entryPrice: number
  exitPrice: number
  positionSize: number
  realizedPnL: number
  status: 'Success' | 'Loss' | 'Error'
  errorMessage?: string
  openedAt: string
  closedAt: string
}

export interface CreateTradeHistoryRequest {
  tradingPair: string
  positionSide: string
  entryPrice: number
  exitPrice: number
  positionSize: number
  realizedPnL: number
  status: 'Success' | 'Loss' | 'Error'
  errorMessage?: string
  openedAt: string
  closedAt?: string
}
