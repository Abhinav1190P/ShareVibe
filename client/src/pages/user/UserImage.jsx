import React from 'react';
import { Image } from '@chakra-ui/react';
const UserImage = ({ pic, name }) => (
  <Image

    src={
      pic ||
      'https://bit.ly/kent-c-dodds'
    }
    alt={name}
    boxSize="100px"
    borderRadius="full"
    fallbackSrc="https://bit.ly/kent-c-dodds"
    mx="auto"
  />
);

export default UserImage;
