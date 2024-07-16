import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Container, Text, VStack, FormControl, FormLabel, Input, Button, useToast } from '@chakra-ui/react';
import InputEmoji from 'react-input-emoji'
import { useNotifications } from '../../contexts/NotificationContext'

const Profile = () => {
  const api = useAxiosPrivate();
  const [info, setInfo] = useState(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const toast = useToast()
  const { addNotification } = useNotifications();

  useEffect(() => {
    api
      .get("/api/admin/profile")
      .then(({ data }) => {
        setInfo(data);
      })
      .catch((error) => {
        setInfo(null);
        console.log(error);
      });
  }, []);
  console.log(info)

  const handleCreateAnnouncement = async () => {

    if (!announcementText) {
      toast({
        title: "Provide announcement text",
        status: 'error',
        duration: 9000,
        position: 'top',
        isClosable: true,
      })
      return
    }

    try {
      await api.post('/api/admin/create-announcement', { announcementText });
      setAnnouncementText('');
      toast({
        title: 'Created announcements',
        status: 'success',
        duration: 9000,
        position: 'top',
        isClosable: true,
      })
      addNotification({ type: 'announcement', message: `New announcement!`, announcementText });

    } catch (error) {
      toast({
        title: error.message,
        status: 'error',
        duration: 9000,
        position: 'top',
        isClosable: true,
      })
    }
  };

  const handleCreateEvent = async () => {

    if (!eventTitle || !eventDescription || !eventDate) {
      toast({
        title: "Provide all details",
        status: 'error',
        duration: 9000,
        position: 'top',
        isClosable: true,
      })
      return
    }
    try {
      await api.post('/api/admin/create-events', { eventTitle, eventDescription, eventDate });
      setEventTitle('');
      setEventDescription('');
      setEventDate('');
      toast({
        title: 'Created event',
        status: 'success',
        duration: 9000,
        position: 'top',
        isClosable: true,
      })
      addNotification({ type: 'event', message: `New event!`, eventTitle, eventDescription, eventDate });

    } catch (error) {
      toast({
        title: error.message,
        status: 'error',
        duration: 9000,
        position: 'top',
        isClosable: true,
      })
    }
  };

  return (
    <Container>

      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Announcement Text</FormLabel>
          <InputEmoji
            value={announcementText}
            onChange={setAnnouncementText}
            cleanOnEnter
            placeholder={`What's the announcement about, ${info ? info.name : null}?`}
          />
        </FormControl>
        <Button colorScheme="blue" onClick={handleCreateAnnouncement}>Create Announcement</Button>
      </VStack>

      <VStack spacing={4} mt={4}>
        <FormControl>
          <FormLabel>Event Title</FormLabel>
          <InputEmoji
            value={eventTitle}
            onChange={setEventTitle}
            cleanOnEnter
            placeholder={`What's the event about, ${info ? info.name : null}?`}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Event Description</FormLabel>
          <InputEmoji
            value={eventDescription}
            onChange={setEventDescription}
            cleanOnEnter
            placeholder={`Some description about the event?`}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Event Date</FormLabel>
          <Input borderRadius={20} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </FormControl>
        <Button colorScheme="green" onClick={handleCreateEvent}>Create Event</Button>
      </VStack>


    </Container>
  );
};

export default Profile;
