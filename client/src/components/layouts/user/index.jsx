import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import Header from "./Header";
import { APPBAR_DESKTOP, APPBAR_MOBILE } from "../../data/constrain";
import NotificationComponent from "../../notification/notification";
const MainStyle = (props) => (
  <Box
    as="main"
    flexGrow={1}
    minHeight={`calc(100vh - ${APPBAR_DESKTOP + 1}px)`}
    print={{ paddingTop: "20px", paddingBottom: "10px", paddingLeft: "15px", paddingRight: "15px", minHeight: "auto" }}
    {...props}
  />
);

const UserLayout = ({ children }) => {
  return (
    <Flex flexDir={'column'} alignItems={'center'} justifyContent={'center'} width={'100vw'}>
      <Box w="80%" flex={1}>
        <Header />
        <MainStyle>
          <NotificationComponent />
          {children || <Outlet />}
        </MainStyle>
      </Box>
    </Flex>
  );
};

export default UserLayout;
