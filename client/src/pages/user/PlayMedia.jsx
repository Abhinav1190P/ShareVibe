import { AgoraRTCProvider, useRTCClient, usePublish, useConnectionState } from "agora-rtc-react";
import AgoraRTC, { IBufferSourceAudioTrack } from "agora-rtc-sdk-ng";
import { useEffect, useState } from "react";
import config from "./config";

function MediaPlaying() {
    const agoraEngine = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: config.selectedProduct }));

    return (
        <div>
            <h1>Stream media to a channel</h1>

            <MediaPlayingComponent />
        </div>
    );
}

const PlayAudioFile = ({ track }) => {
    usePublish([track]);

    useEffect(() => {
        track.startProcessAudioBuffer();
        track.play(); // to play the track for the local user
        return () => {
            track.stopProcessAudioBuffer();
            track.stop();
        };
    }, [track]);

    return <div> Audio file playing </div>;
};

const MediaPlayingComponent = () => {
    const [isMediaPlaying, setMediaPlaying] = useState(false);
    const [audioFileTrack, setAudioFileTrack] = useState(null);
    const connectionState = useConnectionState();

    // Event handler for selecting an audio file
    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            try {
                AgoraRTC.createBufferSourceAudioTrack({ source: selectedFile })
                    .then((track) => { setAudioFileTrack(track) })
                    .catch((error) => { console.error(error); })
            } catch (error) {
                console.error("Error creating buffer source audio track:", error);
            }
        }
    };
    return (
        <div>
            <br />
            <label htmlFor="filepicker">Select an audio file: </label>
            <input
                type="file"
                id="filepicker"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={connectionState === "DISCONNECTED"}
            />
            <br /><br />
            <button type="button" onClick={() => setMediaPlaying((p) => !p)} disabled={!audioFileTrack}>
                {isMediaPlaying ? "Stop playing" : "Play audio file"}
            </button>
            <br /><br />
            {isMediaPlaying && audioFileTrack && <PlayAudioFile track={audioFileTrack} />}
            <br />
        </div>
    );
};

export default MediaPlaying;