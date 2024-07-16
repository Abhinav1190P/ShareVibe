import { useEffect, useState } from "react";
import { Heading, Container, Text, Box, HStack, VStack, useColorModeValue } from "@chakra-ui/react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import ActionLists from "./ActionLists";
import Posts from "./Posts";
import EventsNews from './EventsNews'
import UserProfileMain from "./UserProfile";
import FriendRequestPage from "./FriendRequestPage"
import Groups from "./Groups";
import Messenger from "./Messenger";
import VideoCall from './VideoCall'
import Announcements from "./Announcements";
import Events from "./Events";
import { useTab } from '../../contexts/TabContext';
import ScheduleMessages from "./ScheduleMessages";
const Profile = () => {
  const api = useAxiosPrivate();
  const [info, setInfo] = useState(null);
  const [ActionSelected, setActionSelected] = useState(null);
  const { currentTab } = useTab();

  useEffect(() => {
    api
      .get("/api/user/profile")
      .then(({ data }) => {
        setInfo(data);
      })
      .catch((error) => {
        setInfo(null);
        console.error(error);
      });
  }, []);

  const rederedPages = [
    { name: 'Profile', component: UserProfileMain },
    { name: 'Friend Requests', component: FriendRequestPage },
    { name: 'Groups', component: Groups },
    { name: 'Messenger', component: Messenger },
    { name: 'Video call', component: VideoCall },
    { name: 'Announcements', component: Announcements },
    { name: 'Events', component: Events },
    { name: 'Schedule messages', component: ScheduleMessages }

  ]
  const ActiveScreen = rederedPages.find(
    (screen) => screen.name === ActionSelected
  )?.component;

  const handleSelectedAction = (action) => {
    if (action) {
      setActionSelected(action)
    }
  }
  useEffect(() => {
    if (currentTab) {
      setActionSelected(currentTab)
    }
  }, [currentTab])


  return (
    <HStack spacing={3} minH={'92vh'} alignItems={'flex-start'} justifyContent={'flex-start'}>
      <div style={{ width: '20%', position: 'sticky', top: 0 }}>
        <VStack h="100%" spacing={0} justify="flex-start" bg="white">
          <Box w="100%">
            <ActionLists sendCurrentAction={handleSelectedAction} />
          </Box>
        </VStack>
      </div>

      <div style={{ width: ActiveScreen ? '80%' : '50%', overflowY: 'auto' }}>
        <VStack h="100%" spacing={0} align="stretch">
          <Box w="100%">
            {ActiveScreen ? <ActiveScreen /> : <Posts />}
          </Box>
        </VStack>
      </div>
      {ActiveScreen ? null :
        <div style={{ width: '30%', position: 'sticky', top: 0 }}>
          <VStack h="100%" spacing={0} justify="flex-start" bg="white">
            <Box w="100%">
              <EventsNews />
            </Box>
          </VStack>
        </div>
      }

      {/*   {info ? (
        <>
          <Text>Name: {info.name}</Text>
          <Text>Email: {info.email}</Text>
        </>
      ) : (
        "loading"
      )} */}
    </HStack>
  );
};

export default Profile;
