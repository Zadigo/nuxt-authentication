import type { _DatabaseObject } from '.'

/**
 * Data for an authenticated user profile
 */
export type Profile<T extends Record<string, string | number | boolean>> = _DatabaseObject & T
