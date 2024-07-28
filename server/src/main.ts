import Fastify from 'fastify'
import app from './app'

const fastify = Fastify({
  logger: true,
})
async function main() {
  fastify.register(app)
  fastify.listen({ port: 3000 })
}

main().catch((err) => {
  fastify.log.error(err)
  process.exit(1)
})
