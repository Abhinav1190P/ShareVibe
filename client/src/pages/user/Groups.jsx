import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Flex, Input, Button, Avatar, Image, Text, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
  FormControl,
  FormLabel,
  GridItem,
  Checkbox,
  ListItem,
  HStack,
  List,
  InputGroup, InputRightElement, Spinner,
  VStack, useToast, IconButton, useColorModeValue
} from "@chakra-ui/react";
import { FaEllipsisV } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";

import { CiSearch } from "react-icons/ci";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client'
import moment from 'moment';
import { MdPermMedia } from "react-icons/md";
import axios from 'axios';
import { MdDelete } from "react-icons/md";
let connection_port = 'http://localhost:4000/'
let socket;

export default function Groups() {

  const api = useAxiosPrivate()
  const [conversations, setConversations] = useState([])
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { isOpen: isOpenGroupsetting, onOpen: onOpenGroupSettings, onClose: onCloseGroupSettings } = useDisclosure()
  const { isOpen: isOpenUploadMedia, onOpen: onOpenUploadMedia, onClose: onCloseUploadMedia } = useDisclosure()

  const [groupName, setGroupName] = useState('')
  const [userNameKeyword, setUserNameKeyword] = useState()
  const [info, setInfo] = useState({})
  const [myFriends, setMyfriends] = useState([])
  const [selectedFriends, setSelectedFriends] = useState([]);
  const nav = useNavigate()
  const toast = useToast()

  const fileInputRef = useRef(null)
  const [currentChat, setCurrentChat] = useState('')
  const [currentRoom, setcurrentRoom] = useState('')
  const [currentMessages, setCurrentMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(0);

  const [messagesOrUsers, setUsersorMessages] = useState('')
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(null)
  const [currentUserprofile, setcurrentUserprofile] = useState('')

  useEffect(() => {
    socket = io(connection_port, {
      transports: ['websocket', 'polling']
    });

    socket.on('messageGroup', ({ _id, sender, content, currentRoom }) => {
      setCurrentMessages(prevMessages => [...prevMessages, { _id, sender, content }]);
    });

    socket.on('messageGroupMedia', ({ _id, sender, content, currentRoom, media_url }) => {
      console.log(media_url)
      setCurrentMessages(prevMessages => [...prevMessages, { _id, sender, content, media_url },]);
    });

    return () => {
      // Clean up the socket connection when the component unmounts
      socket.disconnect();
    };
  }, [connection_port]);

  const handleConversationClick = async (index, convo) => {
    setSelectedConversation(index);
    setCurrentChat(convo.name)
    setcurrentRoom(convo.room)

    socket.emit('joinRoomGroup', { joiner: info._id, room: convo.room })
    try {
      await api.get(`/api/user/get-group-messages/${convo._id}`)
        .then(({ data }) => {
          if (data.success) {
            setCurrentMessages(data.messages)
          }
          else {
            setCurrentMessages([])
          }
        }).catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(() => {
    if (conversations.length > 0) {
      setCurrentChat(conversations[0].name)
      setCurrentMessages(conversations[0].messages.slice().reverse());
      setcurrentRoom(conversations[0].room)
      socket.emit('joinRoomGroup', { joiner: info._id, room: conversations[0].room })
    }
  }, [conversations, info])


  useEffect(() => {
    api
      .get("/api/user/profile")
      .then(({ data }) => {
        setInfo(data);
      })
      .catch((error) => {
        setInfo(null);
        console.error(error);
      });
  }, []);

  useEffect(() => {
    console.log(info)
    if (info && info._id) {
      setSelectedFriends([{ userId: info._id, userName: info.userName, profile_photo: info.profile_photo }]);
    }
  }, [info]);

  console.log("INFO", info, "CONVERSATIONS", conversations)

  const HandleFetchFriends = async () => {
    try {
      await api.get('/api/user/get-my-friends')
        .then(({ data }) => {
          if (data?.users.length > 0) {
            setMyfriends(data.users)
            console.log(data?.users)
            onOpen()
          }
        }).catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    const fetchConvos = async () => {
      try {
        await api.get('/api/user/get-groups')
          .then(({ data }) => {
            if (data.success) {
              setConversations(data?.groups)
            }
            else {
              setConversations([])
            }
          }).catch((error) => {
            console.log(error)
          })
      } catch (error) {
        console.log(error)
      }
    }
    fetchConvos()
  }, [])
  console.log(conversations)
  const CreateGroup = async () => {

    try {

      if (groupName === '' || groupName.length < 5) {
        toast({
          title: "Please enter a valid group name",
          status: 'error',
          duration: 9000,
          position: 'top',
          isClosable: true,
        })
        return;
      }
      if (selectedFriends.length == 1) {
        toast({
          title: "Please select a friend",
          status: 'error',
          duration: 9000,
          position: 'top',
          isClosable: true,
        })
        return;
      }
      console.log(selectedFriends)
      await api.post('/api/user/create-group', { name: groupName, participants: selectedFriends, admin: info._id })
        .then(({ data }) => {
          if (data.success) {
            toast({
              title: data.message,
              status: 'success',
              duration: 9000,
              position: 'top',
              isClosable: true,
            })
            setGroupName('')
            setSelectedFriends([])
            setSelectedFriends([{ userId: info._id, userName: info.userName }])
            setConversations([...conversations, data.newGroup])
            onClose()
          }
          else {
            toast({
              title: data.message,
              status: 'error',
              duration: 9000,
              position: 'top',
              isClosable: true,
            })
          }
        })
        .catch((error) => {
          toast({
            title: error.message,
            status: 'error',
            duration: 9000,
            position: 'top',
            isClosable: true,
          })
        })
    } catch (error) {
      console.log(error)
    }
  }

  const handleCheckboxChange = (userId, username, profile_photo, isChecked) => {
    const user = { userId, userName: username, profile_photo: profile_photo };

    if (isChecked) {
      setSelectedFriends((prevSelected) => [...prevSelected, user]);
    } else {
      setSelectedFriends((prevSelected) =>
        prevSelected.filter((selectedUser) => selectedUser.userId !== user.userId || selectedUser.userName !== user.userName)
      );
    }
  };


  const HandleSendMessage = async (chat, sender, content) => {

    try {
      await api.post('/api/user/create-message', { chat, sender, content })
        .then(({ data }) => {
          if (data.success) {
            console.log(data)
            socket.emit('sendMessageGroup', { _id: data.newMessage._id, sender, content, currentRoom })
            setCurrentMessage('')
          }
        }).catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log(error)
    }

  }


  const UploadFileAndSendMessage = async (chat, sender, content) => {
    try {
      setIsUploadingImage(true);

      const formData2 = new FormData();
      formData2.append("file", selectedFile);
      formData2.append("upload_preset", "qhqowbjm");

      const { data: cloudinaryData } = await axios.post(
        "https://api.cloudinary.com/v1_1/dlgxvquqc/upload",
        formData2
      );

      const imageUrl = cloudinaryData.secure_url;

      await api.post('/api/user/create-message', { chat, sender, content, media_url: imageUrl })
        .then(({ data }) => {
          if (data.success) {
            socket.emit('sendMessageGroupMedia', { _id: data.newMessage._id, sender, content, currentRoom, media_url: imageUrl });
            setCurrentMessage('');
            setIsUploadingImage(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const findSenderUserName = (group) => {
    if (!group.latestMessage) {
      return 'Unknown';
    }
    const latestMessageSender = group.latestMessage.sender;
    const participant = group.participants.find(participant => participant.userId === latestMessageSender);
    return participant ? participant.userName : 'Unknown';
  };

  const messageContainerRef = useRef(null);

  useEffect(() => {
    messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
  }, [currentMessages]);

  const handleFileUpload = (e) => {

    const file = e.target.files[0]

    if (file) {
      const maxSize = 4 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size exceeds the limit (4 MB)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const HandleTypingStatus = () => {

  }

  const HandleRemoveUser = async (conversation, userIdToRemove) => {

    try {
      const { data } = await api.post('/api/user/delete-group-member', { groupid: conversation._id, participantid: userIdToRemove })
      if (data.success) {
        toast({
          title: "Updated the group",
          status: 'success',
          duration: 9000,
          position: 'top',
          isClosable: true,
        })
        if (data.conversation) {
          const indexToRemove = conversation.participants.findIndex(participant => participant.userId === userIdToRemove);

          if (indexToRemove !== -1) {
            conversation.participants.splice(indexToRemove, 1);
            let updatedConversation = { ...conversation }

            const convoIndexToRemove = conversations.findIndex(convo => convo.name = updatedConversation.name)
            if (convoIndexToRemove !== -1) {
              conversations.splice(convoIndexToRemove, 1)
              setConversations([...conversations, updatedConversation])
            }

            console.log("Participant removed successfully.");
          } else {
            console.log("Participant not found in the conversation.");
          }
        }
      }
    } catch (error) {
      toast({
        title: error.message,
        status: 'success',
        duration: 9000,
        position: 'top',
        isClosable: true,
      })
    }




  }



  const leaveGroup = async (currentChat, userId) => {
    let groupId = conversations.find(conversation => conversation.name === currentChat)?._id;

    console.log({
      groupId: groupId,
      userId: userId
    })
    try {
      const response = await api.post('/api/user/leave-group', {
        groupId: groupId,
        userId: userId
      });

      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  };

  const DeleteGroupAsAdmin = async (currentChat) => {
    try {
      const groupId = conversations.find(conversation => conversation.name === currentChat)?._id;
  
      if (!groupId) {
        throw new Error('Group ID not found for currentChat');
      }
  
      const confirmed = window.confirm(`Are you sure you want to delete the group "${currentChat}"?`);
  
      if (confirmed) {
        const response = await api.post(`/api/user/delete-admin-group`, {
          groupId
        });
  
        toast({
          title: "Group deleted successfully",
          status: 'success',
          duration: 9000,
          position: 'top',
          isClosable: true,
        })
        onCloseGroupSettings()
        const updatedConversations = conversations.filter(conversation => conversation._id !== groupId);
        setConversations(updatedConversations);
  
        return response.data;
      } else {
        throw new Error('Deletion cancelled by user');
      }
    } catch (error) {
      toast({
        title: `Error deleting group: ${error.message}`,
        status: 'error',
        duration: 9000,
        position: 'top',
        isClosable: true,
      })
    }
  };

  
  return (
    <Flex bg={useColorModeValue('white', '#1A202C')} h="100vh">
      {/* Sidebar */}
      <Box w="25%" bg={useColorModeValue('white', '#1A202C')} p="6">
        <Flex alignItems="center" mb="6">
          <Avatar
            mr={3}
            size={'md'}
            src={info ? info.profile_photo : null}
            alt="Profile picture of Jane Cooper"
            className="rounded-full mr-3"
          />
          <Box>
            <Box fontWeight="semibold">{info ? info.name : null}</Box>
            <Box fontSize="xs" color="gray.500">{info ? info.userName : null}</Box>
          </Box>
        </Flex>
        <Box mb="6">
          <Button onClick={() => { HandleFetchFriends() }} bg="blue.500" color="white" px="4" py="2" rounded="md" fontSize="sm" fontWeight="medium" w="full">
            + Add New Group
          </Button>
        </Box>
        <Box mb="6">
          <Input onChange={(e) => { setUsersorMessages(e.target.value) }} border="1px" p="2" rounded="md" w="full" placeholder="Messages or users" />
        </Box>
        <Box mb="4" fontSize="sm" fontWeight="semibold">
          All Conversation ({conversations.length})
        </Box>
        {conversations.length > 0 ? (
          conversations
            .filter(convo => {
              // Filter conversations based on name or latest message content
              return (
                convo.name.toLowerCase().includes(messagesOrUsers.toLowerCase()) ||
                (convo.latestMessage && convo.latestMessage.content.toLowerCase().includes(messagesOrUsers.toLowerCase()))
              );
            })
            .map((convo, i) => {
              const highlightKeyword = (text, keyword) => {
                const regex = new RegExp(`(${keyword})`, "gi");
                return text.replace(regex, '<span style="background-color: yellow;">$1</span>');
              };

              return (
                <Flex
                  pl={4}
                  pb={2}
                  pr={4}
                  pt={2}
                  key={i}
                  mb={4}
                  alignItems="center"
                  borderRadius={3}
                  onClick={() => handleConversationClick(i, convo)}
                  bg={i === selectedConversation ? "blue.100" : "transparent"}
                  _hover={{ bg: "blue.100", cursor: "pointer" }}
                >
                  <Image
                    mr={3}
                    src="https://placehold.co/40x40"
                    alt="Profile picture of Kelvin Lechootta"
                    borderRadius={20}
                  />
                  <Box>
                    <Text fontWeight="medium">
                      <span dangerouslySetInnerHTML={{ __html: highlightKeyword(convo.name, messagesOrUsers) }} />
                    </Text>
                    <Text noOfLines={2} fontSize="xs" color="gray.500">
                      {findSenderUserName(convo)}:{" "}
                      <span dangerouslySetInnerHTML={{ __html: highlightKeyword(convo.latestMessage ? convo.latestMessage.content : "", messagesOrUsers) }} />
                    </Text>
                  </Box>
                </Flex>
              );
            })
        ) : (
          <Flex alignItems="center">
            <Text fontSize="xs" color="gray.500">No groups found</Text>
          </Flex>
        )}

        {/* Repeat for each conversation */}
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create chat group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>

            <SimpleGrid spacingY={4} columns={2}>
              <GridItem colSpan={2}>
                <FormControl>
                  <Input placeholder='Group name' value={groupName} onChange={(e) => { setGroupName(e.target.value) }} />
                </FormControl>
              </GridItem>

              <GridItem colSpan={2}>
                <Text>Add your friends</Text>
              </GridItem>

              <GridItem colSpan={2} pb={4}>
                <List>
                  {
                    myFriends.length > 0 ? (
                      myFriends.map((user) => (
                        <ListItem py={3} pl={3} cursor={'pointer'} key={user._id}>
                          <HStack justifyContent={'space-between'} w="100%">
                            <HStack>
                              <Avatar src={user ? user.profile_photo : null} size={'sm'} />
                              <Text>{user.userName}</Text>
                            </HStack>
                            <Checkbox onChange={(e) => handleCheckboxChange(user._id, user.userName, user.profile_photo, e.target.checked)} colorScheme='blue' pr={3} size='lg' />
                          </HStack>
                        </ListItem>
                      ))
                    ) : (
                      <Box>No friends</Box>
                    )
                  }
                </List>
              </GridItem>

            </SimpleGrid>

          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Close
            </Button>
            {
              myFriends.length <= 1 ? (
                <VStack mt={'-25px'}>
                  <span style={{ color: 'red', fontSize: '10px' }}>Not enough friends</span>
                  <Button isDisabled={true} type='submit' onClick={() => { CreateGroup() }} colorScheme='blue'>Submit</Button>
                </VStack>
              ) : (
                <Button type='submit' onClick={() => { CreateGroup() }} colorScheme='blue'>Submit</Button>

              )
            }
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Chat Area */}
      <Box borderLeft={'1px'} borderColor={'gray.100'} w="75%" bg={useColorModeValue('white', '#1A202C')} p="6">
        <Flex onClick={onOpenGroupSettings} cursor={'pointer'} justify="space-between" alignItems="center" mb="6">
          <Flex alignItems="center">
            <Avatar
              mr={3}
              src="https://placehold.co/40x40"
              alt="Profile picture of Jane Cooper"
              className="rounded-full mr-3"
            />
            <Box>
              <Box fontWeight="semibold">{currentChat ? currentChat : "no groups"}</Box>
              <Box fontSize="xs" color="gray.500">
                {currentChat && conversations.find(conv => conv.name === currentChat)?.participants
                  .map(participant => participant.userName)
                  .sort()
                  .join(', ')
                }
              </Box>
            </Box>
          </Flex>
          <Box>
            <FaEllipsisV />
          </Box>
        </Flex>

        <Modal isOpen={isOpenGroupsetting} onClose={onCloseGroupSettings}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Manage group</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <List>
                {
                  conversations.find(conv => conv.name === currentChat)?.participants.length > 0 ? (
                    conversations.find(conv => conv.name === currentChat)?.participants.map((user) => (
                      <ListItem py={3} pl={3} cursor={'pointer'} key={user._id}>
                        <HStack justifyContent={'space-between'} w="100%">
                          <HStack>
                            <Avatar src={user ? user.profile_photo : null} size={'sm'} />
                            <Text>{user.userName}</Text>
                          </HStack>
                          {
                            info._id === conversations.find(conv => conv.name === currentChat).admin ? <IconButton onClick={() => { HandleRemoveUser(conversations.find(conv => conv.name === currentChat), user.userId) }} as={MdDelete} color="red.200" onChange={(e) => { }} size='sm' />
                              : null
                          }
                          {user.userId === info._id ? (
                            <IconButton size={'sm'} color={'red'} onClick={() => { leaveGroup(currentChat, user.userId) }} as={IoMdExit}>Match Found</IconButton>
                          ) : null}
                        </HStack>
                      </ListItem>
                    ))
                  ) : (
                    <Box>No friends</Box>
                  )
                }
              </List>

            </ModalBody>

            <ModalFooter>
              <HStack pt={3}>
                {conversations.find(conv => conv.name === currentChat)?.participants.length > 0 &&
                  info._id === conversations.find(conv => conv.name === currentChat).admin ? (
                  <Button onClick={() => { DeleteGroupAsAdmin(currentChat) }} bg={'red.300'}>Delete group</Button>
                ) : null}
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Box borderTop={'1px'} borderColor={'gray.100'} maxHeight="500px" overflowY="auto" ref={messageContainerRef}>
          {currentMessages.length === 0 ? (
            <Flex
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <Text>No messages found. Start a conversation!</Text>
            </Flex>
          ) : (
            currentMessages.slice().map(message => {
              const conversation = conversations.find(conv => conv.name === currentChat);
              const participant = conversation.participants.find(participant => participant.userId === message.sender);
              const userName = participant ? participant.userName : 'Unknown';
              const isCurrentUser = message.sender === info._id;
              const alignment = isCurrentUser ? 'flex-end' : 'flex-start';
              const bgColor = isCurrentUser ? '#3182CE' : '#F8FAFC';
              const color = isCurrentUser ? 'white' : 'black';

              return (
                <Flex
                  mb={5}
                  p={5}
                  w="100%"
                  key={message._id}
                  alignItems="center"
                  justifyContent={alignment}
                >
                  <Box borderRadius={'20px'} bg={bgColor} p={5} w="max-content">
                    <HStack>
                      <Avatar
                        mr={3}
                        src={participant.profile_photo ? participant.profile_photo:null}
                        alt="Profile picture of Sender"
                        className="rounded-full mr-3"
                      />
                      <Box color={color} fontWeight="semibold">{userName}</Box>
                    </HStack>

                    {message.media_url && (
                      <Box>
                        {message.media_url.endsWith('.mp4') ? (
                          <video controls width="100%" style={{ maxWidth: '100%', marginBottom: '10px' }}>
                            <source src={message.media_url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img src={message.media_url} alt="Media" style={{ w: '40%', marginBottom: '10px' }} />
                        )}
                      </Box>
                    )}


                    <Box pt={3}>
                      <Box color={color} fontSize="sm">{message.content}</Box>
                      <Box fontSize="xs" color={color}>{moment(message.createdAt).fromNow()}</Box>
                    </Box>
                  </Box>
                </Flex>
              );
            })
          )}
        </Box>
        <Modal isOpen={isOpenUploadMedia} onClose={isUploadingImage ? undefined : () => { onCloseUploadMedia(); setSelectedFile(null) }}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Upload media</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {isUploadingImage ? (
                <Flex w="100%" h={'100%'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                  <Spinner size="xl" />
                  <Text>Uploading image..</Text>
                </Flex>
              ) : (
                selectedFile ? (
                  selectedFile.type.includes('image') ? (
                    <>
                      <Image
                        src={URL.createObjectURL(selectedFile)}
                        alt="Selected Image"
                        borderRadius="md"
                        objectFit="cover"
                        mb={4}
                      />
                    </>
                  ) : (
                    <video controls width="100%" height="auto">
                      <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : (
                  <>
                    <Image
                      src="https://placehold.co/650x200"
                      alt="Placeholder Image"
                      borderRadius="md"
                      objectFit="cover"
                      mb={4}
                      onClick={() => { fileInputRef.current.click() }}
                    />
                    {!selectedFile ? <span style={{ color: 'red', fontSize: '10px' }}>Select file first</span> : null}
                  </>
                )
              )}


              <input
                type="file"
                accept=".jpg, .jpeg, .png, .mp4"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />

              <Input
                placeholder="Type your message..."
                value={currentMessage}
                onChange={(e) => { setCurrentMessage(e.target.value); }}
              />            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={() => { onCloseUploadMedia(); setSelectedFile(null); }}>
                Close
              </Button>
              <Button variant='ghost' onClick={() => { UploadFileAndSendMessage(currentChat, info._id, currentMessage) }}>
                Upload File
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Input for sending messages */}
        <Box bg={useColorModeValue('white', '#1A202C')} position="fixed" bottom="0" left="25%" w="75%" p="6">
          <Flex alignItems="center" justify="space-between">
            <Input value={currentMessage} onChange={(e) => { setCurrentMessage(e.target.value); HandleTypingStatus() }} border="1px" p="2" rounded="md" mr="4" w="full" placeholder="Write your message!" />
            <IconButton onClick={onOpenUploadMedia} mr={3}><MdPermMedia /></IconButton>
            <Button onClick={() => { HandleSendMessage(currentChat, info._id, currentMessage) }} isDisabled={currentMessage ? false : true} bg="blue.500" color="white" px="4" py="2" rounded="md" fontSize="sm" fontWeight="medium">
              Send
            </Button>
          </Flex>
        </Box>
      </Box>

    </Flex>
  )
}
