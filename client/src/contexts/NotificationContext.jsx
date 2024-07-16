import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  console.log(notifications)
  const addNotification = (notification) => {
    setNotifications((prevNotifications) => [...prevNotifications, notification]);
  };

  const removeNotification = (id) => {
    setNotifications((prevNotifications) => prevNotifications.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prevNotifications) => {
        if (prevNotifications.length === 0) {
          return prevNotifications;
        }
        const updatedNotifications = [...prevNotifications];
        updatedNotifications.shift();
        return updatedNotifications;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationsContext);
};