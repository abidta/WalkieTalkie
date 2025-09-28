import { useEffect, useRef, useState } from 'react'
import './App.css'
import { socket } from './socket'
import { useWebRTC } from './hooks/useWebRTC'
import AudioPlayer from './components/Audio'

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [pong, setPong] = useState(false)
  const myId = useRef<string | null>(null)

  const { remoteAudios, startMic } = useWebRTC('1', myId)

  const pingHandler = () => {
    socket.emit('ping', { user: 'abid' })
  }
  const releaseSpeak = () => {
    socket.emit('release-speak', { bandId: '1' })
  }

  const requestToSpeak = () => {
    console.log('mouse down')
    socket.emit('request-speak', { bandId: '1' })
  }

  useEffect(() => {

    function onConnect() {
      myId.current = socket.id!
      setIsConnected(true)
      console.log('connected', socket.id)
    }
    function onDisconnect() {
      setIsConnected(false)
    }

    socket.on('connect', onConnect)
    // socket.on('disconnect', onDisconnect)
    startMic()
    
    return () => {
      // socket.off('connect', onConnect)
      // socket.off('disconnect', onDisconnect)
    }
  }, [])

  useEffect(() => {
    socket.on('pong', (msg) => {
      console.log(msg)
      setPong(true)
    })
    return () => {
      socket.off('pong')
    }
  }, [])

  return (
    <>
      <h1>Hello Walkie</h1>
      {isConnected && <p>Iam connected</p>}
      <button onMouseDown={requestToSpeak} onMouseUp={releaseSpeak}>
        Hold to Talk
      </button>

      <button onClick={pingHandler}>ping</button>
      {pong && <h3>Pong</h3>}
      {Object.entries(remoteAudios).map(([peerId, stream]) => (
        <AudioPlayer key={peerId} stream={stream} />
      ))}
    </>
  )
}

export default App
