import {
  Avatar, Box, Flex, HStack, Icon, Input, VStack, Text, Link, useDisclosure, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  ModalCloseButton,
  SimpleGrid,
  GridItem,
  useToast,
  FormControl,
  FormErrorMessage,
  Textarea,
  Spinner
} from '@chakra-ui/react'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import InputEmoji from 'react-input-emoji'
import { MdPhotoSizeSelectActual } from "react-icons/md";
import { MdAudiotrack } from "react-icons/md";
import { FaVideo } from "react-icons/fa6";
import PostCard from './PostCard';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useDropzone } from 'react-dropzone'
import axios from 'axios';

/* const APP_KEY = "noqrf6w4gj4ekf0";
 */
const schema = z.object({
  post_title: z
    .string()
    .trim()
    .min(5, "Post title should be minimum 5 characters")
    .max(70, "Post title should be maximum 70 characters"),
  post_description: z
    .string()
    .trim()
    .min(6, "Post description should be minimum 6 characters")
    .max(150, "Post description should be maximum 150 characters")
});

const defaultValues = {
  post_title: "",
  post_description: "",
};


export default function Posts() {
  const [items, setItems] = useState([...Array(20).keys()]);
  const [info, setInfo] = useState(null);
  const api = useAxiosPrivate()
  const [text, setText] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [page, setPage] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const LIMIT = 10;
  const [totalPosts, setTotalPosts] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState({})
  const [mediaOpener, setMediaOpener] = useState(false)
  const [uploadLoader, setUplaodLoader] = useState(null)
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues,
  });


  function handleOnEnter(text) {
    console.log('enter', text)
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
  }, [api]);


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        await api.get(`/api/post/get-posts-feed/${page}/${LIMIT}/${info?._id}`)
          .then(({ data }) => {
            setActivePage(activePage => activePage + 1); // Functional update to avoid dependency warning
            setTotalPosts(data.total);
            setItems(data?.posts);
          })
          .catch((error) => {
            setInfo(null);
            console.error(error);
          });

      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info]);

  const fetchMoreData = useCallback(() => {
    try {
      api.get(`/api/post/get-posts-feed/${activePage}/${LIMIT}/${info?._id}`)
        .then(({ data }) => {
          setActivePage(activePage => activePage + 1); // Functional update to avoid dependency warning
          setItems(prevItems => [...prevItems, ...data.posts]);
          setPage(prevPage => prevPage + 1); // Functional update to avoid dependency warning
        })
        .catch((error) => {
          setInfo(null);
          console.error(error);
        });

    } catch (error) {
      console.error("Error fetching chats:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, info]);

  const onSubmit = async (data) => {
    const post_files_n_folders = [];
    setUplaodLoader(true)
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "qhqowbjm");


      const { data: cloudinaryData } = await axios.post(
        "https://api.cloudinary.com/v1_1/dlgxvquqc/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      post_files_n_folders.push({ url: cloudinaryData.secure_url });

      const obj = {
        post_title: data.post_title,
        post_description: data.post_description,
        post_user_name: info?.name,
        post_user_email: info?.email,
        post_files_n_folders,
        post_user_id: info?._id,
        post_user_photo: info?.profile_photo
      };

      const { data: responseData } = await api.post('/api/post/create-post', obj);

      if (responseData.success) {
        toast({
          title: responseData.message,
          status: 'success',
          duration: 9000,
          position: 'top',
          isClosable: true,
        });
        setUplaodLoader(false)
        reset();
        onClose();
        setItems([...items, responseData.newPost]);
      } else {
        toast({
          title: responseData.message,
          description: "Something went wrong.",
          status: 'error',
          duration: 9000,
          position: 'top',
          isClosable: true,
        });
        setUplaodLoader(false)

      }
    } catch (error) {
      console.log(error);
      toast({
        title: error.message,
        description: "Try a different email and username.",
        status: 'error',
        duration: 9000,
        position: 'top',
        isClosable: true,
      });
      setUplaodLoader(false)

    }
  };


  const RecieveLikedPost = (postid, isLiked) => {
    const post = items.find(post => post._id === postid);
    const isLikedByMe = post.likes.includes(info?._id);

    if (isLikedByMe) {
      post.likes = post.likes.filter(like => like !== info?._id);
      post.likeCount -= 1;
    } else {
      post.likes.push(info?._id);
      post.likeCount += 1;
    }
    const updatedItems = items.map(item => {
      if (item._id === post._id) {
        item.likes = post.likes;
        item.likeCount = post.likeCount;
      }
      return item;
    });
    setItems(updatedItems)
  };


  const HandleDeletedPost = (postid) => {
    const filteredPosts = items.filter(post => post._id !== postid)
    setItems(filteredPosts)
  }




  /*   function handleSuccess(files) {
      if (!files) {
        toast({
          title: 'Please choose the uploaded files',
          status: 'error',
          duration: 9000,
          position: 'top',
          isClosable: true,
        });
      } else {
        const urlAndDataObjects = files.map(item => {
          const url = item.link;
          const data = {
            id: item.id,
            name: item.name,
            bytes: item.bytes,
            isDir: item.isDir,
            icon: item.icon,
            thumbnailLink: item.thumbnailLink || ''
          };
  
          return { url, data };
        });
  
        const flattenedUrlAndDataObjects = urlAndDataObjects.flat();
  
        set_post_files_n_folders([...post_files_n_folders, ...flattenedUrlAndDataObjects]);
      }
    } */


  const handleFileUpload = (e) => {

    const file = e.target.files[0]

    if (file) {
      const maxSize = 4 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size exceeds the limit (4 MB)');
        return;
      }
      if (mediaOpener) {
        setSelectedFile(file);
      }
      else {
        setMediaOpener(!mediaOpener)
        setSelectedFile(file);
      }
    }
  };

  const handleMediaOpener = () => {
    setMediaOpener(false)
    onOpen()
  }

  return (
    <VStack borderLeft={'1px'} borderColor={'gray.100'} w="100%" h="100%">
      <Flex pl={10} pr={10} pb={10} pt={3} w="100%" minH="15vh" alignItems={'center'} justifyContent={'center'}>
        <HStack w="90%" h={'10vh'}>
          <VStack pt={5} w="100%" h="100%">
            <HStack justifyContent={'space-between'} w="100%" h="50%">
              <Box p={4} display={'flex'} alignItems={'center'} justifyContent={'flex-start'} w="100%">
                <Avatar src={info ? info.profile_photo : null} />
                <InputEmoji
                  onClick={onOpen}
                  value={text}
                  onChange={setText}
                  cleanOnEnter
                  onEnter={handleOnEnter}
                  placeholder={`What's on your mind, ${info ? info.name : null}?`}
                />
              </Box>
              <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>What's on your mind, {info ? info.name : null}?</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    {/*  <Lorem count={2} /> */}
                    <form form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
                      <SimpleGrid spacingY={5} columns={1}>
                        {
                          mediaOpener ? (
                            <>
                              <GridItem colSpan={1}>
                                <FormControl isInvalid={!!errors.post_title}>
                                  <Controller
                                    control={control}
                                    name="post_title"
                                    render={({ field }) => (
                                      <Input
                                        /*         isDisabled={post_files_n_folders.length > 0 ? false : true} */
                                        placeholder='Title'
                                        autoFocus
                                        {...field}
                                        type="text"
                                      />
                                    )}
                                  />
                                  <FormErrorMessage>{errors.post_title?.message}</FormErrorMessage>
                                </FormControl>
                              </GridItem>
                              <GridItem colSpan={1}>
                                <FormControl isInvalid={!!errors.post_description}>
                                  <Controller
                                    control={control}
                                    name="post_description"
                                    render={({ field }) => (
                                      <Textarea
                                        /*     isDisabled={post_files_n_folders.length > 0 ? false : true} */
                                        placeholder='Describe'
                                        autoFocus
                                        {...field}
                                        type="text"
                                      />
                                    )}
                                  />
                                  <FormErrorMessage>{errors.post_description?.message}</FormErrorMessage>
                                </FormControl>
                              </GridItem>
                            </>
                          ) : (null)
                        }
                        <GridItem colSpan={1}>
                          <div onClick={() => { fileInputRef.current.click() }} style={{ padding: '10px', border: '1px solid gray', borderStyle: 'dashed', borderRadius: '15px' }}>
                            <input type='file' accept=".jpg, .jpeg, .png"
                              ref={fileInputRef} onChange={handleFileUpload}
                              style={{ display: 'none' }} />
                            <p>Click here to select files</p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            {selectedFile && (
                              <div style={{ margin: '10px' }}>
                                <p>Selected file: {selectedFile.name}</p>
                              </div>
                            )}
                          </div>
                        </GridItem>
                        <GridItem mt={5} mb={5}>
                          <Button variant='ghost' mr={3} onClick={onClose}>
                            Close
                          </Button>
                          <Button
                            type='submit'
                            color='white'
                            bg='#1E90F1'
                            onClick={handleSubmit}
                            disabled={uploadLoader}
                            position="relative"
                          >
                            Submit
                            {uploadLoader && (
                              <Spinner
                                size="sm"
                                color="white"
                                position="absolute"
                                right="10px"
                                top="50%"
                                transform="translateY(-50%)"
                              />
                            )}
                          </Button>
                        </GridItem>
                      </SimpleGrid>
                    </form>

                  </ModalBody>
                </ModalContent>
              </Modal>
            </HStack>
            <HStack spacing={4} p={5} flexDirection={'row'} w={'100%'} alignItems={'flex-start'} justifyContent={'flex-start'}>
              <HStack onClick={() => { handleMediaOpener() }}>
                <Icon as={MdPhotoSizeSelectActual} /> <Link>Media</Link>
              </HStack>
            </HStack>
          </VStack>
        </HStack>
      </Flex >
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMoreData}
        hasMore={items.length < totalPosts}
        loader={<Flex w="400px" justifyContent={'center'} alignItems={'center'}><Text>Loading...</Text></Flex>}
        endMessage={<Flex pb={10} w="400px" justifyContent={'center'} alignItems={'center'}><Text>No more items to load</Text></Flex>}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginLeft: '0px' }}
      >
        {
          items.length > 0 ? (
            items?.slice().reverse().map((item, index) => (
              <div key={index} style={{ padding: '20px', margin: '10px 0' }}>
                <PostCard getDeletedPost={HandleDeletedPost} getLikedPost={RecieveLikedPost} post={item} />
              </div>
            )
            )
          ) : (null)
        }
      </InfiniteScroll>
    </VStack >
  )
}
