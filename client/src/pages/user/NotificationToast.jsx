import React, { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { requestForToken, onMessageListener } from '../../firebase';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const NotificationToast = () => {
    const toast = useToast();
    const [notification, setNotification] = useState({ title: '', body: '' });
    const api = useAxiosPrivate();

    const notify = () => {
        return toast({
            title: notification.title,
            description: notification.body,
            status: 'info',
            position: 'top',
            duration: 5000,
            isClosable: true,
        });
    };

    const requestNotificationPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await requestForToken();
                if (token) {
                    try {
                        const { data } = await api.post('/api/user/create-fcm-token', { token });
                        console.log(data)
                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    console.log('No FCM token obtained');
                }
            } else {
                console.log('Notification permission denied');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    };

    useEffect(() => {
        if (notification?.title) {
            notify();
        }
    }, [notification]);

    useEffect(() => {
        requestNotificationPermission();

        onMessageListener()
            .then((payload) => {
                setNotification({ title: payload?.notification?.title, body: payload?.notification?.body });
            })
            .catch((err) => console.log('failed: ', err));
    }, []);

    return null;
};

export default NotificationToast;
