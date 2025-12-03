/**
 * API utility functions
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Create a new order
 */
export async function createOrder(tableId, items, note = '') {
  try {
    const response = await fetch(`${API_URL}/api/orders`, {
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
    
    return await response.json()
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

/**
 * Close an order
 */
export async function closeOrder(orderId, status = 'paid') {
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })
    
    if (!response.ok) {
      throw new Error('Failed to close order')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error closing order:', error)
    throw error
  }
}


