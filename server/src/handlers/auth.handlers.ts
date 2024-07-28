import { FastifyReply, FastifyRequest } from 'fastify'
import User from 'src/models/user.model'
import { LoginBody, SignupBody } from 'src/utils/types'

export const onLogin = async (
  req: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
) => {
  const { username, password } = req.body
  const user = await User.findOne({ username: username })

  if (!user) {
    return reply.badRequest('user deosnt exist')
  }
  if (!(await user.matchPassword(password))) {
    reply.unauthorized('password deosnt match')
  }

  const token = req.server.jwt.sign({ user: user._id })

  reply.setCookie('access_token', token, {
    httpOnly: true,
    maxAge: 3600 * 1000,
  })

  return { message: 'successfully logged in', token }
}
export const onSignup = async (
  req: FastifyRequest<{ Body: SignupBody }>,
  reply: FastifyReply
) => {
  const { username, email } = req.body
  const user = await User.findOne({
    $or: [{ username: username }, { email: email }],
  })
  if (user) {
    return reply.badRequest('user already exist')
  }
  await User.create(req.body)
  return { message: `Successfully created user ${username}` }
}
