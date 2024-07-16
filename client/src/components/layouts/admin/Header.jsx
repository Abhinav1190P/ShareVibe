'use client'

import {
  Box,
  Flex,
  Avatar,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Link,
  useColorMode,
  Image,
  Center,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import useAuth from '../../../hooks/useAuth'
import { useState, useEffect } from 'react'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate'
import logo from '../../../assets/images/icon.png'
import { useNavigate } from 'react-router-dom'
const NavLink = (props) => {
  const { children } = props

  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
      href={'#'}>
      {children}
    </Box>
  )
}

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [info, setInfo] = useState({})
  const api = useAxiosPrivate()
  const { logout } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    api
      .get("/api/admin/profile")
      .then(({ data }) => {
        setInfo(data);
      })
      .catch((error) => {
        setInfo(null);
        console.log(error);
      });
  }, []);

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Flex pt={3} pb={2} flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>

            <Image onClick={() => { nav('/user/profile') }} w="50px" src={logo} alt="Goldsmiths" />

          </Flex>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>

              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    size={'sm'}
                    src={info ? info.profile_photo : null}

                  />
                </MenuButton>
                <MenuList alignItems={'center'}>
                  <br />
                  <Center>
                    <Avatar
                      size={'2xl'}
                      src={info ? info.profile_photo : null}
                    />
                  </Center>
                  <br />
                  <Center>
                    <p>{info ? info.userName : null}</p>
                  </Center>
                  <br />
                  <MenuDivider />
                  <MenuItem onClick={logout}><Link color={'red'}>Logout</Link></MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  )
}