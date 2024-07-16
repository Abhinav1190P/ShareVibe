import React, { useState, useEffect, useCallback } from 'react'
import {
    Container,
    Image,
    Center,
    Heading,
    Text,
    Input,
    Button,
    VStack,
    HStack,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
    Card, CardHeader, CardBody, CardFooter,
    Box,
    FormControl,
    TagLabel,
    Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Stack, InputGroup, InputRightElement, Avatar, IconButton, useToast, Link
} from '@chakra-ui/react';

import UserImage from './UserImage';
import { ExternalLinkIcon } from '@chakra-ui/icons'

import { FaBookOpen } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { RiAttachmentFill } from "react-icons/ri";
import { FaCalendar } from "react-icons/fa6";
import { BsPostcardHeartFill } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import InfiniteScroll from 'react-infinite-scroll-component';
import { FaStar } from "react-icons/fa";
import { TbCardsFilled } from "react-icons/tb";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { BsThreeDotsVertical } from 'react-icons/bs'
import { BiLike, BiChat, BiShare } from 'react-icons/bi'
import { FaSave } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNotifications } from '../../contexts/NotificationContext'
import { IoMdHeart } from "react-icons/io";
import moment from 'moment';
import { useParams } from 'react-router-dom'

const UserProfile = ({ initialData }) => {
    return (
        <Container p={5} mt={4}>
            <UserImage pic={initialData.profile_photo} name={initialData.name} />
            <Center >
                <VStack spacing={2}>
                    <Text fontWeight={700} size={'3xl'}>{initialData.name}</Text>
                    <Text color="gray">
                        {initialData.userName}
                    </Text>

                    <Text>{/* {initialData.bio} */}</Text>
                    <HStack>
                        {/* {initialData.skills.map(skill => (
                            <Tag colorScheme="blue" key={skill}>
                                {skill}
                            </Tag>
                        ))} */}
                    </HStack>
                </VStack>
            </Center>
        </Container>
    );
};


