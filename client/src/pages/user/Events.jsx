import React, { useEffect, useState } from 'react';
import { Badge, Box, Button, Divider, HStack, Text, VStack } from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  ModalCloseButton,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react'
import { FaBell } from 'react-icons/fa';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import Notification from './NotificationToast';
import { CheckCircleIcon } from "@chakra-ui/icons";

export default function Events() {
  const api = useAxiosPrivate();
  const [events, setEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/api/user/get-events');
        setEvents(data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [api]);

  const handleCreateReminder = async (event) => {
    try {
      const reminderTime = new Date(event.date).getTime() - 24 * 60 * 60 * 1000;
      const response = await api.post('/api/user/create-reminder', {
        title: event.title,
        eventId: event._id,
        reminderTime
      });
      alert(`Reminder created for event: ${event.title}`);
    } catch (error) {
      console.error('Error creating reminder:', error);
      if (error.response && error.response.status === 409) {
        alert('Reminder already exists for this event.');
      } else {
        alert('Failed to create reminder.');
      }
    }
  };

  const handleFetchReminders = async () => {
    try {
      const { data } = await api.get('/api/user/get-user-reminders');
      setReminders(data.reminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return ''; // Return empty string if dateString is falsy

    const formattedDate = new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return formattedDate;
  };
  return (
    <Box textAlign="center" mt={8} mb={8}>
      <Text fontSize="xl" color="indigo.50" mt={0} mb={8}>
        Events
      </Text>
      <Box maxWidth="max-content" mx="auto">
        {events.length > 0 ? (
          events.map((ann) => (
            <Box
              key={ann._id}
              bg="white"
              boxShadow={'lg'}
              color="black"
              rounded="full"
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              p={2}
              mb={4}
            >
              <VStack w="100%" justifyContent={'flex-start'} alignItems={'flex-start'}>
                <HStack justifyContent={'space-between'} w="100%" spacing={0}>
                  <HStack>
                    <Badge p={2} bg="green.200" fontSize="xs" rounded="full" py={1} px={2} mr={2}>
                      NEW
                    </Badge>
                    <Text borderRadius={10} color={'white'} pt={1} pr={3} pb={1} pl={3} bg={'blue.300'} flex="2" fontSize="sm">
                      {ann.title}
                    </Text>
                  </HStack>
                  <Box pr={3}>
                    <Text fontSize={'small'}>
                      {ann.date}
                    </Text>
                  </Box>
                </HStack>
                <Text pl={3} flex="2" fontSize="sm">
                  {ann.description}
                </Text>
              </VStack>
              <Box ml={4}>
                <Button borderRadius={10} bg={'blue.200'} onClick={() => handleCreateReminder(ann)}>
                  Create Reminder
                </Button>
              </Box>
            </Box>
          ))
        ) : (
          <Box>No new events</Box>
        )}

        <Notification />
        <Divider color="gray.500" />
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Your reminders</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {reminders.length > 0 ? (
                <List spacing={3}>
                  {reminders.map((reminder) => (
                    <ListItem key={reminder.id} display="flex" alignItems="center">
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      <VStack>
                        <Text fontSize="md" fontWeight="medium">
                          {reminder?.event.title}
                        </Text>
                        <Text>Reminder set on {formatDate(reminder?.reminderTime)}</Text>
                      </VStack>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" mt={4}>
                  <Text fontSize="lg" color="gray.500">
                    No reminders available.
                  </Text>
                </Box>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={onClose}>
                Close
              </Button>
              <Button variant='ghost'>Secondary Action</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <HStack justifyContent="center" mt={4} spacing={4}>
          <Text color={'gray.300'} _hover={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={handleFetchReminders}>
            Older announcements
          </Text>
          <FaBell cursor="pointer" onClick={() => { onOpen(); handleFetchReminders() }} />
        </HStack>
        {reminders.length > 0 && (
          <Box mt={4}>
            <Text fontSize="lg" color="gray.300" mb={2}>
              Reminders
            </Text>
            {reminders.map((reminder) => (
              <Box key={reminder._id} p={2} bg="gray.100" mb={2} rounded="md">
                <Text>{reminder.title}</Text>
                <Text fontSize="sm" color="gray.600">
                  {new Date(reminder.reminderTime).toLocaleString()}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
