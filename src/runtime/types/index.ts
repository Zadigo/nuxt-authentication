export type Undefineable<T> = T | undefined

export type Nullable<T> = T | null

export interface LoginApiResponse {
  access: string
  refresh: string
}

export type TokenRefreshApiResponse = Omit<LoginApiResponse, 'refresh'>

/**
 * @private
 */
export interface _DatabaseObject {
  id: string | number
}
