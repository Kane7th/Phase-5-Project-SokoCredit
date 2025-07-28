import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

// socket instance reference
let socket

const NotificationListener = ({ userId }) => {
  const reconnectRef = useRef(null)

  useEffect(() => {
    if (!userId) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    // Connect to the socket server using auth object
    socket = io('http://localhost:5000/notifications', {
      auth: {
        token,
      },
      autoConnect: true,
      reconnection: true,
    })

    // Listen for notifications
    socket.on('notification', (data) => {
      console.log('📥 New Notification:', data)
      // handle notification (toast, modal, etc.)
    })

    // Optional: Listen for auth errors (e.g. expired token)
    socket.on('connect_error', (err) => {
      if (err.message === 'Signature has expired') {
        console.warn('⚠️ Socket token expired. Attempting reconnection...')

        // Get a new token however your app handles refresh
        const newToken = localStorage.getItem('accessToken')
        if (newToken) {
          socket.auth.token = newToken
          socket.connect()
        }
      } else {
        console.error('Socket connection error:', err.message)
      }
    })

    return () => {
      if (socket) socket.disconnect()
    }
  }, [userId])

  return null // headless component
}

export default NotificationListener
