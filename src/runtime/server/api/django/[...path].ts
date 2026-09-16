export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Set up your Django backend base URL
  const djangoBaseUrl = config.public.nuxtAuthentication.domain || 'http://127.0.0.1:8000'

  // Get the subpath after /api/django/ (e.g., "v1/users/profile/")
  const remainingPath = event.context.params?.path || ''
  const targetUrl = `${djangoBaseUrl}/${remainingPath}`

  // Fetch the header we attached in our middleware
  const authHeader = event.context.djangoAuthHeader

  if (authHeader) {
    // Inject the authorization header securely before proxying
    event.node.req.headers['authorization'] = authHeader
  }

  // Nitro's proxyRequest automatically forwards 
  // methods, bodies, queries, and headers safely
  return await proxyRequest(event, targetUrl)
})
