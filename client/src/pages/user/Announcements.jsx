import React, { useEffect, useState } from 'react'
import { Badge, Box, Divider, Text } from '@chakra-ui/react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
export default function Announcements() {
  const api = useAxiosPrivate();

  const [announcements, setAnnouncements] = useState([]);
  console.log(announcements)
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await api.get('/api/user/get-announcements');
        setAnnouncements(data.announcements);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    }
    fetchAnnouncements()
  }, []);

  return (
    <Box textAlign="center" mt={8} mb={8}>
      <Text fontSize="xl" color="indigo.50" mt={0} mb={8}>
        Announcements
      </Text>

      <Box maxWidth="400px" mx="auto">
        {
          announcements.length > 0 ? (
            announcements.map((ann) => (
              <Box
                bg="white"
                boxShadow={'lg'}
                color="black"
                rounded="full"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={2}
                mb={4}
              >
                <Badge bg="green.200" fontSize="xs" rounded="full" py={1} px={2} mr={2}>
                  NEW
                </Badge>
                <Text flex="2" fontSize="sm">
                  {ann.text}
                </Text>
              </Box>

            ))
          ) : (<Box>
            No new announcements
          </Box>)
        }


        <Divider color="gray.500" />
        <Text color={'gray.300'} _hover={{ textDecoration: 'underline', cursor: 'pointer' }}>Older announcements</Text>
      </Box>
    </Box>
  )
}
