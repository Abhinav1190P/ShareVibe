import { useState, useRef } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Container,
  FormErrorMessage,
  Heading,
  FormHelperText,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link as ChakraLink,
  Text,
  FormControl,
  FormLabel,
  useToast,
  SimpleGrid,
  GridItem,
  InputLeftElement,
  Spinner
} from "@chakra-ui/react";
import axios from "axios";
import { catchError } from "../../utils/catchError";
import usePageTitle from "../../hooks/usePageTitle";
import { Controller, useForm } from "react-hook-form";
import { Link, Link as RouteLink } from "react-router-dom";
import Lights from '../../assets/images/lights.jpg'
import { FaSignature } from "react-icons/fa";
import { FaSmileBeam } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaPhoneAlt } from "react-icons/fa";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Invalid email" }),
  userName: z
    .string()
    .regex(/^\S*$/, "Space not allowed")
    .min(5, "Username minimum 5 characters")
    .max(20, "Username maximum 20 characters"),
  password: z.string().min(6, "Password minimum 6 characters"),
  role: z.enum(["user", "admin"]),
  profilePhoto: z.string().optional(),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must only contain digits"),
});

const defaultValues = {
  name: "",
  email: "",
  userName: "",
  password: "",
  role: "user",
  profilePhoto: "",
  phoneNumber: ""
};

