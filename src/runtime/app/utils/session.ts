import { useRuntimeConfig } from '#imports'
import defu from 'defu'
import { useSession, createError, isEvent } from 'h3'
import type { SessionConfig, H3Event } from 'h3'

export interface User {

}

export interface SecureSessionData {
}

export interface SessionData {
  /**
   * Session ID
   */
  id: string
  /**
   * User session data, available on client and server
   */
  user?: User
  /**
   * Private session data, only available on server-side code
   */
  secure?: SecureSessionData
  /**
   * Extra session data, available on client and server
   */
  [key: string]: unknown
}


export interface UserSessionInterface {
  /**
   * Setup the session with the provided session instance.
   * @param session The session instance to be used for managing the user session.
   */
  setup(session: ReturnType<typeof useSession>): void
  /**
   * Remove the session data and clear the session.
   */
  remove(): void
  /**
   * Update the session data with the provided data. This will merge the new data with the existing session data.
   * @param data The new session data to be merged with the existing session data.
   */
  update(data: SessionData): void
}

export class UserSession implements UserSessionInterface {
  private session: ReturnType<typeof useSession> | null

  constructor() {
    this.session = null
  }

  setup(session: ReturnType<typeof useSession>): void {
    this.session = session
  }

  async remove() {
    this.session = null
  }

  async update(data: SessionData) {
    if (this.session) {
      (await this.session).update(defu(data, (await this.session).data))
    }
  }
}

/**
 * 
 * @param event 
 * @param config 
 */
export function useUserSession(event: H3Event, config?: SessionConfig): UserSession {
  const runtimeConfig = useRuntimeConfig()

  const password: SessionConfig = {
    password: runtimeConfig.public.nuxtAuthentication.sessionPassword
  }

  const _config = defu(config, password)
  const instance = new UserSession()

  if (isEvent(event)) {
    const result = useSession(event, _config)
    instance.setup(result)
  }

  return instance
}
