import Fastify from 'fastify'
import app from './app'
import SocketIO from 'fastify-socket.io'

const fastify = Fastify({
  logger: true,
})
const channelSpeakers = {}
async function main() {
  fastify.register(app)
  fastify.register(SocketIO, {
    cors: {
      // origin: 'http://localhost:5173',
      origin: '*',
    },
  })
  // await fastify.ready()
  fastify.ready().then(() => {
    fastify.io.on('connection', (socket) => {
      console.log(socket.id, 'connected')
      socket.on('ping', (msg) => {
        console.log('pinged', msg)
        socket.emit('pong', { message: 'pong' })
      })

      // join band
      socket.on('join-band', (msg) => {
        console.log('joined', msg)
        socket.join(msg.bandId)
        socket.to(msg.bandId).emit('user-joined', { socketId: socket.id })
      })

      // Relay SDP offers/answers
      socket.on('signal', (data) => {
        socket.to(data.to).emit('signal', {
          from: socket.id,
          sdp: data.sdp,
          candidate: data.candidate,
        })
      })

      socket.on('request-speak', ({ bandId }) => {
        if (!channelSpeakers[bandId]) {
          // Grant permission
          channelSpeakers[bandId] = socket.id
          fastify.io.to(bandId).emit('speaker-start', { userId: socket.id })
        } else {
          // Reject, someone else is talking
          socket.emit('speaker-denied', { current: channelSpeakers[bandId] })
        }
      })

      socket.on('release-speak', ({ bandId: channelId }) => {
        if (channelSpeakers[channelId] === socket.id) {
          delete channelSpeakers[channelId]
          fastify.io.to(channelId).emit('speaker-stop', { userId: socket.id })
        }
      })

      socket.on('disconnect', () => {
        for (const channelId in channelSpeakers) {
          if (channelSpeakers[channelId] === socket.id) {
            delete channelSpeakers[channelId]
            fastify.io.to(channelId).emit('speaker-stop', { userId: socket.id })
          }
        }
      })
    })
  })

  fastify.listen({ port: 3000 })
}

main().catch((err) => {
  fastify.log.error(err)
  process.exit(1)
})
