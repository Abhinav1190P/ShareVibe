'use client'

import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Input,
  MenuButton,
  MenuItem,
  MenuDivider,
  MenuList,
  Image,
  Avatar,
  Menu,
  PopoverBody,
  InputRightElement,
  List, ListItem,
  InputGroup,
  HStack,
  Link,
  useColorMode
} from '@chakra-ui/react'
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons'
import { CiSearch } from "react-icons/ci";
import { IoMdNotifications } from "react-icons/io";
import { IoIosSettings } from "react-icons/io";
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { useTab } from '../../../contexts/TabContext'
import useAuth from '../../../hooks/useAuth';
import logo from '../../../assets/images/icon.png'

export default function Header() {
  const { isOpen, onToggle } = useDisclosure()
  const [info, setInfo] = useState({})
  const api = useAxiosPrivate()
  const { colorMode, toggleColorMode } = useColorMode()
  const { logout } = useAuth()
  const nav = useNavigate()
  useEffect(() => {
    api.get("/api/user/profile")
      .then(({ data }) => {
        setInfo(data);
      })
      .catch((error) => {
        setInfo(null);
        console.log(error);
      });
  }, []);
  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}>
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex pt={3} flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>

          <Image onClick={() => { nav('/user/profile') }} w="200px" src={logo} alt="Goldsmiths" />


          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={1}>
          <Button mr={2} onClick={toggleColorMode}>
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </Button>
          <Flex alignItems={'center'}>
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar
                  size={'sm'}
                  src={
                    info ? info.profile_photo : null
                  }
                />
              </MenuButton>
              <MenuList>
                <MenuItem><Link href='/user/settings'>Settings</Link></MenuItem>
                <MenuItem><Link href='/user/linked-accounts'>Link account</Link></MenuItem>
                <MenuDivider />
                <MenuItem onClick={logout}><Link color={'red'}>Logout</Link></MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  )
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200')
  const linkHoverColor = useColorModeValue('gray.800', 'white')
  const popoverContentBgColor = useColorModeValue('white', 'gray.800')
  const [searchedUserName, setSearchedUserName] = useState('')
  const [searchedUsers, setSearchedUsers] = useState([])
  const api = useAxiosPrivate()

  const nav = useNavigate()
  const getUserbyUserName = (value) => {
    if (value !== '') {
      setSearchedUserName(value)
    }
    else {
      setSearchedUserName('')
    }
  }

  useEffect(() => {
    const fetchUsername = async (keyword) => {
      try {
        await api.get(`/api/user/search-user/${keyword}`)
          .then(({ data }) => {
            if (data?.users?.length > 0) {
              setSearchedUsers(data.users)
            }
            else {
              setSearchedUsers([])
            }
          }).catch((error) => {
            console.log(error)
          })
      } catch (error) {
        console.log(error)
      }
    }

    fetchUsername(searchedUserName)
  }, [searchedUserName])

  const { setTab } = useTab()

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box onClick={() => { setTab(navItem.data) }} key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Box
                cursor={'pointer'}
                as="a"
                p={2}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}>
                {navItem.label}
              </Box>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                pt={5}
                rounded={'xl'}
                minW={'sm'}>
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}

          </Popover>
        </Box>
      ))}

      <Popover autoFocus={false}>
        <PopoverTrigger>
          <InputGroup size={'sm'}>
            <InputRightElement _active={{ color: 'blue.300' }}>
              <CiSearch cursor={'pointer'} />
            </InputRightElement>
            <Input onChange={(e) => { getUserbyUserName(e.target.value) }} size={'sm'} maxW={'200px'} borderRadius={20} placeholder='Search' />
          </InputGroup>
        </PopoverTrigger>
        <PopoverContent boxShadow={'lg'}>
          <PopoverBody>
            <List>
              {
                searchedUsers.length > 0 ? (

                  searchedUsers.map((user) => (
                    <ListItem onClick={() => { nav(`user/search/${user?.userName}`) }} py={3} pl={3} cursor={'pointer'} _hover={{ bg: 'blue.100' }} key={user._id}>
                      <HStack>
                        <Avatar size={'sm'} />
                        <Text>{user.userName}</Text>
                      </HStack>
                    </ListItem>
                  ))

                ) : (
                  searchedUserName ? (
                    <Box>No users found</Box>
                  ) : (null))
              }
            </List>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Stack>
  )
}

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Box
      as="a"
      href={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('pink.50', 'gray.900') }}>
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'pink.400' }}
            fontWeight={500}>
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}>
          <Icon color={'pink.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Box>
  )
}

const MobileNav = () => {
  return (
    <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Box
        py={2}
        as="a"
        href={href ?? '#'}
        justifyContent="space-between"
        alignItems="center"
        _hover={{
          textDecoration: 'none',
        }}>
        <Text fontWeight={600} color={useColorModeValue('gray.600', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Box>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}>
          {children &&
            children.map((child) => (
              <Box as="a" key={child.label} py={2} href={child.href}>
                {child.label}
              </Box>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
}


const NAV_ITEMS = [
  {
    label: 'Home',
    herf: '/user/profile',
    data: 'Profile'
  },
  {
    label: 'Requests',
    data: 'Friend Requests'
  },
  {
    label: 'Messages',
    href: '#',
    data: 'Messenger'
  }

]