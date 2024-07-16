import { Outlet } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Header from "./Header";
import { APPBAR_DESKTOP, APPBAR_MOBILE } from "../../data/constrain";

const MainStyle = (props) => (
  <Box
    as="main"
    flexGrow={1}
    minHeight={`calc(100vh - ${APPBAR_DESKTOP + 1}px)`}
    paddingTop={`${APPBAR_MOBILE + 30}px`}
    paddingBottom="5"
    paddingLeft="3"
    paddingRight="3"
    lg={{ paddingTop: `${APPBAR_DESKTOP + 20}px` }}
    print={{ paddingTop: "20px", paddingBottom: "10px", paddingLeft: "15px", paddingRight: "15px", minHeight: "auto" }}
    {...props}
  />
);

const AdminLayout = ({ children }) => {
  return (
    <>
      <Header />
      <MainStyle>{children || <Outlet />}</MainStyle>
    </>
  );
};

export default AdminLayout;
