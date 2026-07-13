export type Undefineable<T> = T | undefined

export type Nullable<T> = T | null

export type Emptyable<T> = T | null | undefined

export type BaseDjangoResponse = {
  detail?: string
  code?: string
}

export type BaseSsrResponse = {
  success: boolean
}

export interface DjangoLoginResponse {
  access: string
  refresh: string
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
