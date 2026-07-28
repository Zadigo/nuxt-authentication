import { sendRedirect } from 'h3'
import { isDefined } from '@vueuse/core'
import { defineOAuthAppleEventHandler } from '../../../../src/runtime/server/lib/oauth/apple.get'

export default defineOAuthAppleEventHandler({
  async onSuccess(event, result) {
    let username: string = ''

    if (isDefined(result)) {
      if (result.user.name?.firstName && result.user.name?.lastName) {
        username = `${result.user.name.firstName} ${result.user.name.lastName}`
      } else {
        username = result.user.name?.firstName || result.user.name?.lastName || result.user.email || result.pub
      }
    }

    console.log(username)

    return sendRedirect(event, '/', 302)
  }
})
