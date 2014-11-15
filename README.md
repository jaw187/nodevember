## Views

#### `server.views(options)`

Initializes the server views manager where:

- `options` - a configuration object with the following:
    - `engines` - (required) an object where each key is a file extension (e.g. 'html', 'hbr'), mapped to the npm module used for
      rendering the templates. Alternatively, the extension can be mapped to an object with the following options:
        - `module` - the npm module used for rendering the templates. The module object must contain:
            - `compile()` - the rendering function. The required function signature depends on the `compileMode` settings. If the `compileMode` is
              `'sync'`, the signature is `compile(template, options)`, the return value is a function with signature `function(context, options)`,
              and the method is allowed to throw errors. If the `compileMode` is `'async'`, the signature is `compile(template, options, callback)`
              where `callback` has the signature `function(err, compiled)` where `compiled` is a function with signature
              `function(context, options, callback)` and `callback` has the signature `function(err, rendered)`.
        - any of the `views` options listed below (except `defaultExtension`) to override the defaults for a specific engine.
    - `defaultExtension` - defines the default filename extension to append to template names when multiple engines are configured and not
      explicit extension is provided for a given template. No default value.
    - `path` - the root file path used to resolve and load the templates identified when calling `reply.view()`. Defaults to current working
      directory.
    - `partialsPath` - the root file path where partials are located. Partials are small segments of template code that can be nested and reused
      throughout other templates. Defaults to no partials support (empty path).
    - `helpersPath` - the directory path where helpers are located. Helpers are functions used within templates to perform transformations
      and other data manipulations using the template context or other inputs. Each '.js' file in the helpers directory is loaded and the file name
      is used as the helper name. The files must export a single method with the signature `function(context)` and return a string. Sub-folders are
      not supported and are ignored. Defaults to no helpers support (empty path). Note that jade does not support loading helpers this way.
    - `basePath` - a base path used as prefix for `path` and `partialsPath`. No default.
    - `layout` - if set to `true` or a layout filename, layout support is enabled. A layout is a single template file used as the parent template
      for other view templates in the same engine. If `true`, the layout template name must be 'layout.ext' where 'ext' is the engine's extension.
      Otherwise, the provided filename is suffixed with the engine's extension and loaded. Disable `layout` when using Jade as it will handle
      including any layout files independently. Defaults to `false`.
    - `layoutPath` - the root file path where layout templates are located (relative to `basePath` if present). Defaults to `path`.
    - `layoutKeyword` - the key used by the template engine to denote where primary template content should go. Defaults to `'content'`.
    - `encoding` - the text encoding used by the templates when reading the files and outputting the result. Defaults to `'utf8'`.
    - `isCached` - if set to `false`, templates will not be cached (thus will be read from file on every use). Defaults to `true`.
    - `allowAbsolutePaths` - if set to `true`, allows absolute template paths passed to `reply.view()`. Defaults to `false`.
    - `allowInsecureAccess` - if set to `true`, allows template paths passed to `reply.view()` to contain '../'. Defaults to `false`.
    - `compileOptions` - options object passed to the engine's compile function. Defaults to empty options `{}`.
    - `runtimeOptions` - options object passed to the returned function from the compile operation. Defaults to empty options `{}`.
    - `contentType` - the content type of the engine results. Defaults to `'text/html'`.
    - `compileMode` - specify whether the engine `compile()` method is `'sync'` or `'async'`. Defaults to `'sync'`.
    - `context` - a global context used with all templates. The global context option can be either an object or a function that takes no arguments and returns a context object. When rendering views, the global context will be merged with any context object specified on the handler or using `reply.view()`. When multiple context objects are used, values from the global context always have lowest precedence.


```javascript
server.views({
    engines: {
        html: require('handlebars'),
        jade: require('jade')
    },
    path: '/static/templates'
});
```
