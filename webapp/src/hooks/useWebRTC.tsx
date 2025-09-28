import { useEffect, useRef, useState } from 'react'
import { socket } from '../socket'

export function useWebRTC(bandId: string, myId:React.MutableRefObject<string | null> ) {
  const [remoteAudios, setRemoteAudios] = useState<{ [id: string]: MediaStream }>({})
  const peersRef = useRef<{ [id: string]: RTCPeerConnection }>({})
  const localStreamRef = useRef<MediaStream | null>(null)
    console.log(myId, 'my id')
  useEffect(() => {
    socket.on('speaker-start', ({ userId }) => {
      console.log(userId, myId, 'in speaker start')
      if (userId === myId.current) {
        // ✅ I got permission → unmute mic

        localStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = true))
      } else {
        // 🔇 Someone else is talking → mute my mic
        localStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = false))
      }
    })

    socket.on('speaker-stop', ({ userId }) => {
      if (userId === myId.current) {
        // I released → mute my mic
        localStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = false))
      }
    })

    socket.on('speaker-denied', ({ current }) => {
      console.log('Denied. Current speaker:', current)
    })

    socket.emit('join-band', { bandId })

    socket.on('user-joined', async ({ socketId: remoteId }) => {
      console.log('New user in channel:', remoteId)
      await createOffer(remoteId)
    })

    socket.on('signal', async ({ from, sdp, candidate }) => {
      let pc = peersRef.current[from]
      if (!pc) {
        pc = createPeerConnection(from)
      }

      if (sdp) {
        if (sdp.type === 'offer' && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(sdp)
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit('signal', { to: from, sdp: answer })
        } else if (sdp.type === 'answer' && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(sdp)
        }
      }

      if (candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })

    return () => {
      socket.off('user-joined')
      socket.off('signal')
    }
  }, [bandId])

  const createPeerConnection = (remoteId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal', { to: remoteId, candidate: event.candidate })
      }
    }

    pc.ontrack = (event) => {
      console.log('Remote track from', remoteId)
      setRemoteAudios((prev) => ({
        ...prev,
        [remoteId]: event.streams[0],
      }))
    }

    peersRef.current[remoteId] = pc
    return pc
  }

  const createOffer = async (remoteId: string) => {
    const pc = createPeerConnection(remoteId)

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStreamRef.current!))
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket.emit('signal', { to: remoteId, sdp: offer })
  }

  const startMic = async () => {
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    return localStreamRef.current
  }

  return { startMic, remoteAudios }
}
