import { Box } from "@chakra-ui/react";

const Flexbox = ({ flexDirection, justifyContent, alignItems, gap, sx, children }) => {
  return (
    <Box
      display="flex"
      flexDirection={{ base: "column", sm: flexDirection || "row" }}
      justifyContent={{ sm: justifyContent || "space-between" }}
      alignItems={{ sm: alignItems || "center" }}
      gap={{ base: 1, sm: gap || 2 }}
      {...sx}
    >
      {children}
    </Box>
  );
};

export default Flexbox;
