## Server Config

When creating a server instance, the following options configure the server's behavior:

- `app` - application-specific configuration which can later be accessed via `server.settings.app`. Provides a safe
  place to store application configuration without potential conflicts with **hapi**. Should not be used by plugins which
  should use `plugins[name]`. Note the difference between `server.settings.app` which is used to store configuration value
  and `server.app` which is meant for storing run-time state.

- <a name="server.config.cache"></a>`cache` - sets up server-side caching. Every server includes a default cache for storing
  application state. By default, a simple memory-based cache is created which has limited capacity and capabilities. **hapi**
  uses [**catbox**](https://github.com/hapijs/catbox) for its cache which includes support for Redis, MongoDB, Memcached, and
  Riak. Caching is only utilized if methods and plugins explicitly store their state in the cache. The server cache
  configuration only defines the storage container itself. `cache` can be assigned:
    - a prototype function (usually obtained by calling `require()` on a **catbox** strategy such as `require('catbox-redis')`).
    - a configuration object with the following options:
        - `engine` - a prototype function or **catbox** engine object.
        - `name` - an identifier used later when provisioning or configuring caching for routes, methods, or plugins. Each
          connection name must be unique. A single item may omit the `name` option which defines the default cache. If every
          connection includes a `name`, a default memory cache is provisions as well as the default.
        - `shared` - if `true`, allows multiple cache users to share the same segment (e.g. multiple servers in a pack using
          the same route and cache. Default to not shared.
        - other options required by the **catbox** strategy used.
    - an array of the above object for configuring multiple cache instances, each with a unique name. When an array of objects
      is provided, multiple cache connections are established and each array item (except one) must include a `name`.

- `cors` - the [Cross-Origin Resource Sharing](http://www.w3.org/TR/cors/) protocol allows browsers to make cross-origin API
  calls. CORS is required by web applications running inside a browser which are loaded from a different domain than the API
  server. CORS headers are disabled by default. To enable, set `cors` to `true`, or to an object with the following options:
    - `origin` - a strings array of allowed origin servers ('Access-Control-Allow-Origin'). The array can contain any combination of fully qualified origins
      along with origin strings containing a wilcard '*' character, or a single `'*'` origin string. Defaults to any origin `['*']`.
    - `isOriginExposed` - if `false`, prevents the server from returning the full list of non-wildcard `origin` values if the incoming origin header
      does not match any of the values. Has no impact if `matchOrigin` is set to `false`. Defaults to `true`.
    - `matchOrigin` - if `false`, returns the list of `origin` values without attempting to match the incoming origin value. Cannot be used with
      wildcard `origin` values. Defaults to `true`.
    - `maxAge` - number of seconds the browser should cache the CORS response ('Access-Control-Max-Age'). The greater the value, the longer it
      will take before the browser checks for changes in policy. Defaults to `86400` (one day).
    - `headers` - a strings array of allowed headers ('Access-Control-Allow-Headers'). Defaults to `['Authorization', 'Content-Type', 'If-None-Match']`.
    - `additionalHeaders` - a strings array of additional headers to `headers`. Use this to keep the default headers in place.
    - `methods` - a strings array of allowed HTTP methods ('Access-Control-Allow-Methods'). Defaults to `['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS']`.
    - `additionalMethods` - a strings array of additional methods to `methods`. Use this to keep the default methods in place.
    - `exposedHeaders` - a strings array of exposed headers ('Access-Control-Expose-Headers'). Defaults to `['WWW-Authenticate', 'Server-Authorization']`.
    - `additionalExposedHeaders` - a strings array of additional headers to `exposedHeaders`. Use this to keep the default headers in place.
    - `credentials` - if `true`, allows user credentials to be sent ('Access-Control-Allow-Credentials'). Defaults to `false`.

- `security` - sets some common security related headers. All headers are disabled by default. To enable set `security` to `true` or to an object with
  the following options:
    - `hsts` - controls the 'Strict-Transport-Security' header. If set to `true` the header will be set to `max-age=15768000`, if specified as a number
      the maxAge parameter will be set to that number. Defaults to `true`. You may also specify an object with the following fields:
        - `maxAge` - the max-age portion of the header, as a number. Default is `15768000`.
        - `includeSubdomains` - a boolean specifying whether to add the `includeSubdomains` flag to the header.
    - `xframe` - controls the 'X-Frame-Options' header. When set to `true` the header will be set to `DENY`, you may also specify a string value of
      'deny' or 'sameorigin'. To use the 'allow-from' rule, you must set this to an object with the following fields:
        - `rule` - either 'deny', 'sameorigin', or 'allow-from'
        - `source` - when `rule` is 'allow-from' this is used to form the rest of the header, otherwise this field is ignored. If `rule` is 'allow-from'
          but `source` is unset, the rule will be automatically changed to 'sameorigin'.
    - `xss` - boolean that controls the 'X-XSS-PROTECTION' header for IE. Defaults to `true` which sets the header to equal '1; mode=block'. NOTE: This setting can create a security vulnerability in versions of IE below 8, as well as unpatched versions of IE8. See [here](http://hackademix.net/2009/11/21/ies-xss-filter-creates-xss-vulnerabilities/) and [here](https://technet.microsoft.com/library/security/ms10-002) for more information. If you actively support old versions of IE, it may be wise to explicitly set this flag to `false`.
    - `noOpen` - boolean controlling the 'X-Download-Options' header for IE, preventing downloads from executing in your context. Defaults to `true` setting
      the header to 'noopen'.
    - `noSniff` - boolean controlling the 'X-Content-Type-Options' header. Defaults to `true` setting the header to its only and default option, 'nosniff'.

- `debug` - controls the error types sent to the console:
    - `request` - a string array of request log tags to be displayed via `console.error()` when the events are logged via `request.log()`. Defaults
      to uncaught errors thrown in external code (these errors are handled automatically and result in an Internal Server Error (500) error response) or
      runtime errors due to incorrect implementation of the hapi API. For example, to display all errors, change the option to `['error']`.
      To turn off all console debug messages set it to `false`.

- <a name="server.config.files"></a>`files` - defines the behavior for serving static resources using the built-in route handlers for files and directories:
    - `relativeTo` - determines the folder relative paths are resolved against when using the file and directory handlers.
    - `etagsCacheMaxSize` - sets the maximum number of file etag hash values stored in the cache. Defaults to `10000`.

- `json` - optional arguments passed to `JSON.stringify()` when converting an object or error response to a string payload. Supports the following:
    - `replacer` - the replacer function or array. Defaults to no action.
    - `space` - number of spaces to indent nested object keys. Defaults to no indentation.

- `labels` - a string array of labels used when registering plugins to [`plugin.select()`](#pluginselectlabels) matching server labels. Defaults
  to an empty array `[]` (no labels).

- `load` - server load monitoring and limits configuration (stored under `server.load` when enabled) where:
    - `maxHeapUsedBytes` - maximum V8 heap size over which incoming requests are rejected with an HTTP Server Timeout (503) response. Defaults to `0` (no limit).
    - `maxRssBytes` - maximum process RSS size over which incoming requests are rejected with an HTTP Server Timeout (503) response. Defaults to `0` (no limit).
    - `maxEventLoopDelay` - maximum event loop delay duration in milliseconds over which incoming requests are rejected with an HTTP Server Timeout (503) response.
      Defaults to `0` (no limit).
    - `sampleInterval` - the frequency of sampling in milliseconds. Defaults to `0` (no sampling).

- <a name="server.config.location"></a>`location` - used to convert relative 'Location' header URIs to absolute, by adding this value as prefix. Value must not contain a trailing `'/'`.
  Defaults to the host received in the request HTTP 'Host' header and if missing, to `server.info.uri`.

- `cacheControlStatus` - an array of HTTP response status codes (e.g. `200`) which are allowed to include a valid caching directive. Defaults to `[200]`.

- <a name="server.config.payload"></a>`payload` - controls how incoming payloads (request body) are processed:
    - `maxBytes` - limits the size of incoming payloads to the specified byte count. Allowing very large payloads may cause the server to run
      out of memory. Defaults to `1048576` (1MB).
    - `uploads` - the directory used for writing file uploads. Defaults to `os.tmpDir()`.

- `plugins` - plugin-specific configuration which can later be accessed by `server.plugins`. Provides a place to store and pass plugin configuration that
  is at server-level. The `plugins` is an object where each key is a plugin name and the value is the configuration. Note the difference between
  `server.settings.plugins` which is used to store configuration value and `server.plugins` which is meant for storing run-time state.

- <a name="server.config.router"></a>`router` - controls how incoming request URIs are matched against the routing table:
    - `isCaseSensitive` - determines whether the paths '/example' and '/EXAMPLE' are considered different resources. Defaults to `true`.
    - `stripTrailingSlash` - removes trailing slashes on incoming paths. Defaults to `false`.

- <a name="server.config.state"></a>`state` - HTTP state management (cookies) allows the server to store information on the client which is sent back to
  the server with every request (as defined in [RFC 6265](https://tools.ietf.org/html/rfc6265)).
    - `cookies` - The server automatically parses incoming cookies based on these options:
        - `parse` - determines if incoming 'Cookie' headers are parsed and stored in the `request.state` object. Defaults to `true`.
        - `failAction` - determines how to handle cookie parsing errors. Allowed values are:
            - `'error'` - return a Bad Request (400) error response. This is the default value.
            - `'log'` - report the error but continue processing the request.
            - `'ignore'` - take no action.
        - `clearInvalid` - if `true`, automatically instruct the client to remove invalid cookies. Defaults to `false`.
        - `strictHeader` - if `false`, allows any cookie value including values in violation of [RFC 6265](https://tools.ietf.org/html/rfc6265). Defaults to `true`.

- `timeout` - define timeouts for processing durations:
    - `server` - response timeout in milliseconds. Sets the maximum time allowed for the server to respond to an incoming client request before giving
      up and responding with a Service Unavailable (503) error response. Disabled by default (`false`).
    - `client` - request timeout in milliseconds. Sets the maximum time allowed for the client to transmit the request payload (body) before giving up
      and responding with a Request Timeout (408) error response. Set to `false` to disable. Can be customized on a per-route basis using the route
      `payload.timeout` configuration. Defaults to `10000` (10 seconds).
    - `socket` - by default, node sockets automatically timeout after 2 minutes. Use this option to override this behavior. Defaults to `undefined`
      which leaves the node default unchanged. Set to `false` to disable socket timeouts.

- `tls` - used to create an HTTPS server. The `tls` object is passed unchanged as options to the node.js HTTPS server as described in the
  [node.js HTTPS documentation](http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener).

- `maxSockets` - sets the number of sockets available per outgoing proxy host connection. `false` means use the [wreck](https://www.npmjs.org/package/wreck) default value (`Infinity`).
    Does not affect non-proxy outgoing client connections. Defaults to `Infinity`.

- `validation` - options to pass to [Joi](http://github.com/hapijs/joi). Useful to set global options such as `stripUnknown` or `abortEarly`
  (the complete list is available [here](https://github.com/hapijs/joi#validatevalue-schema-options-callback)). Defaults to no options.