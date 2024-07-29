import Fastify from 'fastify'
import app from './app'
import fastifySocketIO from 'fastify-socket.io'

const fastify = Fastify({
  logger: true,
})
async function main() {
  fastify.register(app)
  fastify.register(fastifySocketIO)
  // await fastify.ready()
  fastify.ready().then(() => {
    fastify.io.on('connection', (socket) => {
      console.log('somee', socket.id)
    })
  })

  fastify.listen({ port: 3000 })
}

main().catch((err) => {
  fastify.log.error(err)
  process.exit(1)
})
