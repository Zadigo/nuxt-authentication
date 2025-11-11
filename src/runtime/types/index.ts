export type Undefineable<T> = T | undefined

export type Nullable<T> = T | null

export interface LoginApiResponse {
  /**
   * JWT Access Token
   */
  access: string
  /**
   * JWT Refresh Token
   */
  refresh: string
}

export type TokenRefreshApiResponse = Omit<LoginApiResponse, 'refresh'>

/**
 * @private
 */
export interface _DatabaseObject {
  /**
   * Unique identifier
   */
  id: string | number
}
