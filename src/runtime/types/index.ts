export type Undefineable<T> = T | undefined

export type Nullable<T> = T | null

export type Emptyable<T> = T | null | undefined

export interface LoginApiResponse {
  access: string
  refresh: string
  detail?: string
}

export type SsrApiResponse = Partial<Pick<LoginApiResponse, 'detail'>> & {
  success: boolean
}

export type SsrMeApiResponse = {
  user_id: number
}

export type TokenRefreshApiResponse = Omit<LoginApiResponse, 'refresh'>

export type VerifyTokenApiResponse = {
  detail: string
  code: string
}

/**
 * @private
 */
export interface _DatabaseObject {
  /**
   * Unique identifier
   */
  id: string | number
}

export interface JWTResponseData {
  /**
   * User ID of the authenticated user
   */
  user_id: string | number
}
