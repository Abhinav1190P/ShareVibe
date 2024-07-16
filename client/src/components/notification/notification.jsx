import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import io from 'socket.io-client'
import { Flex, Box, Avatar, Badge, Text } from '@chakra-ui/react'
let connection_port = 'http://localhost:4000/'
let socket;
const NotificationComponent = ({ info }) => {

    const { notifications, removeNotification } = useNotifications();
    const api = useAxiosPrivate();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recievedNotifications, setRecievedNotifications] = useState([])
    useEffect(() => {
        socket = io(connection_port, {
            transports: ['websocket', 'polling']
        });

        return () => {
            socket.disconnect();
        };
    }, [connection_port]);

    useEffect(() => {
        socket.on('notification', ({ notifications }) => {
            setRecievedNotifications(notifications)
        })
    }, [])
    console.log(notifications)
    useEffect(() => {
        api
            .get("/api/user/profile")
            .then(({ data }) => {
                setUserInfo(data);
                socket.emit('joinNotification', { room: 'private-notification' })
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [api]);

    useEffect(() => {
        if (notifications.length > 0) {

            socket.emit('sendNotification', { room: 'private-notification', notifications });

        } else {
            socket.emit('sendNotification', { room: 'private-notification', notifications: [] });
        }
    }, [notifications]);

    const filteredNotifications = recievedNotifications.filter(notification => {
        if (notification.type === 'announcement' || notification.type === 'event') {
            return true;
        } else {
            return notification.id === userInfo?._id && (notification.liked === undefined || !notification.liked);
        }
    });

    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <>
            {userInfo && filteredNotifications.length > 0 && (
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '9999' }}>
                    {filteredNotifications.map((notification) => (
                        <Flex key={notification.id}>
                            <Avatar src={notification.profile ? notification.profile : null} />
                            <Box ml='3'>
                                <Text fontWeight='bold'>
                                    {notification.name}
                                    <Badge ml='1' colorScheme='green'>
                                        New
                                    </Badge>
                                </Text>
                                <Text fontSize='sm'>{notification.message}</Text>
                            </Box>
                        </Flex>
                    ))}
                </div>
            )}

        </>
    );
};

export default NotificationComponent;


