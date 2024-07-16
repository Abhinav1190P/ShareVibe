import React, { useState, useEffect, useRef } from 'react'
import {
    ChakraProvider, Avatar, Box, Flex, Text, VStack, Wrap, WrapItem, Center, AvatarGroup, HStack, Textarea, IconButton, Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor,
    Button,
    Divider,
    InputGroup,
    InputLeftElement,
    Input,
} from '@chakra-ui/react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { useColorMode } from '@chakra-ui/react';
import { CalendarIcon } from '@chakra-ui/icons';
import { FaSearch } from 'react-icons/fa'
import { MdDateRange } from "react-icons/md";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


const agents = [
    { name: 'Tous', img: 'path_to_tous_image' },
    { name: 'Renaud', img: 'path_to_renaud_image' },
    { name: 'Jubéo', img: 'path_to_jubeo_image' },
    { name: 'Sarah', img: 'path_to_sarah_image' },
    { name: 'Kim', img: 'path_to_kim_image' },
];
export default function ScheduleMessages() {
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [friends, setFriends] = useState([])
    const handleSelect = (agent) => {
        setSelectedAgent(agent);
    };
    const [currentMessage, setCurrentMessage] = useState('')
    const api = useAxiosPrivate()
    const selectedDay = (val) => {
        console.log(val)
    };
    const [messages, setMessages] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const datePickerRef = useRef(null);
    const openDatePicker = () => {
        setIsOpen(true);
    };
    const [selectedButton, setSelectedButton] = useState('In line');
    const [info, setInfo] = useState({})
    const [timeValue, OnTimeValueChange] = useState('10:00');

    const HandleFetchFriends = async () => {
        try {
            await api.get('/api/user/get-my-friends')
                .then(({ data }) => {
                    if (data?.users.length > 0) {
                        setFriends(data.users)
                    }
                }).catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log(error)
        }
    }
    const { colorMode } = useColorMode();

    useEffect(() => {
        HandleFetchFriends()
    }, [])
    const [date, setDate] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    const handleChange = (newDate) => {
        console.log(newDate)
        setDate(newDate);
        setIsOpen(true);
    };
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

    const scheduledMessages = ["1", "2", "3", "4", "5", "1", "2", "3", "4", "5"]
    const combineDateAndTime = (date, time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const combinedDate = new Date(date);
        combinedDate.setHours(hours, minutes, 0, 0);
        return combinedDate;
    };

    const CreateScheduleMessages = async () => {
        if (!currentMessage.trim()) {
            console.log("Content is required");
            return;
        }

        if (!info._id) {
            console.log("Sender is required");
            return;
        }

        if (!selectedAgent.roomCode) {
            console.log("RoomId is required");
            return;
        }

        try {
            const combinedDate = combineDateAndTime(date, timeValue);
            const formattedDate = combinedDate.toISOString();
            console.log(formattedDate)
            await api.post('/api/user/schedule-message', {
                room: selectedAgent.roomCode,
                sender: info._id,
                scheduledAt: formattedDate,
                content: currentMessage,
                user_profile: selectedAgent.profile_photo,
            }).then(({ data }) => {
                if (data.success) {

                    setMessages([...messages, {
                        room: selectedAgent.roomCode,
                        sender: info._id,
                        scheduledAt: formattedDate,
                        content: currentMessage,
                        user_profile: selectedAgent.profile_photo,
                    }])

                    setCurrentMessage("")
                }
            }).catch((error) => {
                console.log(error);
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                await api.get('/api/user/get-schedule-messages').then(({ data }) => {
                    if (data.length > 0) {
                        setMessages(data)
                    }
                    else {
                        setMessages([])
                    }
                })
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages()
    }, [])

    const formatDate = (date) => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const hour = d.getHours() % 12 || 12;
        const minute = d.getMinutes().toString().padStart(2, '0');
        const ampm = d.getHours() >= 12 ? 'pm' : 'am';

        return `${day}/${month}/${year} ${hour}:${minute}${ampm}`;
    };

    useEffect(() => {
        if (selectedButton === 'In line') {
            const fetchMessages = async () => {
                try {
                    await api.get('/api/user/get-schedule-messages').then(({ data }) => {
                        if (data.length > 0) {
                            setMessages(data)
                        }
                        else {
                            setMessages([])
                        }
                    })
                } catch (error) {
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchMessages()
        } else {
            const fetchMessages = async () => {
                try {
                    await api.get('/api/user/get-sent-messages').then(({ data }) => {
                        if (data.length > 0) {
                            setMessages(data)
                        }
                        else {
                            setMessages([])
                        }
                    })
                } catch (error) {
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchMessages()
        }
    }, [selectedButton])

    return (
        <Box spacing={3} minH={'92vh'} alignItems={'flex-start'} justifyContent={'flex-start'}>
            <HStack w={"100%"} h={'100%'}>
                <VStack w={'70%'} spacing={3} align="stretch">
                    <Text fontSize="xl" fontWeight="bold">Schedule Messages</Text>
                    <HStack w={"100%"}>
                        <Center height="max-content">
                            <Box textAlign="center">
                                <AvatarGroup max={3}>
                                    <Avatar name="Person 1" src="https://bit.ly/ryan-florence" />
                                    <Avatar zIndex={1} size={'lg'} name="Person 2" src="https://bit.ly/code-beast" />
                                    <Avatar name="Person 3" src="https://bit.ly/kent-c-dodds" />
                                </AvatarGroup>
                                <Text mt={2} fontSize="lg">Friends</Text>
                            </Box>
                        </Center>
                        <Wrap ml={7} spacing="24px">
                            {
                                friends.length > 0 ? (
                                    friends.map((agent) => (
                                        <WrapItem
                                            bg={'white'}
                                            borderRadius={'10px'}
                                            py={7}
                                            px={7}
                                            key={agent.name}
                                            boxShadow={selectedAgent === agent ? "0 4px 6px rgba(233, 30, 99, 0.5)" : "none"}
                                        >
                                            <Flex direction="column" align="center" onClick={() => handleSelect(agent)} cursor="pointer">
                                                <Avatar
                                                    name={agent.userName}
                                                    src={agent.profile_photo}
                                                    size="md"
                                                    border={selectedAgent === agent ? "2px solid #6B46C1" : "none"}
                                                />
                                                <Text mt={2} color={'pink.500'} fontWeight={selectedAgent === agent ? "700" : "normal"}>
                                                    {agent.userName}
                                                </Text>
                                            </Flex>
                                        </WrapItem>
                                    ))
                                ) : (null)}
                        </Wrap>
                    </HStack>
                    <VStack
                        alignItems={'flex-start'}
                        w={'100%'}
                        height={'50vh'}
                        pt={10}
                        borderRadius={'20px'}
                    >
                        <Text pt={0} fontSize={'xl'}>Enter message</Text>
                        <Box style={{ position: 'relative', width: '90%' }}>
                            <Textarea value={currentMessage} onChange={(e) => { setCurrentMessage(e.target.value) }} borderRadius={'20px'} placeholder="Type a message 🙂" height={200} />
                            <Popover>
                                <PopoverTrigger>
                                    <IconButton
                                        icon={<CalendarIcon />}
                                        aria-label="Open date picker"
                                        onClick={openDatePicker}
                                        position="absolute"
                                        top={2}
                                        right={2}
                                        zIndex="1"
                                    />
                                </PopoverTrigger>
                                <PopoverContent w={'max-content'}>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverBody pr={10}>
                                        <HStack spacing={10}>
                                            <DatePicker
                                                ref={datePickerRef}
                                                onChange={handleChange}
                                                value={date}
                                                onChangeRaw={(e) => e.preventDefault()}
                                                onSelect={() => setIsOpen(false)}
                                                open={isOpen}
                                            />
                                            <TimePicker onChange={OnTimeValueChange} value={timeValue} />
                                        </HStack>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>


                        </Box>

                        <HStack>
                            <Button onClick={() => CreateScheduleMessages()} bg={'pink.300'}>
                                Create message
                            </Button>
                            <Button>
                                Clear
                            </Button>
                        </HStack>
                    </VStack>

                </VStack>
                <VStack h={'92vh'} maxH={'72vh'} w={'45%'}>
                    <HStack h={'10vh'} w={'100%'}>
                        <HStack w={'80%'}>
                            <Button
                                bg={selectedButton === 'In line' ? 'pink.300' : 'transparent'}
                                color={selectedButton === 'In line' ? 'white' : 'pink.300'}
                                onClick={() => setSelectedButton('In line')}
                            >
                                In line
                            </Button>
                            <Button
                                bg={selectedButton === 'Sent' ? 'pink.300' : 'transparent'}
                                color={selectedButton === 'Sent' ? 'white' : 'pink.300'}
                                onClick={() => setSelectedButton('Sent')}
                            >
                                Sent
                            </Button>
                        </HStack>
                        <InputGroup>
                            <InputLeftElement pointerEvents='none'>
                                <FaSearch color='gray.300' />
                            </InputLeftElement>
                            <Input type='tel' placeholder='Phone number' />
                        </InputGroup>
                    </HStack>
                    <VStack overflowY={'scroll'} h={'100%'} maxH={'72vh'} w={'100%'} borderRadius={'15px'} justifyContent={'flex-start'}>

                        {
                            messages.length > 0 ? (
                                messages.map((item, i) => (
                                    <HStack
                                        pt={3}
                                        pr={3}
                                        pb={3}
                                        pl={2}
                                        _hover={{ bg: 'pink.300', cursor: 'pointer' }}
                                        key={i}
                                        minH={'10vh'}
                                        w={'100%'}
                                        borderRadius={'10px'}
                                        my={2}
                                        display={'flex'}
                                        alignItems={'center'}
                                    >
                                        <Avatar src={item.user_profile} size={'md'} />
                                        <VStack alignItems={'flex-start'} w={'80%'}>

                                            <Text w={'100%'} fontSize={'small'} fontWeight={400} noOfLines={2}>{item.content}</Text>
                                            <HStack>
                                                <MdDateRange />
                                                <Text color={'gray.400'}>{formatDate(item.scheduledAt)}</Text></HStack>
                                        </VStack>

                                    </HStack>
                                )
                                )) : (null)
                        }
                    </VStack>
                </VStack>
            </HStack>

        </Box>
    )
}
