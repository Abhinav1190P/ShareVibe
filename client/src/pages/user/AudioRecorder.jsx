import React, { useState, useEffect } from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';
import axios from 'axios';
import { Box, IconButton, Flex, useToast } from '@chakra-ui/react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import io from 'socket.io-client'
let socket;
let connection_port = 'http://localhost:4000/'

const AudioRecorder = ({ currentChat, currentRoom, roomId, newMessageFuntion }) => {
    const [isRecording, setIsRecording] = useState(false);
    const toast = useToast();
    const api = useAxiosPrivate();

    useEffect(() => {
        socket = io(connection_port, {
            transports: ['websocket', 'polling']
        });

        return () => {
            socket.disconnect();
        };
    }, [connection_port]);

    const handleStop = async (blobUrl, blob) => {
        try {
            if (blob.type !== 'audio/wav') {
                console.log("EHYEEY")
                throw new Error('Recorded file is not in WAV format');
            }

            const formData = new FormData();
            const fileName = blob.name || 'audio.wav';
            const file = new File([blob], fileName, { type: blob.type });
            formData.append('file', file);
            console.log(file)
            formData.append('currentChat', JSON.stringify(currentChat));
            formData.append('currentRoom', currentRoom);
            formData.append('roomId', roomId);

            const response = await api.get("/api/auth/refresh");
            const { accessToken } = response.data;

            const responseServer = await axios.post('http://localhost:4000/api/user/reduce-voice-message', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${accessToken}`,
                },
                responseType: 'json',
            });

            const { audioMessage, fileUrl } = responseServer.data;

            newMessageFuntion({ _id: audioMessage._id, sender: audioMessage.sender, content: audioMessage.content, currentRoom: audioMessage.roomCode })

            toast({
                title: "Success!",
                description: "Noise reduced audio downloaded.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error reducing noise:', error);

            toast({
                title: "Error",
                description: "Failed to reduce noise.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box>
            <ReactMediaRecorder
                audio
                mimeType={'audio/wav'}
                onStop={handleStop}
                render={({ status, startRecording, stopRecording }) => (
                    <Flex direction="column" alignItems="center">
                        <IconButton
                            mr={4}
                            icon={isRecording ? <FaStop /> : <FaMicrophone />}
                            colorScheme={isRecording ? "green" : "gray"}
                            onClick={() => {
                                if (!currentChat || !currentRoom || !roomId) {

                                    toast({
                                        title: "Error",
                                        description: "Please select a chat and a room.",
                                        status: "error",
                                        duration: 5000,
                                        isClosable: true,
                                    });
                                    return;
                                }

                                if (isRecording) {
                                    stopRecording();
                                } else {
                                    startRecording();
                                }
                                setIsRecording(!isRecording);
                            }}
                            aria-label="Record"
                            size="sm"
                            isDisabled={!currentChat || !currentRoom || !roomId}
                        />
                    </Flex>
                )}
            />
        </Box>
    );
};

export default AudioRecorder;
