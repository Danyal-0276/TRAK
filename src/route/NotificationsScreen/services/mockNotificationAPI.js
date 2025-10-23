// src/route/NotificationsScreen/services/mockNotificationAPI.js
class MockNotificationAPI {
  constructor() {
    this.notifications = [
      {
        id: "1",
        type: "mention",
        text: "John mentioned you in a comment",
        keyword: "design",
        time: "2h ago",
        read: false,
        important: true,
        details: "John said: '@Shahroz Your design work is amazing! The attention to detail in the latest project really stands out. #design'",
        user: "John Doe",
        avatar: "👤",
        postTitle: "Latest Design Project"
      },
      {
        id: "2",
        type: "keyword",
        text: "New post matching your keyword",
        keyword: "react",
        time: "5h ago",
        read: false,
        important: false,
        details: "A new post about React Native animations has been published. It covers advanced animation techniques and performance optimization.",
        user: "React Team",
        avatar: "⚛️",
        postTitle: "Advanced React Native Animations"
      },
      {
        id: "3",
        type: "like",
        text: "Sarah liked your post",
        keyword: null,
        time: "1d ago",
        read: true,
        important: false,
        details: "Sarah liked your post about 'Building Scalable React Applications'. She's been following your work for a while.",
        user: "Sarah Smith",
        avatar: "👩",
        postTitle: "Building Scalable React Applications"
      },
      {
        id: "4",
        type: "comment",
        text: "Mike replied to your comment",
        keyword: null,
        time: "1d ago",
        read: false,
        important: true,
        details: "Mike replied: 'Great points! I especially agree with your approach to state management. Have you considered using Redux Toolkit?'",
        user: "Mike Johnson",
        avatar: "👨",
        postTitle: "State Management Discussion"
      },
      {
        id: "5",
        type: "follow",
        text: "New follower: Design Community",
        keyword: null,
        time: "2d ago",
        read: true,
        important: false,
        details: "Design Community started following you. They share daily design inspiration and tips for designers.",
        user: "Design Community",
        avatar: "🎨",
        postTitle: null
      },
      {
        id: "6",
        type: "mention",
        text: "Alex tagged you in a post",
        keyword: "coding",
        time: "3d ago",
        read: false,
        important: true,
        details: "Alex mentioned you in a post about coding best practices. They referenced your article on React patterns.",
        user: "Alex Chen",
        avatar: "💻",
        postTitle: "Coding Best Practices 2024"
      }
    ];
  }

  async getNotifications() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.notifications];
  }

  async markAsRead(notificationId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    return notification;
  }

  async markAllAsRead() {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    return [...this.notifications];
  }

  async getNotificationDetails(notificationId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.notifications.find(n => n.id === notificationId);
  }
}

export default new MockNotificationAPI();