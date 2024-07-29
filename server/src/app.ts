import { FastifyInstance } from 'fastify'
import Autoload from '@fastify/autoload'
import { join } from 'path'
import Sensible from '@fastify/sensible'
import Formbody from '@fastify/formbody'
import Env from '@fastify/env'
import connectDb from './plugin/db'
import JWT from '@fastify/jwt'
import Cookie from '@fastify/cookie'
import fastifySocketIO from 'fastify-socket.io'

export default async function (app: FastifyInstance) {
  await app.register(Env, {
    dotenv: true,
    schema: {
      type: 'object',
      required: ['MONGO_URI', 'JWT_SECRET'],
      properties: {
        MONGO_URI: { type: 'string' },
        JWT_SECRET: { type: 'string' },
      },
    },
  })

  await app.register(connectDb)
  await app.register(Cookie, { parseOptions: { httpOnly: true } })
  app.register(Formbody)
  app.register(Sensible)
  app.register(JWT, { secret: process.env.JWT_SECRET })

  app.register(Autoload, {
    dir: join(__dirname, 'routes'),
    options: { prefix: '/api' },
    dirNameRoutePrefix: false,
    maxDepth: 0,
  })

  app.get('/ping', (req, rep) => {
    rep.code(200).setCookie('abid', 'some', { maxAge: 222222 })
    return { message: 'Pong' }
  })
  app.register(fastifySocketIO)
}
