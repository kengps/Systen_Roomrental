import api from "../api";

// API service for notification operations
class NotificationAPI {
    constructor() {
        this.baseURL = `${import.meta.env.VITE_REACT_APP_API}/notifications`;
    }

    // Get authorization header
    getAuthHeaders() {
        const token = localStorage.getItem('token');

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Load all notifications
    async loadNotifications() {
        try {
            const response = await api.get(this.baseURL, {
                headers: this.getAuthHeaders()
            });
            console.log(`⩇⩇:⩇⩇🚨 ~ response :`, response);



            if (!response.data.success) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (response.data.success) {
                return {
                    notifications: response?.data?.data?.notifications || [],
                    unreadCount: response?.data?.data?.unreadCount || 0
                };
            } else {
                throw new Error(data.message || 'Failed to load notifications');
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            throw error;
        }
    }

    // Mark single notification as read
    async markAsRead(notificationId) {



        try {

            const response = await fetch(`${this.baseURL}/${notificationId}/read`, {
                method: 'PATCH',
                headers: this.getAuthHeaders()
            });



            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
           

            if (!data.success) {
                throw new Error(data.message || 'Failed to mark notification as read');
            }

            return data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Mark all notifications as read
    async markAllAsRead() {
        try {

            const response = await api.patch(`${this.baseURL}/mark-all-read`);
          

            if (!response.data.success) {
                throw new Error(data.message || 'Failed to mark all notifications as read');
            }

            return response;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Delete notification
    async deleteNotification(notificationId) {
        try {
            const response = await fetch(`${this.baseURL}/${notificationId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to delete notification');
            }

            return data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // Get notification preferences
    async getPreferences() {
        try {
            const response = await fetch(`${this.baseURL}/preferences`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading notification preferences:', error);
            throw error;
        }
    }

    // Update notification preferences
    async updatePreferences(preferences) {
        try {
            const response = await fetch(`${this.baseURL}/preferences`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(preferences)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to update preferences');
            }

            return data;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    }
}

// Create singleton instance
const notificationAPI = new NotificationAPI();

export default notificationAPI;