import { Box, Heading } from "@chakra-ui/react";

const PageTitle = ({ title, children, sx = {}, ...props }) => {
  return (
    <Heading
      as="h2"
      mt={0}
      mb={0}
      color="secondary.title"
      {...props}
      sx={sx}
    >
      {title || children}
    </Heading>
  );
};

export default PageTitle;