export default function Signup() {
  usePageTitle("Create account");
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState({})
  const [selectedFileName, setSelectedFileName] = useState(""); // State to hold the selected file name
  const buttonRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(""); // State to hold the preview URL of the selected file

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues,
  });
  const toast = useToast()
  const onSubmit = async (signupDetails) => {
    console.log('selectedFile', selectedFile);
    if (!selectedFile) {
      toast({
        title: 'Please select a profile picture',
        status: 'error',
        duration: 9000,
        position: 'top',
        isClosable: true,
      });
      return;
    }
    setSubmitting(true);

    const formData2 = new FormData();
    formData2.append("file", selectedFile);
    formData2.append("upload_preset", "qhqowbjm"); // ye 

    try {



      const { data: cloudinaryData } = await axios.post(
        "https://api.cloudinary.com/v1_1/dlgxvquqc/upload", 
        // ban gaya ok
        formData2
      );


      const imageUrl = cloudinaryData.secure_url;
      console.log({
        ...signupDetails,
        profile_photo: imageUrl,
      })
      const { data } = await axios.post("http://localhost:4000/api/auth/signup", { profile_photo: imageUrl, ...signupDetails });
   
      if (data.success) {
        toast({
          title: 'Account created.',
          description: "We've created your account for you.",
          status: 'success',
          duration: 9000,
          position: 'top',
          isClosable: true,
        });
        reset();
        setSubmitting(false);
      } else {
        toast({
          title: data.message,
          description: "Something went wrong.",
          status: 'error',
          duration: 9000,
          position: 'top',
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      toast({
        title: 'Please provide an image',
        status: 'error',
        duration: 9000,
        position: 'top',
        isClosable: true,
      });
    }
  };


  const handleFileSubmit = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    const fileName = file ? file.name : "";
    setSelectedFileName(fileName);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl("");
    }
  };



  return (
    <Flex
      height="100vh"
      alignItems="center"
      justifyContent="flex-start"
      backgroundImage={`linear-gradient(to right, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 0)), url(${Lights})`}
      backgroundSize="cover"
      backgroundPosition="center"
    >
      <Box
        maxW="500px"
        w="100%"
        p="40px"
        marginTop={'-50px'}
        bgColor="transparent"
        borderRadius="10px"
        color="#fff"
        display={'flex'}
        flexDirection={'column'}
        alignItems={'flex-start'}
        justifyContent={'flex-start'}
      >
        <Text color={'#41424C'} fontWeight={700} letterSpacing={2} textAlign={'start'} fontSize={'lg'}>Start for free</Text>
        <Heading width={'100%'} mb={'20px'} mt="5px" letterSpacing={1} textAlign="start">Create new account</Heading>
        <Text fontWeight={600} fontSize={'sm'} color={'#858995'} mb={'13px'}>Already a member? <span style={{ color: '#1E90F1', textDecoration: 'underline' }}>
          <Link to={'/'}>Log in</Link></span></Text>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <SimpleGrid spacingX={5} columns={2} style={{ width: '100%' }}>
            <GridItem colSpan={2} w={'100%'}>
              <Box mb="20px">

                <Controller
                  control={control}
                  name="profilePhoto"
                  render={({ field }) => (
                    <FormControl>
                      {previewUrl ? (
                        <Avatar onClick={() => { setSelectedFile(null); setPreviewUrl(""); }} src={previewUrl} alt={selectedFileName} />
                      ) : (
                        <>
                          <FormLabel _hover={{ borderColor: '#1E90F1', color: '#1E90F1' }} pl={3} pr={3} pt={1} pb={1} border={'1px'} borderRadius={'40px'} borderStyle={'dashed'} w={'max-content'} htmlFor="photo">Upload Photo</FormLabel>
                          <input
                            autoFocus
                            type="file"
                            style={{ width: '0', height: '0', display: 'none' }}
                            id="photo"
                            accept="image/jpeg, image/png"
                            onChange={(e) => handleFileSubmit(e)}
                          />
                        </>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            </GridItem>
            <GridItem colSpan={1} width={'100%'}>
              <Box mb="20px">
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormControl isInvalid={!!errors.name} mb="4">
                      <InputGroup>
                        <InputLeftElement pointerEvents='none'>
                          <FaSignature />

                        </InputLeftElement>
                        <Input
                          {...field} autoFocus
                          type="text"
                          placeholder="Name"
                          bgColor="rgba(255, 255, 255, 0.1)"
                          color="#fff"
                          borderRadius="5px"
                          py="10px"
                          px="15px"
                          mb="20px"
                          _focus={{ outline: "none" }}
                        />

                      </InputGroup>
                      <FormErrorMessage mt={0} width={'100%'} fontSize={'x-small'}>{errors?.name?.message}</FormErrorMessage>

                    </FormControl>
                  )} />

              </Box>
            </GridItem>
            <GridItem colSpan={1} w={'100%'}>
              <Box mb="20px">
                <Controller
                  control={control}
                  name="userName"
                  render={({ field }) => (
                    <FormControl isInvalid={!!errors.userName} mb="4">
                      <InputGroup>
                        <InputLeftElement pointerEvents='none'>
                          <FaSmileBeam />
                        </InputLeftElement>

                        <Input
                          type="text"
                          placeholder="Username"
                          bgColor="rgba(255, 255, 255, 0.1)"
                          color="#fff"
                          borderRadius="5px"
                          py="10px"
                          px="15px"
                          mb="20px"
                          {...field}
                          _focus={{ outline: "none" }}
                        />
                      </InputGroup>
                      <FormErrorMessage mt={0} width={'100%'} fontSize={'x-small'}>{errors?.userName?.message}</FormErrorMessage>

                    </FormControl>
                  )} />
              </Box>
            </GridItem>
            <GridItem colSpan={2} w={'100%'}>
              <Box mb="20px">
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormControl isInvalid={!!errors.email} mb="4">
                      <InputGroup>
                        <InputLeftElement pointerEvents='none'>
                          <MdEmail />
                        </InputLeftElement>
                        <Input
                          type="email"
                          placeholder="Email"
                          bgColor="rgba(255, 255, 255, 0.1)"
                          color="#fff"
                          borderRadius="5px"
                          py="10px"
                          px="15px"
                          mb="20px"
                          {...field}
                          _focus={{ outline: "none" }}
                        />
                      </InputGroup>
                      <FormErrorMessage mt={0} width={'100%'} fontSize={'x-small'}>{errors?.email?.message}</FormErrorMessage>
                    </FormControl>
                  )}
                />
              </Box>
            </GridItem>

            <GridItem colSpan={2} w={'100%'}>
              <Box mb="20px">
                <Controller
                  control={control}
                  name="phoneNumber"  // Change this name to "phoneNumber"
                  render={({ field }) => (
                    <FormControl isInvalid={!!errors.phoneNumber} mb="4">
                      <InputGroup>
                        <InputLeftElement pointerEvents='none'>
                          <FaPhoneAlt />
                        </InputLeftElement>
                        <Input
                          type="phone"
                          placeholder="Phone number"
                          bgColor="rgba(255, 255, 255, 0.1)"
                          color="#fff"
                          borderRadius="5px"
                          py="10px"
                          px="15px"
                          mb="20px"
                          {...field}
                          _focus={{ outline: "none" }}
                        />
                      </InputGroup>
                      <FormErrorMessage mt={0} width={'100%'} fontSize={'x-small'}>{errors?.phoneNumber?.message}</FormErrorMessage>
                    </FormControl>
                  )}
                />
              </Box>
            </GridItem>

            <GridItem colSpan={2} w={'100%'}>
              <Box mb="20px">

                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormControl isInvalid={!!errors.password} mb="4">
                      <InputGroup>
                        <InputLeftElement pointerEvents='none'><RiLockPasswordFill /></InputLeftElement>
                        <Input
                          type="password"
                          placeholder="Password"
                          bgColor="rgba(255, 255, 255, 0.1)"
                          color="#fff"
                          borderRadius="5px"
                          py="10px"
                          px="15px"
                          mb="20px"
                          {...field}
                          _focus={{ outline: "none" }}
                        />
                      </InputGroup>
                      <FormErrorMessage mt={0} width={'100%'} fontSize={'x-small'}>{errors?.password?.message}</FormErrorMessage>

                    </FormControl>
                  )} />

              </Box>
            </GridItem>

            <GridItem colSpan={1}>
              <Button
                bgColor="#373737"
                color="#fff"
                borderRadius="20px"
                px={10}
                cursor="pointer"
                _hover={{ opacity: .8 }}
                mr={3}
              >
                Change method
              </Button>
            </GridItem>
            <GridItem colSpan={1}>

              <Button
                type="submit"
                bgColor="#1E90F1"
                color="#fff"
                borderRadius="20px"
                px={10}
                cursor="pointer"
                _hover={{ opacity: .8 }}
                boxShadow={'0px 4px 10px rgba(30, 144, 241, 0.5)'} /* Adjust the shadow color and opacity as needed */
              >
                {
                  submitting ? (
                    <Spinner />
                  ) : ("Create account")
                }
              </Button>

            </GridItem>
          </SimpleGrid>
        </form>
      </Box>
    </Flex >
  );
}
