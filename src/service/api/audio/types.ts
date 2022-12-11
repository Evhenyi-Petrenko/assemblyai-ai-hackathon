// example types
import { ResType } from '~/service/types'

export type Role = 0 | 1 | 2

export interface Token {
  access_token: string
  expires_in: number
  refresh_token: string
  token_type: string
}

export interface ILoginParams {
  email: string
  password: string | number
}

export interface IUser {
  id: number
  username: string
  role: Role
  token: Token
}

export interface ILoginApi {
  LOGIN: (params: ILoginParams) => Promise<ResType<Token>>
}
