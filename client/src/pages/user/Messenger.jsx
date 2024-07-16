import React, { useEffect, useState, useRef } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { Flex, Text, Image, Box, Avatar, HStack, Input, IconButton, useColorModeValue, Button, ModalFooter, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Spinner } from '@chakra-ui/react'
import io from 'socket.io-client'
import { FaEllipsisV } from "react-icons/fa";
import moment from 'moment';
import { MdPermMedia } from "react-icons/md";
import { useNotifications } from '../../contexts/NotificationContext';
import AudioRecorder from './AudioRecorder';
import axios from 'axios'
let connection_port = 'http://localhost:4000/'
let socket;

export default function Messenger() {
  const api = useAxiosPrivate()
  const [myFriends, setMyfriends] = useState([])
  const [messagesOrUsers, setUsersorMessages] = useState('')
  const [currentMessages, setCurrentMessages] = useState([])
  const [conversation, setConversation] = useState({})
  const [roomId, setRoomId] = useState('')
  const [currentChat, setCurrentChat] = useState('')
  const [currentRoom, setcurrentRoom] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null);
  const [info, setInfo] = useState({})
  const [currentMessage, setCurrentMessage] = useState('')
  const { isOpen: isOpenUploadMedia, onOpen: onOpenUploadMedia, onClose: onCloseUploadMedia } = useDisclosure()
  const fileInputRef = useRef(null)
  const [currentUserprofile, setcurrentUserprofile] = useState('')
  const { addNotification } = useNotifications();

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
    socket = io(connection_port, {
      transports: ['websocket', 'polling']
    });

    socket.on('message', ({ _id, sender, content, currentRoom }) => {
      console.log("HEYOA")
      setCurrentMessages(prevMessages => [...prevMessages, { _id, sender, content }]);
    });

    socket.on('messageMedia', ({ _id, sender, content, currentRoom, media_url }) => {
      console.log(_id, sender, content, currentRoom, media_url)
      setCurrentMessages(prevMessages => [...prevMessages, { _id, sender, content, media_url }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [connection_port]);


  const messageContainerRef = useRef(null);

  useEffect(() => {
    messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
  }, [currentMessages]);


  useEffect(() => {
    const HandleFetchFriends = async () => {
      try {
        await api.get('/api/user/get-my-friends')
          .then(({ data }) => {
            if (data?.users.length > 0) {
              setMyfriends(data.users)
            }
          }).catch((error) => {
            console.log(error)
          })
      } catch (error) {
        console.log(error)
      }
    }
    HandleFetchFriends()
  }, [])

  useEffect(() => {
    const createChatRoomWithFirstFriend = async () => {
      if (myFriends.length > 0) {
        const firstFriend = myFriends[0];

        try {
          const response = await api.get(`/api/user/get-chat-room-messages/${firstFriend.roomCode}`);
          const { data } = response;

          if (data?.success) {
            setCurrentMessages(data.messages);
            setCurrentChat(firstFriend.userName)
            setcurrentRoom(firstFriend.roomCode)
            setRoomId(data.roomId)
            setcurrentUserprofile(firstFriend.profile_photo)
            socket.emit('joinRoomGroup', { joiner: info._id, room: firstFriend.roomCode })
          }
        } catch (error) {
          console.log('Error retrieving chat room messages:', error);
        }
      }
    };

    createChatRoomWithFirstFriend();
  }, [myFriends]);


  const HandleTypingStatus = () => {

  }

  const HandleSendMessage = async (roomId, room, sender, content) => {
    const NotificationReciever = myFriends.find((friend) => { return friend.userName == currentChat })
    addNotification({ id: NotificationReciever._id, message: `${info?.userName} sent you a message`, profile: info?.profile_photo })
    try {
      await api.post('/api/user/create-chat-room-message', { roomId, room, sender, content })
        .then(({ data }) => {
          if (data.success) {
            socket.emit('sendMessage', { _id: data.newMessage._id, sender, content, currentRoom })
            setCurrentMessage('')
          }
        }).catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log(error)
    }

  }

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

  const UploadFileAndSendMessage = async (roomId, room, sender, content) => {
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

      await api.post('/api/user/create-chat-room-message', { roomId, room: currentRoom, sender, content, media_url: imageUrl })
        .then(({ data }) => {
          if (data.success) {
            socket.emit('sendMessageMedia', { _id: data.newMessage._id, sender, content, currentRoom: currentRoom, media_url: imageUrl });
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

  const handleConversationClick = async (index, convo) => {


    socket.emit('joinRoom', { joiner: info._id, room: convo.roomCode })
    try {
      const response = await api.get(`/api/user/get-chat-room-messages/${convo.roomCode}`)
        .then(({ data }) => {
          if (data.success) {
            setCurrentMessages(data.messages)
            setCurrentChat(convo.userName)
            setcurrentRoom(convo.roomCode)
            setRoomId(data.roomId)
            setcurrentUserprofile(convo.profile_photo)

            socket.emit('joinRoomGroup', { joiner: info._id, room: convo.roomCode })
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

  const handleNewMessage = (newMessage) => {
    console.log(newMessage)

    socket.emit('sendMessage', { _id: newMessage._id, sender:newMessage.sender, content:newMessage.content, currentRoom:newMessage.currentRoom })
  }

  return (
    <Flex bg={useColorModeValue('white', '#1A202C')} h="100vh">
      <Box bg={useColorModeValue('white', '#1A202C')} w="25%" p="6">
        <Box mb="4" fontSize="sm" fontWeight="semibold">
          All Conversation ({myFriends.length})
        </Box>
        {myFriends.length > 0 ? (
          myFriends
            .map((convo, i) => {
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
                  /*  bg={i === selectedConversation ? "blue.100" : "transparent"}  */
                  _hover={{ bg: "blue.100", cursor: "pointer" }}
                >
                  <Avatar
                    mr={3}
                    src={convo.profile_photo}
                    alt="Profile picture of Kelvin Lechootta"
                    borderRadius={20}
                  />
                  <Box>
                    <Text fontWeight="medium">
                      {convo.userName}
                    </Text>
                    {/*  <Text noOfLines={2} fontSize="xs" color="gray.500">
                      {findSenderUserName(convo)}:{" "}
                      <span dangerouslySetInnerHTML={{ __html: highlightKeyword(convo.latestMessage ? convo.latestMessage.content : "", messagesOrUsers) }} />
                    </Text> */}
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
      <Box borderLeft={'1px'} borderColor={'gray.100'} w="75%" bg={useColorModeValue('white', '#1A202C')} p="6">
        <Flex cursor={'pointer'} justify="space-between" alignItems="center" mb="6">
          <Flex alignItems="center">
            <Avatar
              mr={3}
              src={currentUserprofile}
              alt="Profile picture of Jane Cooper"
              className="rounded-full mr-3"
            />
            <Box>
              <Box fontWeight="semibold">{currentChat ? currentChat : "loading..."}</Box>
              <Box fontSize="xs" color="gray.500">
                {/*  {currentChat && conversations.find(conv => conv.name === currentChat)?.participants
                  .map(participant => participant.userName)
                  .sort()
                  .join(', ')
                } */}
              </Box>
            </Box>
          </Flex>
          <Box>
            <FaEllipsisV />
          </Box>
        </Flex>

        <Box bg={useColorModeValue('white', '#1A202C')} borderTop={'1px'} borderColor={'gray.100'} maxHeight="500px" overflowY="auto" ref={messageContainerRef}>
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
              const isCurrentUser = message.sender === info._id;
              const alignment = isCurrentUser ? 'flex-end' : 'flex-start';
              const bgColor = isCurrentUser ? '#3182CE' : '#F8FAFC';
              const color = isCurrentUser ? 'white' : 'black';
              let displayContent = true;
              let mediaContent = null;


              console.log(message.content)

              if (message.content.startsWith('http')) {
                displayContent = false;
                mediaContent = (
                  <audio crossOrigin="anonymous" controls style={{ width: '200px', height: '90px', marginBottom: '10px' }}>
                    <source src={message.content} type="audio/wav" />
                    Your browser does not support the audio tag.
                  </audio>
                );
              }

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
                        src={info._id === message.sender ? info.profile_photo : currentUserprofile}
                        alt="Profile picture of Sender"
                        className="rounded-full mr-3"
                      />
                      <Box color={color} fontWeight="semibold">{info._id === message.sender ? info.userName : currentChat}</Box>
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


                    <Box maxW={'300px'} pt={3}>
                      {displayContent ? (
                        <Box color={color} fontSize="sm">{message.content}</Box>
                      ) : (
                        <Box color={color} fontSize="sm">{mediaContent}</Box>
                      )}
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
              <Button variant='ghost' onClick={() => { UploadFileAndSendMessage(roomId, currentRoom, info._id, currentMessage) }}>
                Upload File
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Box bg={useColorModeValue('white', '#1A202C')} position="fixed" bottom="0" left="25%" w="75%" p="6">
          <Flex alignItems="center" justify="space-between">
            <Input value={currentMessage} onChange={(e) => { setCurrentMessage(e.target.value); HandleTypingStatus() }} border="1px" p="2" rounded="md" mr="4" w="full" placeholder="Write your message!" />
            <AudioRecorder currentChat={currentChat} currentRoom={currentRoom} roomId={roomId} newMessageFuntion={handleNewMessage} />
            <IconButton onClick={onOpenUploadMedia} mr={3}><MdPermMedia /></IconButton>
            <Button onClick={() => { HandleSendMessage(roomId, currentRoom, info._id, currentMessage) }} isDisabled={currentMessage ? false : true} bg="blue.500" color="white" px="4" py="2" rounded="md" fontSize="sm" fontWeight="medium">
              Send
            </Button>
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}
