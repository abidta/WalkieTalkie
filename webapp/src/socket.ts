import { io } from 'socket.io-client'
import Env from './config/Env'
console.log(import.meta.env)

const URL = Env.VITE_NODE_ENV === 'production' ? undefined : Env.VITE_BASE_URL_DEV

export const socket = io(URL as string)
