import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import ordersRouter from './routes/orders.js'

dotenv.config()

// Set timezone
process.env.TZ = 'Europe/Istanbul'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/orders', ordersRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
})

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id)
  
  // Join admin orders channel
  socket.on('join:admin', () => {
    socket.join('admin:orders')
    console.log('📢 Client joined admin:orders channel:', socket.id)
  })
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id)
  })
})

// Helper function to emit order events
export function emitOrderEvent(event, payload) {
  io.to('admin:orders').emit(event, payload)
  console.log(`📡 Emitted ${event} to admin:orders channel`)
}

// Make io available to routes
app.locals.io = io
app.locals.emitOrderEvent = emitOrderEvent

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🌍 Timezone: ${process.env.TZ || 'Europe/Istanbul'}`)
})


