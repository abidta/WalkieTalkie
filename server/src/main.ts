import Fastify from 'fastify'
import app from './app'
import SocketIO from 'fastify-socket.io'

const fastify = Fastify({
  logger: true,
})
async function main() {
  fastify.register(app)
  fastify.register(SocketIO, {
    cors: {
      origin: 'http://localhost:5173',
    },
  })
  // await fastify.ready()
  fastify.ready().then(() => {
    fastify.io.on('connection', (socket) => {
      console.log(socket.id, 'connected')
      socket.on('ping', (msg) => {
        console.log('pinged', msg)
        socket.emit('pong', socket.id)
      })
    })
  })

  fastify.listen({ port: 3000 })
}

main().catch((err) => {
  fastify.log.error(err)
  process.exit(1)
})
