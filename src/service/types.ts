export interface BaseModel {
  id: number
  updated_at?: number
  created_at?: number
}

export interface Token {
  access_token: string
  expires_in: number
  refresh_token: string
  token_type: string
}

export interface ResType<T> {
  response_token: object
}

export type PromiseResType<T> = Promise<ResType<T>>

export type NullableResp = Promise<ResType<number[]>>
