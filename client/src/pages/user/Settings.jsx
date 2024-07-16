'use client'
import { useEffect, useState, useRef } from 'react';
import {
    Heading,
    Avatar,
    Box,
    Center,
    Image,
    Flex,
    Text,
    Stack,
    Button,
    useColorModeValue,
    Input,
    IconButton,
    useToast
} from '@chakra-ui/react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { FaEdit, FaSave } from 'react-icons/fa';
import axios from 'axios'

export default function Settings() {
    const api = useAxiosPrivate()
    const [info, setInfo] = useState({})
    const btnRef = useRef(null)
    useEffect(() => {
        api.get("/api/user/profile")
            .then(({ data }) => {
                setInfo(data);
            })
            .catch((error) => {
                setInfo(null);
                console.log(error);
            });
    }, []);
    const [isHovered, setIsHovered] = useState(false);
    const [newProfilePhoto, setNewProfilePhoto] = useState(null)
    const toast = useToast()
    const handleFileInputChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const formData2 = new FormData();
                formData2.append("file", file);
                formData2.append("upload_preset", "qhqowbjm");

                const { data: cloudinaryData } = await axios.post(
                    "https://api.cloudinary.com/v1_1/dlgxvquqc/upload",
                    formData2
                );


                const imageUrl = cloudinaryData.secure_url;

                const { data } = await api.post('/api/user/edit-profile-photo', { newprofile: imageUrl })
                if (data.success) {
                    toast({
                        title: "Profile photo updated",
                        status: 'success',
                        duration: 9000,
                        position: 'top',
                        isClosable: true,
                    })
                } else {
                    toast({
                        title: "Something went wrong",
                        status: 'error',
                        duration: 9000,
                        position: 'top',
                        isClosable: true,
                    })
                }

                setNewProfilePhoto(imageUrl)
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
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editedUserName, setEditedUserName] = useState(info ? info.userName : '');

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        setEditedUserName(e.target.value);
    };

    const handleSaveClick = async () => {
        const updatedInfo = { ...info, userName: editedUserName };

        if (!editedUserName) {
            toast({
                title: "Provide new username",
                status: 'error',
                duration: 9000,
                position: 'top',
                isClosable: true,
            })
            return;
        }
        try {
            const { data } = await api.post('/api/user/update-info', { newUsername: updatedInfo.userName })
            if (data.success) {
                toast({
                    title: "Profile photo updated",
                    status: 'success',
                    duration: 9000,
                    position: 'top',
                    isClosable: true,
                })
                setInfo(updatedInfo)
            }
            else {
                toast({
                    title: "Something went wrong",
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
        setIsEditing(false);
    };

    return (
        <Center py={6}>
            <Box
                maxW={'570px'}
                w={'full'}
                bg={useColorModeValue('white', 'gray.800')}
                boxShadow={'2xl'}
                rounded={'md'}
                overflow={'hidden'}>
                <Image
                    h={'120px'}
                    w={'full'}
                    src={
                        'https://images.unsplash.com/photo-1612865547334-09cb8cb455da?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
                    }
                    objectFit="cover"
                    alt="#"
                />
                <Flex justify="center" mt={-12} position="relative">
                    <Flex
                        justify="center"
                        position="relative"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Avatar
                            size="xl"
                            src={newProfilePhoto || (info ? info.profile_photo : null)}
                            css={{
                                border: '2px solid white',
                                filter: isHovered ? 'brightness(50%)' : 'none',
                            }}

                        />
                        <input
                            type="file"
                            accept=".jpg,.png"
                            ref={btnRef}
                            onChange={handleFileInputChange}
                            style={{ width: '0', height: '0', display: 'none' }}
                        />
                        {isHovered && (
                            <Box
                                position="absolute"
                                top="50%"
                                left="50%"
                                transform="translate(-50%, -50%)"
                            >
                                <IconButton
                                    aria-label="Edit"
                                    icon={<FaEdit />}
                                    onClick={() => btnRef.current.click()}
                                    bg="white"
                                    color="#333"
                                    borderRadius="50%"
                                />
                            </Box>
                        )}
                    </Flex>
                </Flex>

                <Box p={6}>
                    <Stack spacing={0} align={'center'} mb={5}>
                        <Heading fontSize={'2xl'} fontWeight={500} fontFamily={'body'}>
                            {info ? info.name : null}
                        </Heading>
                        <Flex ml={3} align="center">

                            {isEditing ? (
                                <>
                                    <Input
                                        value={editedUserName}
                                        onChange={handleInputChange}
                                        size="sm"
                                        mr={2}
                                    />
                                    <IconButton
                                        aria-label="Save username"
                                        icon={<FaSave />}
                                        size="sm"
                                        onClick={handleSaveClick}
                                        variant="ghost"
                                    />
                                </>
                            ) : (
                                <>
                                    <Text color="gray.500" mr={2}>
                                        {info ? info.userName : null}
                                    </Text>
                                    <IconButton
                                        aria-label="Edit username"
                                        icon={<FaEdit />}
                                        size="sm"
                                        onClick={handleEditClick}
                                        variant="ghost"
                                    />
                                </>
                            )}
                        </Flex>
                    </Stack>

                    <Stack direction={'row'} justify={'center'} spacing={6}>
                        <Stack spacing={0} align={'center'}>
                            <Text fontWeight={600}>Member since</Text>
                            <Text fontSize={'sm'} color={'gray.500'}>
                                {info ? info?.createdAt?.split('-')[0] : null}
                            </Text>
                        </Stack>
                    </Stack>

                    <Button
                        w={'full'}
                        mt={8}
                        bg={useColorModeValue('#151f21', 'gray.900')}
                        color={'white'}
                        rounded={'md'}
                        _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                        }}>
                        Follow
                    </Button>
                </Box>
            </Box>
        </Center>
    )
}