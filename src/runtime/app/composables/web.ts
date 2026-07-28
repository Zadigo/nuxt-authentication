import { browserSupportsWebAuthn, browserSupportsWebAuthnAutofill, platformAuthenticatorIsAvailable, startAuthentication, startRegistration } from '@simplewebauthn/browser'
import type { VerifiedAuthenticationResponse, VerifiedRegistrationResponse } from '@simplewebauthn/server'
// import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types'
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser'
import type { WebAuthnUser } from '../../types'
 
export type WebAuthenticationOptions = {
  registerEndpoint: string
  authenticateEndpoint: string
  browserAutoFill: boolean
}

interface RegistrationInitResponse {
  creationOptions: PublicKeyCredentialCreationOptionsJSON
  attemptId: string
}

interface AuthenticationInitResponse {
  requestOptions: PublicKeyCredentialRequestOptionsJSON
  attemptId: string
}


export function useWebauthnAuthentication(options?: Partial<WebAuthenticationOptions>) {
  const { registerEndpoint, authenticateEndpoint, browserAutoFill } = options || {}
  
  async function signup(user: WebAuthnUser) {
    if (!registerEndpoint) {
      throw new Error('registerEndpoint is required for web authentication signup.')
    }

    const { creationOptions, attemptId } = await $fetch<RegistrationInitResponse>(registerEndpoint, {
      method: 'POST',
      body: {
        user,
        verify: false,
      },
    })

    const attestationResponse = await startRegistration({
      optionsJSON: creationOptions,
    })

    const verificationResponse = await $fetch<VerifiedRegistrationResponse>(registerEndpoint, {
      method: 'POST',
      body: {
        user,
        attemptId,
        response: attestationResponse,
        verify: true
      }
    })

    return verificationResponse && verificationResponse.verified
  }

  async function authenticate(username?: string) {
    if (!authenticateEndpoint) {
      throw new Error('authenticateEndpoint is required for web authentication.')
    }

    const { requestOptions, attemptId } = await $fetch<AuthenticationInitResponse>(authenticateEndpoint, {
      method: 'POST',
      body: {
        verify: false,
        userName: username,
      },
    })

    const assertionResponse = await startAuthentication({
      optionsJSON: requestOptions,
      useBrowserAutofill: browserAutoFill,
    })

    const verificationResponse = await $fetch<VerifiedAuthenticationResponse>(authenticateEndpoint, {
      method: 'POST',
      body: {
        attemptId,
        userName: username,
        response: assertionResponse,
        verify: true,
      },
    })

    return verificationResponse && verificationResponse.verified
  }

  const supportsWebAuthn = computed(() => browserSupportsWebAuthn())
  const supportsAutofill = computed(() => browserSupportsWebAuthnAutofill())
  const platformAuthenticatorAvailable = computed(() => platformAuthenticatorIsAvailable())

  return {
    supportsWebAuthn,
    supportsAutofill,
    platformAuthenticatorAvailable,
    signup,
    authenticate,
  }
}
