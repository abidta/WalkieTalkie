import { FastifyInstance } from 'fastify'
import v1Routes from './v1/v1.routes'

export default async function root(fastify: FastifyInstance) {
  fastify.register(v1Routes, { prefix: '/v1' })
}
