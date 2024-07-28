export interface LoginBody {
  username: string
  password: string
}

export interface SignupBody extends LoginBody {
  email: string
}
