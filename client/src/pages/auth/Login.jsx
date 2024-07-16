import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ViewIcon, ViewOffIcon, LockIcon } from "@chakra-ui/icons";
import {
    Avatar,
    Box,
    Button,
    Container,
    FormErrorMessage,
    FormHelperText,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Link as ChakraLink,
    Flex,
    Text,
    FormControl,
    FormLabel,
} from "@chakra-ui/react";

import { catchError } from "../../utils/catchError";
import useAuth from "../../hooks/useAuth";
import usePageTitle from "../../hooks/usePageTitle";
import { Controller, useForm } from "react-hook-form";
import { Link as RouteLink } from "react-router-dom";
import Mountains from '../../assets/images/mountains.jpg'
const schema = z.object({
    userName: z
        .string()
        .trim()
        .min(5, "Username minimum 5 characters")
        .max(20, "Username maximum 20 characters"),
    password: z
        .string()
        .trim()
        .min(6, "Password should be minimum of 6 characters")
        .max(40, "Must be 40 or fewer characters long"),
});

const defaultValues = {
    userName: "",
    password: "",
};

export default function SignIn() {

    usePageTitle("Login");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();

    const {
        control,
        formState: { errors },
        handleSubmit,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await login(data.userName, data.password);
        } catch (error) {
            setError(catchError(error));
            setLoading(false);
        }
    };

    return (
        <Flex
            height="100vh"
            alignItems="center"
            justifyContent="center"
            backgroundImage={`url(${Mountains})`}
            backgroundSize="cover"
            backgroundPosition="center"
        >
            <Flex borderRadius={'20'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'} boxShadow={'dark-lg'} w="30%" p={3}>
                <Box
                    pb={10}
                    w="80%"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent={'center'}
                >
                    <Avatar bg="primary.main">
                        <LockIcon />
                    </Avatar>
                    <Text fontWeight={700} color={'white'} as="h1" fontSize="xl" mt={2}>
                        ShareVibe Login
                    </Text>

                    <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
                        <FormControl id="userName" isInvalid={errors.userName}>
                            <FormLabel color={'white'}>Username</FormLabel>
                            <Controller
                                control={control}
                                name="userName"
                                render={({ field }) => (
                                    <Input
                                        color={'white'}
                                        autoFocus
                                        {...field}
                                        type="text"
                                    />
                                )}
                            />
                            <FormErrorMessage>{errors.userName?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl id="password" isInvalid={errors.password} mt={4}>
                            <FormLabel color={'white'}>Password</FormLabel>
                            <InputGroup>
                                <Controller
                                    control={control}
                                    name="password"
                                    render={({ field }) => (
                                        <Input
                                            color={'white'}

                                            {...field}
                                            type={showPassword ? "text" : "password"}
                                        />
                                    )}
                                />
                                <InputRightElement>
                                    <IconButton

                                        colorScheme="gray"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                        onClick={togglePasswordVisibility}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                        </FormControl>

                        {/*        {error && (
                            <FormHelperText color="red" fontSize="sm" mt={2}>
                                {error}
                            </FormHelperText>
                        )} */}

                        <Button
                            mt={4}
                            bg={'#1E90F1'}
                            opacity={.8}
                            isLoading={loading}
                            type="submit"
                            width="100%"
                        >
                            Login
                        </Button>
                    </form>

                    <ChakraLink fontWeight={700} color={'white'} as={RouteLink} to="/signup" mt={2} fontSize="sm">
                        Don't have an account? <span style={{ color: '#1E90F1' }}>Create account</span>
                    </ChakraLink>
                </Box>
            </Flex>
        </Flex>
    )
}
