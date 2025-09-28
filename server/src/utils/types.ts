import { Server } from 'socket.io'

export interface LoginBody {
  username: string
  password: string
}

export interface SignupBody extends LoginBody {
  email: string
}

declare module 'fastify' {
  interface FastifyInstance {
    io: Server<
      { [key: string]: (msgObj: { [key: string]: string }) => void },
      { [key: string]: (msgObj: { [key: string]: string }) => void }
    >
  }
}
