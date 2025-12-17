'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/context/UserContext';
import { Bell, UserPlus, UserMinus, MessageSquare, CheckCheck, Trash2, ArrowLeft } from 'lucide-react';

const NotificationsPage = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'followers', 'comments'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadNotifications();
  }, [user]);

  const loadNotifications = () => {
    setLoading(true);
    const notifKey = `notifications_${user.email}`;
    const saved = localStorage.getItem(notifKey);
    const notifs = saved ? JSON.parse(saved) : [];
    setNotifications(notifs.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setLoading(false);
  };

  const markAsRead = (notifId) => {
    const notifKey = `notifications_${user.email}`;
    const updated = notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(notifKey, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const notifKey = `notifications_${user.email}`;
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(notifKey, JSON.stringify(updated));
  };

  const deleteNotification = (notifId) => {
    const notifKey = `notifications_${user.email}`;
    const updated = notifications.filter(n => n.id !== notifId);
    setNotifications(updated);
    localStorage.setItem(notifKey, JSON.stringify(updated));
  };

  const clearAll = () => {
    if (!confirm('Are you sure you want to delete all notifications?')) return;
    const notifKey = `notifications_${user.email}`;
    localStorage.removeItem(notifKey);
    setNotifications([]);
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'followers':
        return notifications.filter(n => n.type === 'follow' || n.type === 'unfollow');
      case 'comments':
        return notifications.filter(n => n.type === 'comment');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return <UserPlus size={20} className="text-green-600" />;
      case 'unfollow':
        return <UserMinus size={20} className="text-red-600" />;
      case 'comment':
        return <MessageSquare size={20} className="text-blue-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                >
                  <CheckCheck size={18} />
                  Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition cursor-pointer"
                >
                  <Trash2 size={18} />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'unread', 'followers', 'comments'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer capitalize ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map(notif => (
              <div
                key={notif.id}
                className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition ${
                  !notif.read ? 'border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{notif.message}</p>
                      {notif.postTitle && (
                        <p className="text-sm text-gray-600 mt-1">
                          Post: <span className="font-medium">{notif.postTitle}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notif.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Mark as read"
                      >
                        <CheckCheck size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bell size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Notifications</h2>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any notifications yet"
                : `No ${filter} notifications`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;