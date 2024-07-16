import React, { useState, useEffect } from 'react'
import {
    Card, CardHeader, CardBody, CardFooter,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,

    Input, Text, IconButton, Heading, Box, Avatar, Flex, useToast, HStack, VStack, Link, Image
} from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { BiLike, BiChat, BiShare } from 'react-icons/bi'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { IoMdHeart } from "react-icons/io";
import moment from 'moment';
import { MdDelete } from "react-icons/md";
import { FaSave } from "react-icons/fa";
import { useNotifications } from '../../contexts/NotificationContext'

export default function PostCard({ post, getLikedPost, getDeletedPost }) {

    const [info, setInfo] = useState(null);
    const { addNotification } = useNotifications();
    const api = useAxiosPrivate();
    const toast = useToast()
    const [showComments, setShowComments] = useState(false);
    const [currentComment, setcurrentComment] = useState('');
    const [fetchedComments, SetfetchedComments] = useState([]);
    const [likeBool, SetLikeBool] = useState(false)


    const LikeorUnlike = async (postId, postUserId) => {
        SetLikeBool(!likeBool)
        try {
            let obj = {
                post_id: postId, post_user_id: postUserId, post_liked_by: info._id
            }
            const { data } = await api.post('/api/post/like-unlike-post', obj)

            if (data.success) {
                toast({
                    title: <IoMdHeart color='pink.300' />,
                    status: 'success',
                    duration: 2000,
                    position: 'top',
                    isClosable: true,
                })
                addNotification({ id: post.post_user_id, message: `${info.name} liked your post "${post.post_title}"`, liked: likeBool, profile: info?.profile_photo, name: info?.name });
                getLikedPost(postId, likeBool)
            }
        } catch (error) {
            console.log(error)
        }
    }

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
                getDeletedPost(postid)
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

    const HandlePostSave = async (post) => {
        console.log('hey')
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

    return (
        <Card minW={'lg'} maxW='lg'>
            <CardHeader>
                <Flex spacing='4'>
                    <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap'>
                        <Avatar name={post.post_user_name} src={post.post_user_photo} />

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
                                        <Image src={file.url} alt="icon" w="auto" height="auto" maxH={'544px'} />
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
                                                    <Avatar size={'xs'} src={comment.comment_by_photo} />
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
    )
}
