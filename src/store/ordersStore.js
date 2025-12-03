import { create } from 'zustand'

/**
 * Order type definition
 * @typedef {Object} Order
 * @property {number} id
 * @property {number} table_id
 * @property {string} status - 'open' | 'paid' | 'cancelled'
 * @property {Array} items
 * @property {string|null} note
 * @property {number} total
 * @property {string} created_at
 * @property {string|null} closed_at
 */

/**
 * Orders store for managing orders state
 * Handles real-time updates via WebSocket
 */
export const useOrdersStore = create((set, get) => ({
  // Open orders (closed_at IS NULL)
  openOrders: [],
  
  // Closed orders (for history view)
  closedOrders: [],
  
  // Loading state
  loading: false,
  error: null,
  
  // Actions
  setOpenOrders: (orders) => set({ openOrders: orders }),
  
  setClosedOrders: (orders) => set({ closedOrders: orders }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  /**
   * Upsert order (add or update)
   * If closed_at is set, removes from openOrders
   */
  upsertOrder: (order) => {
    const state = get()
    
    // If order is closed, remove from open orders
    if (order.closed_at) {
      const openOrders = state.openOrders.filter(o => o.id !== order.id)
      const closedOrders = [...state.closedOrders]
      const existingIndex = closedOrders.findIndex(o => o.id === order.id)
      
      if (existingIndex >= 0) {
        closedOrders[existingIndex] = order
      } else {
        closedOrders.unshift(order)
      }
      
      set({ openOrders, closedOrders })
      return
    }
    
    // Order is open, update or add to openOrders
    const openOrders = [...state.openOrders]
    const existingIndex = openOrders.findIndex(o => o.id === order.id)
    
    if (existingIndex >= 0) {
      openOrders[existingIndex] = order
    } else {
      openOrders.unshift(order)
    }
    
    set({ openOrders })
  },
  
  /**
   * Remove order from open orders
   */
  removeOrder: (orderId) => {
    const state = get()
    set({ 
      openOrders: state.openOrders.filter(o => o.id !== orderId) 
    })
  },
  
  /**
   * Close order (mark as paid/cancelled)
   */
  closeOrder: async (orderId, status = 'paid') => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error('Failed to close order')
      }
      
      const order = await response.json()
      get().upsertOrder(order)
      return order
    } catch (error) {
      console.error('Error closing order:', error)
      get().setError(error.message)
      throw error
    }
  },
  
  /**
   * Fetch open orders from API
   */
  fetchOpenOrders: async () => {
    const { setLoading, setError, setOpenOrders } = get()
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/orders/open')
      if (!response.ok) {
        throw new Error('Failed to fetch open orders')
      }
      
      const orders = await response.json()
      setOpenOrders(orders)
    } catch (error) {
      console.error('Error fetching open orders:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  },
  
  /**
   * Fetch closed orders from API
   */
  fetchClosedOrders: async (limit = 50) => {
    const { setLoading, setError, setClosedOrders } = get()
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`http://localhost:3001/api/orders/closed?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch closed orders')
      }
      
      const orders = await response.json()
      setClosedOrders(orders)
    } catch (error) {
      console.error('Error fetching closed orders:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  },
  
  /**
   * Create new order
   */
  createOrder: async (tableId, items, note = '') => {
    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          table_id: tableId,
          items,
          note
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create order')
      }
      
      const order = await response.json()
      get().upsertOrder(order)
      return order
    } catch (error) {
      console.error('Error creating order:', error)
      get().setError(error.message)
      throw error
    }
  }
}))


