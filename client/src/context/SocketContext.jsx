import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../services/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { info, success } = useToast();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Fetch initial unread count
  useEffect(() => {
    if (token) {
      api
        .get('/notifications?limit=1')
        .then((res) => {
          if (res.data?.data?.unreadCount !== undefined) {
            setUnreadNotificationsCount(res.data.data.unreadCount);
          }
        })
        .catch(() => {});

      api
        .get('/messages/conversations')
        .then((res) => {
          if (res.data?.data?.conversations) {
            const count = res.data.data.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
            setUnreadMessagesCount(count);
          }
        })
        .catch(() => {});
    } else {
      setUnreadNotificationsCount(0);
      setUnreadMessagesCount(0);
    }
  }, [token]);

  // Manage socket connection
  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketServerUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      window.location.origin;

    const socketInstance = io(socketServerUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      // connected
    });

    socketInstance.on('online_users_list', (usersList) => {
      setOnlineUsers(new Set(usersList));
    });

    socketInstance.on('user_status_changed', ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === 'online') {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    socketInstance.on('new_notification', (notification) => {
      setUnreadNotificationsCount((prev) => prev + 1);
      info(`🔔 ${notification.title}: ${notification.message}`);
    });

    socketInstance.on('new_message', (message) => {
      setUnreadMessagesCount((prev) => prev + 1);
      info(`💬 Message from ${message.sender?.name || 'Someone'}: ${message.message.slice(0, 50)}`);
    });

    socketInstance.on('new_announcement', (announcement) => {
      info(`📢 Campus Announcement: ${announcement.title}`);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
        unreadMessagesCount,
        setUnreadMessagesCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
