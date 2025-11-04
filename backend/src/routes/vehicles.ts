import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

const router = Router()

const listQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  query: z.string().optional()
})

router.get('/', async (req: Request, res: Response) => {
  const { page, limit, query } = listQuery.parse(req.query)
  const where: Prisma.VehicleWhereInput = query
    ? {
        OR: [
          { plate: { contains: query, mode: 'insensitive' as const } },
          { label: { contains: query, mode: 'insensitive' as const } }
        ]
      }
    : {}
  const [items, total] = await Promise.all([
    prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.vehicle.count({ where })
  ])
  res.json({ items, total, page, limit })
})

const statusParams = z.object({ id: z.string().min(1) })
const statusQuery = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })

router.get('/:id/status', async (req: Request, res: Response) => {
  const { id } = statusParams.parse(req.params)
  const { date } = statusQuery.parse(req.query)
  const start = new Date(`${date}T00:00:00.000Z`)
  const end = new Date(`${date}T23:59:59.999Z`)
  const trips = await prisma.trip.findMany({ where: { vehicleId: id, startedAt: { lte: end }, OR: [{ endedAt: null }, { endedAt: { gte: start } }] } })
  const result: Record<'RUNNING' | 'IDLE' | 'STOPPED', number> = { RUNNING: 0, IDLE: 0, STOPPED: 0 }
  for (const t of trips) {
    result[t.status]++
  }
  res.json({ date, counts: result })
})

export default router
