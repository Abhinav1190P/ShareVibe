import { Link as ChakraLink, Box } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ArrowLeft } from "react-feather";

function BackToPage({ title = "back to list", to, sx = [], ...rest }) {
  return (
    <ChakraLink
      sx={[
        { displayPrint: "none", display: "inline-block", marginBottom: "1rem" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
      as={RouterLink}
      to={to}
    >
      <Box sx={{ display: "inline-flex", alignItems: "center" }}>
        <ArrowLeft size={16} strokeWidth={1.3} /> {title}
      </Box>
    </ChakraLink>
  );
}

export default BackToPage;
