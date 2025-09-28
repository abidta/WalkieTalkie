import { useEffect, useRef } from 'react'

const AudioEqualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          audioContextRef.current = new AudioContext()
          const source = audioContextRef.current.createMediaStreamSource(stream)
          analyserRef.current = audioContextRef.current.createAnalyser()
          source.connect(analyserRef.current)
          analyserRef.current.fftSize = 256

          const bufferLength = analyserRef.current.frequencyBinCount
          dataArrayRef.current = new Uint8Array(bufferLength)

          draw()
        })
        .catch((err) => {
          console.error('Error accessing audio stream:', err)
        })
    }
  }, [])

  const draw = () => {
    requestAnimationFrame(draw)
    if (!analyserRef.current || !canvasRef.current || !dataArrayRef.current) {
      return
    }
    analyserRef.current.getByteFrequencyData(dataArrayRef.current)

    const canvas = canvasRef.current
    const canvasCtx = canvas.getContext('2d')
    const { width, height } = canvas

    canvasCtx?.clearRect(0, 0, width, height)

    const barWidth = (width / dataArrayRef.current.length) * 1
    let barHeight
    let x = 0

    for (const element of dataArrayRef.current) {
      barHeight = element 
      if (canvasCtx) {
         canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)'
      canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2)
      }
     

      x += barWidth + 1
    }
  }

  return (
    <div>
      <canvas ref={canvasRef} width="640" height="100" />
    </div>
  )
}

export default AudioEqualizer
