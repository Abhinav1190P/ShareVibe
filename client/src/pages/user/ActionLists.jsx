import { Flex, HStack, IconButton, VStack, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { FaUser } from "react-icons/fa";
import { TiUserAdd } from "react-icons/ti";
import { MdGroups } from "react-icons/md";
import { TbMessageCircleHeart } from "react-icons/tb";
import { FaStar } from "react-icons/fa";
import { PiSpeakerLowFill } from "react-icons/pi";
import { MdEventNote } from "react-icons/md";
import { SiGotomeeting } from "react-icons/si";
import { MdScheduleSend } from "react-icons/md";

export default function ActionLists({ sendCurrentAction }) {

  return (
    <Flex bg={useColorModeValue('white', '#1A202C')} flexDirection={'row'} alignItems={'flex-start'} justifyContent={'center'} w="100%" h={'100%'}>
      <VStack spacing={7} p={7} alignItems={'flex-start'} w="100%" >
        {
          listItems.map((item, i) => (
            <HStack onClick={() => sendCurrentAction(item.label)} _hover={{ bg: '#1E90F1', opacity: .8, color: 'white' }} borderRadius={'20px'} cursor={'pointer'} w="100%" spacing={1} pr={3}>
              <IconButton size={'md'} bg={'transparent'} _hover={{ color: 'white' }}>
                {item.icon}
              </IconButton>
              <Text fontWeight={600}>
                {item.label}
              </Text>
            </HStack>
          ))
        }
      </VStack>
    </Flex>
  )
}


const listItems = [
  {
    label: "Profile",
    icon: <FaUser />
  },
  {
    label: "Friend Requests",
    icon: <TiUserAdd />
  },
  {
    label: "Groups",
    icon: <MdGroups />
  },
  {
    label: "Messenger",
    icon: <TbMessageCircleHeart />
  },
  {
    label: "Video call",
    icon: <SiGotomeeting />
  },
  {
    label: "Announcements",
    icon: <PiSpeakerLowFill />
  },
  {
    label: "Events",
    icon: <MdEventNote />
  },
  {
    label: "Schedule messages",
    icon: <MdScheduleSend />
  }
]