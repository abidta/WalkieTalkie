import mongoose, { Model, Schema } from 'mongoose'
import bcrypt from 'bcrypt'

interface IUserMethods {
  matchPassword: (pwd: string) => Promise<boolean>
}

interface IUser {
  username: string
  email: string
  password: string
}
type UserModel = Model<IUser, object, IUserMethods>

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: {
    type: String,
    required: true,
    minLength: [3, 'minimum 3 character for user names you entered :{VALUE}'],
    maxLength: [30, 'maximum 30 character for user names'],
  },
  email: {
    type: String,
    required: true,
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      'Enter a valid email',
    ],
  },
  password: {
    type: String,
    requied: true,
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'password must include a lowercase, uppercase, number and special character',
    ],
  },
})

async function hashPassword() {
  const salt = await bcrypt.genSalt()
  this.password = await bcrypt.hash(this.password, salt)
}

userSchema.pre('save', hashPassword)
userSchema.methods.matchPassword = async function compare(pwd: string) {
  return await bcrypt.compare(pwd, this.password)
}

const User = mongoose.model<IUser, UserModel>('User', userSchema)

export default User
