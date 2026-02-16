import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { BarChart3, TrendingUp, Activity, LogIn } from 'lucide-react'
import { publicAnalyticsApi } from '@/services/publicAnalyticsApi'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

type ProfitPeriod = '7' | '30' | '90' | 'all'

export function PublicDashboardPage() {
  const [period, setPeriod] = useState<ProfitPeriod>('all')
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicAnalytics', period],
    queryFn: () => publicAnalyticsApi.getAnalytics(period),
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">CryptoPizza</h1>
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        </header>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">CryptoPizza</h1>
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        </header>
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          <div className="text-center">
            <p className="text-lg">Failed to load analytics</p>
            <p className="text-sm mt-1">Please try again later</p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = data.chartData.map(point => ({
    ...point,
    pnl: Number(point.pnl),
  }))

  const lastPnl = chartData.length > 0 ? chartData[chartData.length - 1].pnl : 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 sm:px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">CryptoPizza</h1>
        <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Button>
      </header>

      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Trading Performance</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Public trading statistics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <div className="flex items-center gap-1">
                {(['7', '30', '90', 'all'] as ProfitPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                      period === p
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {p === 'all' ? 'All' : p}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${data.totalProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {period === 'all' ? 'All time' : `Last ${period} days`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalTrades}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.winningTrades} winning ({period === 'all' ? 'all time' : `${period}d`})
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.winRate >= 50 ? 'text-green-600' : 'text-orange-600'}`}>
                {data.winRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {period === 'all' ? 'All time' : `Last ${period} days`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.activeBots}</div>
              <p className="text-xs text-muted-foreground mt-1">
                of {data.totalBots} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Chart</CardTitle>
            <CardDescription>
              Cumulative realized PnL ({period === 'all' ? 'all time' : `last ${period} days`})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPnlPositivePublic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPnlNegativePublic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const point = payload[0].payload
                          return (
                            <div className="bg-popover border rounded-lg shadow-lg p-3">
                              <p className="text-sm text-muted-foreground">{point.fullDate}</p>
                              <p className={`text-sm font-semibold ${point.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                PnL: ${point.pnl.toFixed(2)}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="pnl"
                      stroke={lastPnl >= 0 ? '#22c55e' : '#ef4444'}
                      strokeWidth={2}
                      fill={lastPnl >= 0 ? 'url(#colorPnlPositivePublic)' : 'url(#colorPnlNegativePublic)'}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No trading data yet</p>
                  <p className="text-sm mt-1">Check back later for performance data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
