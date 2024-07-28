import { FastifyInstance } from 'fastify'
import auth from './auth'
import guest from './guest'
import user from './user'

async function v1Routes(fastify: FastifyInstance) {
  fastify.register(auth, { prefix: '/auth' })
  fastify.register(guest, { prefix: '/guest' })
  fastify.register(user, { prefix: '/user' })
}

export default v1Routes
