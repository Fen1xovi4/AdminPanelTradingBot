import api from './api'
import type { TradingBot, CreateBotRequest, UpdateBotRequest, Trade, BotLog } from '@/types'

export const botsApi = {
  getAll: async (): Promise<TradingBot[]> => {
    const response = await api.get<TradingBot[]>('/bots')
    return response.data
  },

  getById: async (id: number): Promise<TradingBot> => {
    const response = await api.get<TradingBot>(`/bots/${id}`)
    return response.data
  },

  create: async (data: CreateBotRequest): Promise<TradingBot> => {
    const response = await api.post<TradingBot>('/bots', data)
    return response.data
  },

  update: async (id: number, data: UpdateBotRequest): Promise<TradingBot> => {
    const response = await api.put<TradingBot>(`/bots/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/bots/${id}`)
  },

  getTrades: async (botId: number): Promise<Trade[]> => {
    const response = await api.get<Trade[]>(`/trades/bot/${botId}`)
    return response.data
  },

  getLogs: async (botId: number, limit = 100): Promise<BotLog[]> => {
    const response = await api.get<BotLog[]>(`/logs/bot/${botId}?limit=${limit}`)
    return response.data
  },
}
