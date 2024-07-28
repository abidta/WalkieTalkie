import { FastifyInstance } from 'fastify'
import { onLogin, onSignup } from 'src/handlers/auth.handlers'

export default async function auth(fastify: FastifyInstance) {
  fastify.route({
    url: '/login',
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['username', 'password'],
      },
    },
    handler: onLogin,
  })
  fastify.route({
    url: '/signup',
    method: 'POST',
    handler: onSignup,
    schema: {
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['username', 'email', 'password'],
      },
    },
  })
}
