import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { botsApi } from '@/services/botsApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const createBotSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  strategy: z.string().min(1, 'Strategy is required'),
  exchange: z.string().min(1, 'Exchange is required'),
  tradingPair: z.string().min(1, 'Trading pair is required'),
  initialBalance: z.number().min(0, 'Initial balance must be positive'),
})

type CreateBotForm = z.infer<typeof createBotSchema>

interface CreateBotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateBotDialog({ open, onOpenChange }: CreateBotDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBotForm>({
    resolver: zodResolver(createBotSchema),
    defaultValues: {
      description: '',
      initialBalance: 1000,
    },
  })

  const createMutation = useMutation({
    mutationFn: botsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] })
      toast({
        title: 'Success',
        description: 'Bot created successfully',
      })
      reset()
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create bot',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: CreateBotForm) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Trading Bot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bot Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="strategy">Strategy</Label>
            <Input id="strategy" placeholder="e.g., Grid Trading" {...register('strategy')} />
            {errors.strategy && (
              <p className="text-sm text-destructive">{errors.strategy.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="exchange">Exchange</Label>
            <Input id="exchange" placeholder="e.g., Binance" {...register('exchange')} />
            {errors.exchange && (
              <p className="text-sm text-destructive">{errors.exchange.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tradingPair">Trading Pair</Label>
            <Input id="tradingPair" placeholder="e.g., BTC/USDT" {...register('tradingPair')} />
            {errors.tradingPair && (
              <p className="text-sm text-destructive">{errors.tradingPair.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="initialBalance">Initial Balance</Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              {...register('initialBalance', { valueAsNumber: true })}
            />
            {errors.initialBalance && (
              <p className="text-sm text-destructive">{errors.initialBalance.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Bot'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
