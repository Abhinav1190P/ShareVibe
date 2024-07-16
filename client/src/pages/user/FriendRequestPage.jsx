import React, { useEffect, useState } from 'react'
import { Box, Flex, Button, Text, Image, VStack, HStack, IconButton } from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
export default function FriendRequestPage() {

  const api = useAxiosPrivate()
  const [friendRequests, setfriendRequests] = useState([])

  useEffect(() => {
    const fetchFriendRequests = async () => {
      await api.get('/api/user/get-friend-requests')
        .then(({ data }) => {
          if (data && data.requests?.length > 0) {
            setfriendRequests(data.requests)
          }
          else {
            setfriendRequests([])
          }
        }).catch((error) => {
          console.log(error)
        })
    }
    fetchFriendRequests()
  }, [])

  const HandleAcceptFriendRequest = async (from, friend) => {
    try {
      await api.post('/api/user/accept-friend-request', { ofUser: from?.userId })
        .then(({ data }) => {
          if (data) {
            const updatedFriendRequests = friendRequests.filter(request => request._id !== friend._id);
            setfriendRequests(updatedFriendRequests);
          }
        }).catch((error) => {
          console.log(error);
        })
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Flex mt={10} boxShadow={'lg'} w={'100%'} h="92vh" flexDirection={'column'} justifyContent={'flex-start'} alignItems={'center'}>
      {
        friendRequests.length > 0 ? (
          friendRequests.map((friendR, i) => (
            <Flex
              mb={5}
              boxShadow={'lg'}
              p={8}
              w="70%"
              h="max-content"
              borderRadius="10px"
              display="flex"
              flexDirection="row"
              alignItems="flex-start"
              justifyContent={'center'}
            >
              <VStack w="40%" alignItems={'center'}>
                <Image
                  src={friendR?.from?.profile_photo}
                  alt="user Avatar"
                  borderRadius="50%"
                  mt="-20px"
                  border="6px solid #4364f7"
                  h="50px"
                  w="50px"
                  objectFit="cover"
                />
                <Text
                  fontWeight="600"
                  mt="10px"
                  fontSize="20px"
                >
                  {friendR?.from?.userName}
                </Text>
                <Text color="#6e8ca0" mt="10px" fontSize="14px">
                  Sent you a Friend Request!
                </Text>
              </VStack>

              <Flex alignItems={'center'} justifyContent={'flex-end'} w="60%" h="100%">
                <HStack spacing={2}>
                  <IconButton onClick={() => HandleAcceptFriendRequest(friendR.from, friendR)} _hover={{ bg: 'green.400' }} bg={'green.200'}>
                    <FaCheck color={'green.300'} />
                  </IconButton>
                  <IconButton _hover={{ bg: 'red.400' }} bg={'red.200'}>
                    <RxCross2 color={'white'} />
                  </IconButton>
                </HStack>
              </Flex>
            </Flex>
          ))
        ) : (<Box>
          No friend requests yet
        </Box>)
      }

    </Flex>
  )
}
