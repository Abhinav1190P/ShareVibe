import { useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteAudioTracks, useRemoteUsers, RemoteUser, LocalVideoTrack, useClientEvent } from "agora-rtc-react";
import { Box, Flex } from "@chakra-ui/react";

export default function Videos(props) {
    const returnGrid = (remoteUsers) => {
        return {
            gridTemplateColumns:
                remoteUsers.length > 8
                    ? unit.repeat(4)
                    : remoteUsers.length > 3
                        ? unit.repeat(3)
                        : remoteUsers.length > 0
                            ? unit.repeat(2)
                            : unit,
        };
    };
    const unit = "minmax(0, 1fr) ";

    const { AppID, channelName, token } = props;
    const { isLoading: isLoadingMic, localMicrophoneTrack } = useLocalMicrophoneTrack();
    const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
    const remoteUsers = useRemoteUsers();

    usePublish([localMicrophoneTrack, localCameraTrack]);
    useJoin({
        appid: AppID,
        channel: channelName,
        token: token === "" ? null : token,
    });


    const { audioTracks } = useRemoteAudioTracks(remoteUsers);
    audioTracks.map((track) => track.play());

    const deviceLoading = isLoadingMic || isLoadingCam;
    if (deviceLoading) return <Box>Loading devices...</Box>;

    return (
        <Flex gridTemplateColumns={returnGrid(remoteUsers)}>
            <LocalVideoTrack track={localCameraTrack} play={true} style={{ width: '100px', height: '100px' }} />
            {remoteUsers.map((user, index) => (
                <RemoteUser key={index} user={user} />
            ))}
        </Flex>
    );
}
