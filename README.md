## Request lifecycle

Each incoming request passes through a pre-defined set of steps, along with optional extensions:

- **`'onRequest'`** extension point
    - always called
    - the `request` object passed to the extension functions is decorated with the `request.setUrl(url)` and `request.setMethod(verb)` methods. Calls to these methods
      will impact how the request is routed and can be used for rewrite rules.
    - `request.route` is not yet populated as the router only looks at the request after this point.
- Lookup route using request path
- Parse cookies
- **`'onPreAuth'`** extension point
- Authenticate request
- Read and parse payload
- Authenticate request payload
- **`'onPostAuth'`** extension point
- Validate path parameters
- Process query extensions (e.g. JSONP)
- Validate query
- Validate payload
- **`'onPreHandler'`** extension point
- Route prerequisites
- Route handler
- **`'onPostHandler'`** extension point
    - The response object contained in `request.response` may be modified (but not assigned a new value). To return a different response type
      (for example, replace an error with an HTML response), return a new response via `next(response)`.
- Validate response payload
- **`'onPreResponse'`** extension point
    - always called.
    - The response contained in `request.response` may be modified (but not assigned a new value). To return a different response type (for
      example, replace an error with an HTML response), return a new response via `next(response)`. Note that any errors generated after
      `next(response)` is called will not be passed back to the `'onPreResponse'` extension method to prevent an infinite loop.
- Send response (may emit `'internalError'` event)
- Emits `'response'` event
- Wait for tails
- Emits `'tail'` event