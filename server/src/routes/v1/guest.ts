import { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
  fastify.route({
    url: '/',
    method: 'GET',
    handler(req, reply) {
      reply.send({ message: 'this is guest' })
    },
  })
}
