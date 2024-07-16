import { NavLink } from "react-router-dom";
import { Box, Text } from "@chakra-ui/react";
import notFoundImage from "../assets/images/404-error-page.png";
import useAuth from "../hooks/useAuth";

const NotFound = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Box
      p={4}
      display="flex"
      height="100%"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
    >
      <Box maxWidth={350}>
        <img src={notFoundImage} width="100%" alt="Error 404" />
      </Box>
      <Text
        as="h1"
        fontSize={64}
        fontWeight={700}
        color="primary"
        mt={3}
      >
        Ooops... 404!
      </Text>
      <Text fontSize="xl" fontWeight="medium" color="gray.600">
        The page you requested could not be found.
      </Text>

      <NavLink to={isAuthenticated ? (user?.role === "admin" ? "/admin/profile" : "/user/profile") : "/login"}>
        <Box
          mt="1.5rem"
          fontWeight="semibold"
          color="primary"
          _hover={{ textDecoration: "underline" }}
        >
          {isAuthenticated ? "Back to profile" : "Back to login"}
        </Box>
      </NavLink>
    </Box>
  );
};

export default NotFound;
