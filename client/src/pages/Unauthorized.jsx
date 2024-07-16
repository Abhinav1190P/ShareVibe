import { NavLink, useNavigate } from "react-router-dom";
import { Box, Text } from "@chakra-ui/react";
import accessDeniedImg from "../assets/images/access_denied.png";
import useAuth from "../hooks/useAuth";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    navigate("/", { replace: true });
  }

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
        <img src={accessDeniedImg} width="100%" alt="Unauthorized" />
      </Box>
      <Text
        as="h1"
        fontSize={64}
        fontWeight={700}
        color="primary"
        mt={3}
      >
        Unauthorized!
      </Text>
      <Text fontSize="xl" fontWeight="medium" color="gray.600">
        You are not authorized to view this page!
      </Text>

      <NavLink to={user?.role === "admin" ? "/admin/profile" : "/user/profile"}>
        <Box
          mt="1.5rem"
          fontWeight="semibold"
          color="primary"
          _hover={{ textDecoration: "underline" }}
        >
          Back to profile
        </Box>
      </NavLink>
    </Box>
  );
};

export default Unauthorized;
