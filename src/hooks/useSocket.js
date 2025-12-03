import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useOrdersStore } from '../store/ordersStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * WebSocket hook for real-time order updates
 */
export function useSocket() {
  const socketRef = useRef(null)
  const { upsertOrder } = useOrdersStore()

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(API_URL, {
      transports: ['websocket', 'polling']
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id)
      
      // Join admin orders channel
      socket.emit('join:admin')
    })

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected')
    })

    // Listen for order events
    socket.on('order:created', (order) => {
      console.log('📦 Order created:', order)
      upsertOrder(order)
    })

    socket.on('order:updated', (order) => {
      console.log('🔄 Order updated:', order)
      upsertOrder(order)
    })

    socket.on('order:closed', (order) => {
      console.log('🔒 Order closed:', order)
      upsertOrder(order)
    })

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [upsertOrder])

  return socketRef.current
}


