import React, { useEffect, useState } from 'react'
import { Box, VStack, Card, CardHeader, CardBody, CardFooter, Button, Image, StackDivider,Stack, Text, Heading, useColorModeValue, AvatarGroup, Avatar, HStack } from '@chakra-ui/react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { useNavigate } from 'react-router-dom'
export default function EventsNews() {
  const [friends, setFriends] = useState([])
  const [events, setevents] = useState([])
  const api = useAxiosPrivate()
  const nav = useNavigate()

  const HandleFetchFriends = async () => {
    try {
      await api.get('/api/user/get-my-friends')
        .then(({ data }) => {
          if (data?.users.length > 0) {
            setFriends(data.users)
            console.log(data?.users)

          }
        }).catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    HandleFetchFriends()
  }, [])



  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await api.get('/api/user/get-events');
        setevents(data.events);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    }
    fetchAnnouncements()
  }, []);


  function calculatePostedTime(createdAt) {
    const currentDate = new Date();
    const postedDate = new Date(createdAt);
    const timeDifference = currentDate - postedDate;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
  }
  return (
    <VStack bg={useColorModeValue('white', '#1A202C')} p={3} w="100%">
      <Card mb={5} w="sm">
        <CardHeader>
          <Heading size='md'>Your friends</Heading>
        </CardHeader>
        <CardBody>
          <AvatarGroup spacing={2} size='md' max={7}>
            {
              friends.length > 0 ? (
                friends.map((friend, i) => {
                  console.log(friend)
                  return (
                    <Avatar key={i} onClick={() => { nav(`/user/search/${friend.userName}`) }} name={friend.name} src={friend.profile_photo} />
                  )
                })
              ) : (null)
            }


          </AvatarGroup>
        </CardBody>
      </Card>

      <Card size={'lg'}>
  <CardHeader>
    <Heading size='md'>Upcoming events</Heading>
  </CardHeader>

  <CardBody>
    <Stack divider={<StackDivider />} spacing='4'>
      {
        events.length > 0 ? (
          events.slice(0, 2).map((event,i)=>(
            <Box>
            <Heading size='xs' textTransform='uppercase'>
              {event.title}
            </Heading>
            <Text pt='2' fontSize='sm'>
            {event.description}
            </Text>
          </Box>
          ))
        ):(<Box>No upcoming events</Box>)
      }

     
    </Stack>
  </CardBody>
</Card>
    </VStack>
  )
}


