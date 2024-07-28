import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import fp from 'fastify-plugin'
import mongoose from 'mongoose'

async function connectDb(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  console.log('connecting to db....')
  try {
    mongoose.connection.on('connected', () => {
      fastify.log.info(
        { actor: 'MongoDB' },
        `connected ${mongoose.connection.host}:${mongoose.connection.port}`
      )
    })
    mongoose.connection.on('disconnected', () => {
      fastify.log.error({ actor: 'MongoDb' }, 'disconnected')
    })

    const db = await mongoose.connect(process.env.MONGO_URI)
  } catch (error) {
    console.log(error)
  }
}
export default fp(connectDb, { name: 'connect-db' })
