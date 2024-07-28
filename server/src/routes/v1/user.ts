import { VerifyPayloadType } from '@fastify/jwt'
import { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
  fastify.addHook('onRequest', (req, reply, done) => {
    console.log(req.user)

    const token = req.cookies['access_token']
    if (!token) {
      reply.unauthorized('No token found')
    }
    const { user } = fastify.jwt.verify(token) as VerifyPayloadType & {
      user: string
    }
    req.user = user
    done()
  })
  fastify.route({
    url: '/',
    method: 'GET',
    handler(req, reply) {
      reply.send(req.user)
    },
  })
}
