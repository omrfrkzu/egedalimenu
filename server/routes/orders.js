import express from 'express'
import db from '../database/db.js'

const router = express.Router()

// Helper to get io from request
const getIO = (req) => req.app.locals.io
const emitOrderEvent = (req, event, payload) => {
  const io = getIO(req)
  if (io) {
    io.to('admin:orders').emit(event, payload)
    console.log(`📡 Emitted ${event} to admin:orders channel`)
  }
}

// GET /api/orders/open - Get all open orders
router.get('/open', async (req, res) => {
  try {
    const { table_id } = req.query
    
    let query = `
      SELECT * FROM orders 
      WHERE closed_at IS NULL
    `
    const params = []
    
    if (table_id) {
      query += ' AND table_id = ?'
      params.push(parseInt(table_id))
    }
    
    query += ' ORDER BY created_at ASC'
    
    const [rows] = await db.execute(query, params)
    
    // Parse JSON items
    const orders = rows.map(row => ({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
    }))
    
    res.json(orders)
  } catch (error) {
    console.error('Error fetching open orders:', error)
    res.status(500).json({ error: 'Failed to fetch open orders' })
  }
})

// GET /api/orders/closed - Get closed orders (optional)
router.get('/closed', async (req, res) => {
  try {
    const { table_id, limit = 50 } = req.query
    
    let query = `
      SELECT * FROM orders 
      WHERE closed_at IS NOT NULL
    `
    const params = []
    
    if (table_id) {
      query += ' AND table_id = ?'
      params.push(parseInt(table_id))
    }
    
    query += ' ORDER BY closed_at DESC LIMIT ?'
    params.push(parseInt(limit))
    
    const [rows] = await db.execute(query, params)
    
    const orders = rows.map(row => ({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
    }))
    
    res.json(orders)
  } catch (error) {
    console.error('Error fetching closed orders:', error)
    res.status(500).json({ error: 'Failed to fetch closed orders' })
  }
})

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    const { table_id, items, note = '' } = req.body
    
    if (!table_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'table_id and items array are required' })
    }
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    const query = `
      INSERT INTO orders (table_id, items, note, total, status, created_at)
      VALUES (?, ?, ?, ?, 'open', NOW())
    `
    
    const [result] = await db.execute(query, [
      parseInt(table_id),
      JSON.stringify(items),
      note,
      total
    ])
    
    // Fetch created order
    const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [result.insertId])
    const order = {
      ...rows[0],
      items: typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items
    }
    
    // Emit real-time event
    emitOrderEvent(req, 'order:created', order)
    
    res.status(201).json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// POST /api/orders/:id/close - Close order (mark as paid/cancelled)
router.post('/:id/close', async (req, res) => {
  try {
    const { id } = req.params
    const { status = 'paid' } = req.body
    
    if (!['paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'status must be "paid" or "cancelled"' })
    }
    
    const query = `
      UPDATE orders 
      SET status = ?, closed_at = NOW()
      WHERE id = ? AND closed_at IS NULL
    `
    
    const [result] = await db.execute(query, [status, parseInt(id)])
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found or already closed' })
    }
    
    // Fetch updated order
    const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [parseInt(id)])
    const order = {
      ...rows[0],
      items: typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items
    }
    
    // Emit real-time event
    emitOrderEvent(req, 'order:closed', order)
    
    res.json(order)
  } catch (error) {
    console.error('Error closing order:', error)
    res.status(500).json({ error: 'Failed to close order' })
  }
})

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [parseInt(id)])
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    const order = {
      ...rows[0],
      items: typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items
    }
    
    res.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

export default router

