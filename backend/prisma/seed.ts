import { prisma } from '../src/lib/prisma.js'
import bcrypt from 'bcryptjs'

async function main() {
  const password = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', name: 'Demo User', password }
  })

  const v1 = await prisma.vehicle.upsert({
    where: { plate: 'B-1234-XYZ' },
    update: {},
    create: { plate: 'B-1234-XYZ', label: 'Truck 01' }
  })
  const v2 = await prisma.vehicle.upsert({
    where: { plate: 'B-5678-ABC' },
    update: {},
    create: { plate: 'B-5678-ABC', label: 'Van 02' }
  })

  const now = new Date()
  await prisma.trip.create({
    data: {
      vehicleId: v1.id,
      userId: user.id,
      startedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      endedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      status: 'STOPPED',
      distanceKm: 35.5
    }
  })

  console.log('Seed completed')
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})
