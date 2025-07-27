import api from './api'

export const notificationService = {
  // Get all notifications for current user
  getNotifications: async () => {
    const response = await api.get('/api/users/notifications')
    return response
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/api/users/notifications/${notificationId}/read`)
    return response
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/api/users/notifications/${notificationId}`)
    return response
  }
}
