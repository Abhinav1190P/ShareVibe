import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function VideoCall() {
  const [roomId, setRoomId] = useState("")
  const nav = useNavigate('')
  const HandleJoin = () => {
    nav(`/user/video/${roomId}`)
  }
  return (
    <div>
      <input placeholder='Enter room id' value={roomId} onChange={(e) => { setRoomId(e.target.value) }} />
      <button onClick={() => { HandleJoin() }}>Join</button>
    </div>
  )
}