export default function UserProfileMain() {

    const params = useParams()
    const [items, setItems] = useState([]);
    const api = useAxiosPrivate()
    const [info, setInfo] = useState({})
    const [userDashboardinfo, setUserDashboardInfo] = useState({})
    const [page, setPage] = useState(1);
    const [activePage, setActivePage] = useState(1);
    const LIMIT = 10;
    const [totalPosts, setTotalPosts] = useState(0);
    const toast = useToast()
    const [showComments, setShowComments] = useState(false);
    const [currentComment, setcurrentComment] = useState('');
    const [fetchedComments, SetfetchedComments] = useState([]);
    const [likeBool, SetLikeBool] = useState(false)
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
        if (params && params.username) {
            api
                .get(`/api/user/get-user-info-username/${params.username}`)
                .then(({ data }) => {
                    console.log(data)
                    setUserDashboardInfo(data)
                })
                .catch((error) => {
                    console.log(error.message)
                    console.error("Error fetching user info:", error);
                });
        }
    }, [params]);


    const HandleDeletePost = async (postid, postuserid) => {
        try {
            const { data } = await api.delete(`/api/post/delete-post/${postid}/${postuserid}`)
            if (data) {
                toast({
                    title: 'Deleted the post',
                    status: 'success',
                    duration: 9000,
                    position: 'top',
                    isClosable: true,
                })

            }
            else {
                toast({
                    title: 'Something went wrong!',
                    status: 'error',
                    duration: 9000,
                    position: 'top',
                    isClosable: true,
                })
            }
        } catch (error) {
            toast({
                title: error.message,
                status: 'error',
                duration: 9000,
                position: 'top',
                isClosable: true,
            })
        }
    }
    const LikeorUnlike = async (postId, postUserId) => {
        SetLikeBool(!likeBool)
        try {
            let obj = {
                post_id: postId, post_user_id: postUserId, post_liked_by: info._id
            }
            const { data } = await api.post('/api/post/like-unlike-post', obj)
            const post = items.find(post => { return post._id === postId })
            if (data.success) {
                toast({
                    title: <IoMdHeart color='pink.300' />,
                    status: 'success',
                    duration: 2000,
                    position: 'top',
                    isClosable: true,
                })
                addNotification({ id: post.post_user_id, message: `${info.name} liked your post "${post.post_title}"`, liked: likeBool, profile: info?.profile_photo, name: info?.name });
            }
        } catch (error) {
            console.log(error)
        }
    }


    const toggleComments = () => {
        setShowComments(!showComments);
    };


    const CreateComment = async (postId, postUserId, user_photo) => {
        try {
            let obj = {
                post_id: postId,
                post_user_id: info._id,
                comment_by_photo: user_photo,
                comment_text: currentComment
            }
            const { data } = await api.post('/api/post/create-comment', obj)


            if (data) {
                SetfetchedComments([...fetchedComments, data.comment])
            }
            else {
                SetfetchedComments([])
            }

        } catch (error) {
            console.log(error)
        }
    }

    const HandlePostSave = async (post) => {
        try {
            const { data } = await api.post(`/api/post/save-post`, { ...post, post_id: post._id, user_id: info?._id })
            if (data.success) {
                toast({
                    title: 'Saved the post',
                    status: 'success',
                    duration: 9000,
                    position: 'top',
                    isClosable: true,
                })
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
        } catch (error) {
            toast({
                title: error.message,
                status: 'error',
                duration: 9000,
                position: 'top',
                isClosable: true,
            })
        }
    }

    const FetchMyPosts = async () => {
        try {
            await api.get(`/api/post/get-my-posts-user/${page}/${LIMIT}/${params.username}`)
                .then(({ data }) => {
                    setActivePage(activePage + 1);
                    setTotalPosts(data.total)
                    setItems(data?.posts)
                })
                .catch((error) => {
                    setInfo(null);
                    console.error(error);
                });

        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    };

    const HandleFriendRequest = async (from, to) => {
        console.log(from, to)
        let obj = {
            from: from,
            to: to
        }
        try {
            const { data } = await api.post('/api/user/send-friend-request', obj)
            if (data) {

                setUserDashboardInfo({ ...userDashboardinfo, requestStatus: data.requestStatus })
                toast({
                    title: data.message,
                    status: 'success',
                    duration: 9000,
                    position: 'top',
                    isClosable: true,
                })
                addNotification({ id: to, message: `${info.name} sent you a follow request` });
            }
        } catch (error) {
            toast({
                title: error.message,
                status: 'error',
                duration: 9000,
                position: 'top',
                isClosable: true,
            })
        }
    }

    const GetCommentsForPost = async (postid) => {

        try {
            const { data } = await api.get(`/api/post/get-comments/${postid}`)
            if (data) {
                SetfetchedComments(data.comments)
            }
        } catch (error) {
            console.log(error)
        }

    }

    const fetchMoreData = useCallback(() => {
        try {
            api.get(`/api/post/get-my-posts-user/${activePage}/${LIMIT}/${params.username}`)
                .then(({ data }) => {
                    setActivePage(activePage + 1);
                    setItems(prevItems => [...prevItems, ...data.posts]);
                    setPage(page + 1);
                })
                .catch((error) => {
                    setInfo(null);
                    console.error(error);
                });

        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    }, [items.length, activePage, totalPosts])

 
    return (!userDashboardinfo?.private || userDashboardinfo?.requestStatus === 'accepted') ? (
        <Box borderLeft={'1px'} borderColor={'gray.100'} w="100%" h="100%">
            <HStack alignItems={'flex-start'} w="100%" minH={'92vh'} >
                <div style={{ width: '40%', position: 'sticky', top: 0 }}>
                    <Box w="100%" h="100%">
                        {userDashboardinfo?.info ? (<UserProfile initialData={userDashboardinfo?.info} />) : (null)}
                    </Box>
                </div>
                <Box w="60%">
                    <Tabs w="100%">
                        <TabList>
                            <Tab onClick={() => { setItems([]); setPage(1); setActivePage(1) }}>
                                <HStack>
                                    <FaBookOpen />
                                    <Text>Overview</Text>
                                </HStack></Tab>
                            <Tab onClick={() => { FetchMyPosts() }}>
                                <HStack>
                                    <BsPostcardHeartFill />
                                    <Text>Posts</Text>
                                </HStack></Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <HStack>
                                    <HStack p={3} boxShadow={'lg'} w="30%">
                                        <Flex py={5} px={5} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} w="30%" bg={'red.400'}>
                                            <FaHeart color='white' />
                                        </Flex>
                                        <VStack spacing={1} alignItems={'flex-start'} w="70%">
                                            <Text color={'gray.600'} fontSize={'md'} fontWeight={700}>
                                                Likes
                                            </Text>
                                            <Text fontSize={'lg'} fontWeight={800}>
                                                {userDashboardinfo ? userDashboardinfo.likeCount : 0}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <HStack p={3} boxShadow={'lg'} w="30%">
                                        <Flex py={5} px={5} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} w="30%" bg={'yellow.400'}>
                                            <FaStar color={"white"} />
                                        </Flex>
                                        <VStack spacing={1} alignItems={'flex-start'} w="70%">
                                            <Text color={'gray.600'} fontSize={'md'} fontWeight={700}>
                                                Saves
                                            </Text>
                                            <Text fontSize={'lg'} fontWeight={800}>
                                                {userDashboardinfo ? userDashboardinfo.savedCount : 0}
                                            </Text>
                                        </VStack>
                                    </HStack>

                                    <HStack p={3} boxShadow={'lg'} w="30%">
                                        <Flex py={5} px={5} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} w="30%" bg={'blue.400'}>
                                            <TbCardsFilled color='white' />
                                        </Flex>
                                        <VStack spacing={1} alignItems={'flex-start'} w="70%">
                                            <Text color={'gray.600'} fontSize={'md'} fontWeight={700}>
                                                Posts
                                            </Text>
                                            <Text fontSize={'lg'} fontWeight={800}>
                                                {userDashboardinfo ? userDashboardinfo.postCount : 0}
                                            </Text>
                                        </VStack>
                                    </HStack>

                                </HStack>
                                <VStack alignItems={'flex-start'} mt={10} w={'100%'}>
                                    <HStack>
                                        <RiAttachmentFill />
                                        <Text>Pinned Repositories</Text>
                                    </HStack>
                                    <HStack maxW={'100%'} spacing={4} overflowX="auto">
                                        {userDashboardinfo?.post_files_n_folders?.map(({ url, data }, index) => (
                                            <Card
                                                p={5}
                                                minW={'500px'}
                                                maxH={'200px'}
                                                direction={{ base: 'column', sm: 'row' }}
                                                overflow='hidden'
                                                variant='outline'
                                            >
                                                <Image
                                                    objectFit='cover'
                                                    maxW={{ base: '100%', sm: '200px' }}
                                                    src={data.icon}

                                                    alt='Caffe Latte'
                                                />

                                                <Stack>
                                                    <CardBody>
                                                        <Heading size='md'>{data.name}</Heading>

                                                        <Text fontSize={'sm'} py='2'>

                                                            <Link href={url ? url : null} isExternal>
                                                                Repository link <ExternalLinkIcon mx='2px' />
                                                            </Link>

                                                        </Text>
                                                    </CardBody>
                                                </Stack>
                                            </Card>
                                        ))}
                                    </HStack>

                                </VStack>
                            </TabPanel>
                            <TabPanel>
                                <VStack alignItems={'flex-start'} justifyContent={'center'} w="100%">
                                    <Box w="30%">
                                        <InputGroup>
                                            <InputRightElement><CiSearch /> </InputRightElement>
                                            <Input placeholder='Search post' />
                                        </InputGroup>
                                    </Box>

                                    <InfiniteScroll
                                        dataLength={items.length}
                                        next={fetchMoreData}
                                        hasMore={items.length < totalPosts}
                                        loader={<Flex w="400px" justifyContent={'center'} alignItems={'center'}><Text>Loading...</Text></Flex>}
                                        endMessage={<Flex pb={10} w="400px" justifyContent={'center'} alignItems={'center'}><Text>No more items to load</Text></Flex>}
                                        style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {


                                            items.length > 0 ? (
                                                items.map((post, index) => (
                                                    <Card mb={4} key={index} minW={'lg'} maxW='lg'>
                                                        <CardHeader>
                                                            <Flex spacing='4'>
                                                                <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap'>
                                                                    <Avatar name='Segun Adebayo' src={userDashboardinfo.profile_photo} />

                                                                    <Box>
                                                                        <Heading size='sm'>{post.post_user_name}</Heading>
                                                                        <Text>{post.post_user_email}</Text>
                                                                    </Box>
                                                                </Flex>

                                                                <Popover>
                                                                    <PopoverTrigger>
                                                                        <IconButton
                                                                            variant='ghost'
                                                                            colorScheme='gray'
                                                                            aria-label='See menu'
                                                                            icon={<BsThreeDotsVertical />}
                                                                        />
                                                                    </PopoverTrigger>
                                                                    <PopoverContent maxW={'200px'} boxShadow={'lg'}>
                                                                        <PopoverArrow />
                                                                        <PopoverCloseButton />
                                                                        <PopoverBody>
                                                                            <VStack w={'100%'} alignItems={'flex-start'}>
                                                                                {
                                                                                    info ? (
                                                                                        info._id === post.post_user_id ? (
                                                                                            <>
                                                                                                <Link onClick={() => HandleDeletePost(post._id, post.post_user_id)} color={'red'}><HStack><MdDelete /><Text>Delete</Text></HStack></Link>
                                                                                                <Link onClick={() => HandlePostSave(post)} color={'black'}><HStack><FaSave /><Text>Save</Text></HStack></Link>
                                                                                            </>
                                                                                        ) : (
                                                                                            <Link onClick={() => HandlePostSave(post)} color={'black'}><HStack><FaSave /><Text>Save</Text></HStack></Link>
                                                                                        )
                                                                                    ) : (null)
                                                                                }

                                                                            </VStack>
                                                                        </PopoverBody>
                                                                    </PopoverContent>
                                                                </Popover>


                                                            </Flex>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <Text pb={3}>
                                                                {post.post_description}
                                                            </Text>
                                                            <HStack>
                                                                {post?.post_files_n_folders?.length > 0 && (
                                                                    <>
                                                                        {post.post_files_n_folders.map((file, index) => (
                                                                            <HStack key={index} spacing="20px">
                                                                                <Link href={file.url} target="_blank" rel="noopener noreferrer">
                                                                                    <Image src={file.url} alt="icon" width="50px" height="50px" />
                                                                                </Link>
                                                                            </HStack>
                                                                        ))}
                                                                    </>
                                                                )}
                                                            </HStack>

                                                        </CardBody>


                                                        <CardFooter
                                                            justify='space-between'
                                                            flexWrap='wrap'
                                                            sx={{
                                                                '& > button': {
                                                                    minW: '136px',
                                                                },
                                                            }}
                                                        >
                                                            <Button bg={'transparent'} _hover={{ background: 'transparent' }} onClick={() => { LikeorUnlike(post._id, post.post_user_id) }} flex='1' leftIcon={<BiLike color={post?.likes?.includes(info?._id) ? 'red' : 'black'} />
                                                            }>
                                                                {post.likeCount}
                                                            </Button>
                                                            <Button onClick={() => { toggleComments(post._id); GetCommentsForPost(post._id) }} flex='1' variant='ghost' leftIcon={<BiChat />}>
                                                                Comment
                                                            </Button>
                                                            <Button flex='1' variant='ghost' leftIcon={<BiShare />}>
                                                                Share
                                                            </Button>
                                                        </CardFooter>
                                                        {showComments && (
                                                            <CardBody position="relative">
                                                                <Box pb={5} height="max-content" maxH={'300px'} overflowY="auto" marginBottom="10px">
                                                                    {
                                                                        fetchedComments?.length > 0 ? (
                                                                            fetchedComments?.map((comment, index) => (
                                                                                <VStack alignItems={'flex-start'} pb={5} w="100%" key={index}>
                                                                                    <HStack justifyContent={'space-between'} alignItems={'flex-start'} w="100%">

                                                                                        <HStack spacing={0} w="70%">
                                                                                            <Flex height={'100%'} alignItems={'center'} justifyContent={'flex-start'}>
                                                                                                <Avatar size={'xs'} src={userDashboardinfo.profile_photo} />
                                                                                            </Flex>
                                                                                            <Text pl={2} size={'sm'} fontWeight={700}>
                                                                                                {comment.comment_by_username}
                                                                                            </Text>
                                                                                        </HStack>
                                                                                        <Box w="30%">
                                                                                            <Text size={'sm'}>{moment(comment.createdAt).fromNow()}</Text>
                                                                                        </Box>
                                                                                    </HStack>
                                                                                    <Text noOfLines={'5'} size={'sm'}>
                                                                                        {comment.comment_text}
                                                                                    </Text>
                                                                                </VStack>
                                                                            ))
                                                                        ) : (<Box>No comments yet</Box>)
                                                                    }
                                                                </Box>
                                                                <HStack mt={10} pt={5} pl={3} pr={3} pb={3} ml={'-20px'} position="absolute" bottom="0" width="100%">
                                                                    <Input value={currentComment} onChange={(e) => { setcurrentComment(e.target.value) }} size={'sm'} variant="outline" placeholder="Add a comment..." />
                                                                    <Button onClick={() => CreateComment(post._id, post.post_user_id, post.post_user_photo)} size={'sm'}>Send</Button>
                                                                </HStack>
                                                            </CardBody>
                                                        )}
                                                    </Card>
                                                ))
                                            ) : (null)
                                        }
                                    </InfiniteScroll>
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </HStack>
        </Box>
    ) : (
        <Flex mt={10} alignItems={'center'} justifyContent={'center'} w="100%">
            <VStack w="50%">
                <HStack alignItems={'flex-start'} w="100%">
                    <Flex alignItems={'center'} justifyContent={'center'} w="20%">
                        <Avatar size={'xl'} src={userDashboardinfo.profile_photo} />
                    </Flex>
                    <VStack p={3} alignItems={'flex-start'} w="80%">
                        <Box><Text fontWeight={700} fontSize={'xl'}>{userDashboardinfo.username}</Text></Box>
                        <Box><Text fontSize={'lg'}>{userDashboardinfo.name}</Text></Box>
                    </VStack>
                </HStack>

                <Box>
                    <Text fontWeight={400}>
                        Account is private
                    </Text>
                </Box>

                <HStack spacing={5} w="100%" alignItems={'flex-start'} mt={10}>
                    {userDashboardinfo.requestStatus === "start" ? (
                        <Button onClick={() => { HandleFriendRequest(info._id, userDashboardinfo.id) }} bg={'#1E90F1'} color={'white'}>Follow</Button>
                    ) : userDashboardinfo.requestStatus === "pending" ? (
                        <>
                            <Button isDisabled={true} bg={'#1E90F1'} color={'white'}>Pending</Button>
                            <Button>Unsent request</Button>
                        </>
                    ) : (
                        <Button onClick={() => { HandleFriendRequest(info?._id, userDashboardinfo.id) }} bg={'#1E90F1'} color={'white'}>Follow</Button>
                    )}


                    <Button>Message</Button>
                </HStack>
            </VStack>
        </Flex>
    )
}








