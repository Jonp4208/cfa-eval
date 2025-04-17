import { z } from 'zod'

export const createWasteSchema = z.object({
  date: z.string().datetime(),
  category: z.enum(['food', 'packaging', 'other']),
  itemName: z.string().min(1, 'Item name is required').max(100),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required').max(20),
  cost: z.number().min(0, 'Cost cannot be negative'),
  reason: z.string().min(1, 'Reason is required').max(500),
  actionTaken: z.string().max(500).optional()
})

export const updateWasteSchema = createWasteSchema.partial()

export const getWasteListSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.enum(['food', 'packaging', 'other']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional()
})

export const getWasteMetricsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  category: z.enum(['food', 'packaging', 'other']).optional()
}) 