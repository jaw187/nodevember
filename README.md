## Serving files and directories

### `reply.file(path, [options])`

_Available only within the handler method and only before one of `reply()`, `reply.file()`, `reply.view()`,
`reply.close()`, `reply.proxy()`, or `reply.redirect()` is called._

Transmits a file from the file system. The 'Content-Type' header defaults to the matching mime type based on filename extension.:

- `path` - the file path.
- `options` - optional settings:
    - `filename` - an optional filename to specify if sending a 'Content-Disposition' header, defaults to the basename of `path`
    - `mode` - specifies whether to include the 'Content-Disposition' header with the response. Available values:
        - `false` - header is not included. This is the default value.
        - `'attachment'`
        - `'inline'`
    - `lookupCompressed` - if `true`, looks for the same filename with the '.gz' suffix for a precompressed version of the file to serve if the request supports content encoding. Defaults to `false`.

No return value.

The [response flow control rules](#flow-control) **do not** apply.

```javascript
var handler = function (request, reply) {

    reply.file('./hello.txt');
};
```