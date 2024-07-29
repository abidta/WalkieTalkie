import { useEffect, useState } from 'react'
import './App.css'
import { socket } from './socket'

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [pong, setPong] = useState(false)

  const pingHandler = () => {
    socket.emit('ping', 'user')
  }
  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
      console.log('connected')
    }
    function onDisconnect() {
      setIsConnected(false)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
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
      <button onClick={pingHandler}>ping</button>
      {pong && <h3>Pong</h3>}
    </>
  )
}

export default App
