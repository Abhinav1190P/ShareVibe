import React from 'react'
import { useParams } from 'react-router-dom'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { v4 } from 'uuid'

export default function VideoRoom() {
    const { room } = useParams()

    async function meetingUI(element) {
        const appId = 1044162391
        const serverSecret = '7512a016c9548039a6f685f4fa813c7f'
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appId,
            serverSecret,
            room,
            v4(),
            "Abhinav"
        )

        const ui = ZegoUIKitPrebuilt.create(kitToken)
        ui.joinRoom({
            container: element,
            scenario: {
                mode: ZegoUIKitPrebuilt.VideoConference
            }
        })
    }
    return (
        <div>
            RoomID: {room}
            <div ref={meetingUI}></div>
        </div>
    )
}
