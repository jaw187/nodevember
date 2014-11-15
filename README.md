## Plugins

## `Hapi.Pack`

`Pack` is a collection of servers grouped together to form a single logical unit. The pack's primary purpose is to provide
a unified object interface when working with [plugins](#plugin-interface). Grouping multiple servers into a single pack
enables treating them as a single entity which can start and stop in sync, as well as enable sharing routes and other
facilities. For example, a Single Page Application (SPA) often requires a web component and an API component running as two
servers using distinct ports. Another common example is when plugins register both public routes as well as internal admin
routes, each on a different port but setup in a single plugin.

The servers in a pack share the same cache. Every server belongs to a pack, even if created directed via
[`new Server()`](#new-serverhost-port-options), in which case the `server.pack` object is automatically assigned a single-server pack.

#### `new Pack([options])`

Creates a new `Pack` object instance where:

- `options` - optional configuration:
    - `app` - an object used to initialize the application-specific data stored in `pack.app`.
    - `cache` - cache configuration as described in the server [`cache`](#server.config.cache) option.
    - `debug` - same as the server `debug` config option but applied to the entire pack.

```javascript
var Hapi = require('hapi');
var pack = new Hapi.Pack();
```

### `Pack` properties

Each `Pack` object instance has the following properties:

- `app` - application-specific state. Provides a safe place to store application data without potential conflicts with **hapi**.
  Initialized via the pack `app` configuration option. Defaults to `{}`.
- `events` - an `Events.EventEmitter` providing a consolidate emitter of all the events emitted from all member pack servers as well as
  the `'start'` and `'stop'` pack events.
- `plugins` - an object where each key is a plugin name and the value are the exposed properties by that plugin using
  [`plugin.expose()`](#pluginexposekey-value).

### `Pack` methods

#### `pack.server([host], [port], [options])`

Creates a `Server` instance and adds it to the pack, where `host`, `port`, `options` are the same as described in
[`new Server()`](#new-serverhost-port-options) with the exception that the `cache` option is not allowed and must be
configured via the pack `cache` option.

```javascript
var Hapi = require('hapi');
var pack = new Hapi.Pack();

pack.server(8000, { labels: ['web'] });
pack.server(8001, { labels: ['admin'] });
```

#### `pack.start([callback])`

Starts all the servers in the pack and used as described in [`server.start([callback])`](#serverstartcallback).

```javascript
var Hapi = require('hapi');
var pack = new Hapi.Pack();

pack.server(8000, { labels: ['web'] });
pack.server(8001, { labels: ['admin'] });

pack.start(function () {

    console.log('All servers started');
});
```

#### `pack.stop([options], [callback])`

Stops all the servers in the pack and used as described in [`server.stop([options], [callback])`](#serverstopoptions-callback).

```javascript
pack.stop({ timeout: 60 * 1000 }, function () {

    console.log('All servers stopped');
});
```

#### `pack.register(plugins, [options], callback)`

Registers a plugin where:

- `plugins` - a plugin object or array of plugin objects. The objects can use one of two formats:
    - a module plugin object.
    - a manually constructed plugin object.
- `options` - optional registration options (used by **hapi** and is not passed to the plugin):
    - `select` - string or array of strings of labels to pre-select for plugin registration.
    - `route` - apply modifiers to any routes added by the plugin:
        - `prefix` - string added as prefix to any route path (must begin with `'/'`). If a plugin registers a child plugin
          the `prefix` is passed on to the child or is added in front of the child-specific prefix.
        - `vhost` - virtual host string (or array of strings) applied to every route. The outter-most `vhost` overrides the any
          nested configuration.
- `callback` - the callback function with signature `function(err)` where:
    - `err` - an error returned from `exports.register()`. Note that incorrect usage, bad configuration, or namespace conflicts
      (e.g. among routes, methods, state) will throw an error and will not return a callback.

Module plugin is registered by passing the following object (or array of object) as `plugins`:
- `plugin` - an object (usually obtained by calling node's `require()`) with:
    - `register` - the [`exports.register()`](#exportsregisterplugin-options-next) function. The function must have an `attributes`
      property with either `name` (and optional `version`) keys or `pkg` with the content of the module's 'package.json'.
- `options` - optional configuration object which is passed to the plugin via the `options` argument in
  [`exports.register()`](#exportsregisterplugin-options-next).

```javascript
server.pack.register({
    plugin: require('plugin_name'),
    options: {
        message: 'hello'
    }
 }, function (err) {

     if (err) {
         console.log('Failed loading plugin');
     }
 });
```

Manually constructed plugin is an object containing:
- `name` - plugin name.
- `version` - an optional plugin version. Defaults to `'0.0.0'`.
- `multiple` - an optional boolean indicating if the plugin is safe to register multiple time with the same server.
  Defaults to `false`.
- `register` - the [`register()`](#exportsregisterplugin-options-next) function.
- `options` - optional configuration object which is passed to the plugin via the `options` argument in
  [`exports.register()`](#exportsregisterplugin-options-next).

```javascript
server.pack.register({
    name: 'test',
    version: '2.0.0',
    register: function (plugin, options, next) {

        plugin.route({ method: 'GET', path: '/special', handler: function (request, reply) { reply(options.message); } });
        next();
    },
    options: {
        message: 'hello'
    }
}, function (err) {

    if (err) {
        console.log('Failed loading plugin');
    }
});
```

### `Pack.compose(manifest, [options], callback)`

Provides a simple way to construct a [`Pack`](#hapipack) from a single configuration object, including configuring servers
and registering plugins where:

- `manifest` - an object with the following keys:
    - `pack` - the pack `options` as described in [`new Pack()`](#packserverhost-port-options). In order to support loading JSON documents,
      The `compose()` function supports passing a module name string as the value of `pack.cache` or `pack.cache.engine`. These strings are
      resolved the same way the `plugins` keys are (using `options.relativeTo`).
    - `servers` - an array of server configuration objects where:
        - `host`, `port`, `options` - the same as described in [`new Server()`](#new-serverhost-port-options) with the exception that the
          `cache` option is not allowed and must be configured via the pack `cache` option. The `host` and `port` keys can be set to an
          environment variable by prefixing the variable name with `'$env.'`.
    - `plugins` - an object where each key is a plugin name, and each value is one of:
        - the `options` object passed to the plugin on registration.
        - an array of object where:
            - `options` - the object passed to the plugin on registration.
            - any key supported by the `pack.register()` options used for registration (e.g. `select`).
- `options` - optional compose configuration:
    - `relativeTo` - path prefix used when loading plugins using node's `require()`. The `relativeTo` path prefix is added to any
      relative plugin name (i.e. beings with `'./'`). All other module names are required as-is and will be looked up from the location
      of the **hapi** module path (e.g. if **hapi** resides outside of your project `node_modules` path, it will not find your project
      dependencies - you should specify them as relative and use the `relativeTo` option).
- `callback` - the callback method, called when all packs and servers have been created and plugins registered has the signature
  `function(err, pack)` where:
    - `err` - an error returned from `exports.register()`. Note that incorrect usage, bad configuration, or namespace conflicts
      (e.g. among routes, methods, state) will throw an error and will not return a callback.
    - `pack` - the composed Pack object.

```javascript
var Hapi = require('hapi');

var manifest = {
    pack: {
        cache: 'catbox-memory'
    },
    servers: [
        {
            port: 8000,
            options: {
                labels: ['web']
            }
        },
        {
            host: 'localhost',
            port: 8001,
            options: {
                labels: ['admin']
            }
        }
    ],
    plugins: {
        'yar': {
            cookieOptions: {
                password: 'secret'
            }
        },
        'furball': [
            {
                select: 'web',
                options: {
                    version: '/v'
                }
            }
        ]
    }
};

Hapi.Pack.compose(manifest, function (err, pack) {

    pack.start();
});
```

## Plugin interface

Plugins provide an extensibility platform for both general purpose utilities such as [batch requests](https://github.com/hapijs/bassmaster)
and for application business logic. Instead of thinking about a web server as a single entity with a unified routing table, plugins enable
developers to break their application into logical units, assembled together in different combinations to fit the development, testing, and
deployment needs.

A plugin is constructed with the following:

- name - the plugin name is used as a unique key. Public plugins should be published in the [npm registry](https://npmjs.org) and derive
  their name from the registry name to ensure uniqueness. Private plugin names should be picked carefully to avoid conflicts with both
  private and public names.
- registration function - the function described in [`exports.register()`](#exportsregisterplugin-options-next) is the plugin's core.
  The function is called when the plugin is registered and it performs all the activities required by the plugin to operate. It is the
  single entry point into the plugin's functionality.
- version - the optional plugin version is only used informatively to enable other plugins to find out the versions loaded. The version
  should be the same as the one specified in the plugin's 'package.json' file.

The name and versions are included by attaching an `attributes` property to the `exports.register()` function:

```javascript
exports.register = function (plugin, options, next) {

    plugin.route({
        method: 'GET',
        path: '/version',
        handler: function (request, reply) {

            reply('1.0.0');
        }
    });

    next();
};

exports.register.attributes = {
    name: 'example',
    version: '1.0.0'
};
```

Alternatively, the name and version can be included via the `pkg` attribute containing the 'package.json' file for the module which
already has the name and version included:

```javascript
exports.register.attributes = {
    pkg: require('./package.json')
};
```

The `multiple` attributes specifies that a plugin is safe to register multiple times with the same server.

```javascript
exports.register.attributes = {
    multiple: true,
    pkg: require('./package.json')
};
```

#### `exports.register(plugin, options, next)`

Registers the plugin where:

- `plugin` - the registration interface representing the pack the plugin is being registered into. Provides the properties and methods listed below.
- `options` - the `options` object provided by the pack registration methods.
- `next` - the callback function the plugin must call to return control over to the application and complete the registration process. The function
  signature is `function(err)` where:
    - `err` - internal plugin error condition, which is returned back via the registration methods' callback. A plugin registration error is considered
      an unrecoverable event which should terminate the application.

```javascript
exports.register = function (plugin, options, next) {

    plugin.route({ method: 'GET', path: '/', handler: function (request, reply) { reply('hello world') } });
    next();
};
```

### Root methods and properties

The plugin interface root methods and properties are those available only on the `plugin` object received via the
[`exports.register()`](#exportsregisterplugin-options-next) interface. They are not available on the object received by calling
[`plugin.select()`](#pluginselectlabels).

#### `plugin.hapi`

A reference to the **hapi** module used to create the pack and server instances. Removes the need to add a dependency on **hapi** within the plugin.

```javascript
exports.register = function (plugin, options, next) {

    var Hapi = plugin.hapi;

    var handler = function (request, reply) {

        reply(Hapi.error.internal('Not implemented yet'));
    };

    plugin.route({ method: 'GET', path: '/', handler: handler });
    next();
};
```

#### `plugin.version`

The **hapi** version used to load the plugin.

```javascript
exports.register = function (plugin, options, next) {

    console.log(plugin.version);
    next();
};
```

#### `plugin.config`

The registration options provided to the `pack.register()` method. Contains:
- `route` - route path prefix and virtual host settings.

```javascript
exports.register = function (plugin, options, next) {

    console.log(plugin.config.route.prefix);
    next();
};
```

#### `plugin.app`

Provides access to the [common pack application-specific state](#pack-properties).

```javascript
exports.register = function (plugin, options, next) {

    plugin.app.hapi = 'joi';
    next();
};
```

#### `plugin.plugins`

An object where each key is a plugin name and the value are the exposed properties by that plugin using [`plugin.expose()`](#pluginexposekey-value)
when called at the plugin root level (without calling `plugin.select()`).

```javascript
exports.register = function (plugin, options, next) {

    console.log(plugin.plugins.example.key);
    next();
};
```

#### `plugin.path(path)`

Sets the path prefix used to locate static resources (files and view templates) when relative paths are used by the plugin:
- `path` - the path prefix added to any relative file path starting with `'.'`. The value has the same effect as using the server's
  configuration `files.relativeTo` option but only within the plugin.

```javascript
exports.register = function (plugin, options, next) {

    plugin.path(__dirname + '../static');
    plugin.route({ path: '/file', method: 'GET', handler: { file: './test.html' } });
    next();
};
```

#### `plugin.log(tags, [data, [timestamp]])`

Emits a `'log'` event on the `pack.events` emitter using the same interface as [`server.log()`](#serverlogtags-data-timestamp).

```javascript
exports.register = function (plugin, options, next) {

    plugin.log(['plugin', 'info'], 'Plugin registered');
    next();
};
```

#### `plugin.after(method)`

Add a method to be called after all the required plugins have been registered and before the servers start. The function is only
called if the pack servers are started. Arguments:

- `after` - the method with signature `function(plugin, next)` where:
    - `plugin` - the [plugin interface](#plugin-interface) object.
    - `next` - the callback function the method must call to return control over to the application and complete the registration process. The function
      signature is `function(err)` where:
        - `err` - internal plugin error condition, which is returned back via the [`pack.start(callback)`](#packstartcallback) callback. A plugin
          registration error is considered an unrecoverable event which should terminate the application.

```javascript
exports.register = function (plugin, options, next) {

    plugin.after(after);
    next();
};

var after = function (plugin, next) {

    // Additional plugin registration logic
    next();
};
```

#### `plugin.views(options)`

Generates a plugin-specific views manager for rendering templates where:
- `options` - the views configuration as described in the server's [`views`](#serverviewsoptions) option. Note that due to the way node
  `require()` operates, plugins must require rendering engines directly and pass the engine using the `engines.module` option.

Note that relative paths are relative to the plugin root, not the working directory or the application registering the plugin. This allows
plugin the specify their own static resources without having to require external configuration.

```javascript
exports.register = function (plugin, options, next) {

    plugin.views({
        engines: {
            html: {
              module: Handlebars.create()
            }
        },
        path: './templates'
    });

    next();
};
```

#### `plugin.method(name, fn, [options])`

Registers a server method function with all the pack's servers as described in [`server.method()`](#servermethodname-fn-options)

```javascript
exports.register = function (plugin, options, next) {

    plugin.method('user', function (id, next) {

        next(null, { id: id });
    });

    next();
};
```

#### `plugin.method(method)`

Registers a server method function with all the pack's servers as described in [`server.method()`](#servermethodmethod)

```javascript
exports.register = function (plugin, options, next) {

    plugin.method({
        name: 'user',
        fn: function (id, next) {

            next(null, { id: id });
        }
    });

    next();
};
```

#### `plugin.methods`

Provides access to the method methods registered with [`plugin.method()`](#pluginmethodname-fn-options)

```javascript
exports.register = function (plugin, options, next) {

    plugin.method('user', function (id, next) {

        next(null, { id: id });
    });

    plugin.methods.user(5, function (err, result) {

        // Do something with result

        next();
    });
};
```

#### `plugin.cache(options)`

Provisions a plugin cache segment within the pack's common caching facility where:

- `options` - cache configuration as described in [**catbox** module documentation](https://github.com/hapijs/catbox#policy) with a few additions:
    - `expiresIn` - relative expiration expressed in the number of milliseconds since the item was saved in the cache. Cannot be used
      together with `expiresAt`.
    - `expiresAt` - time of day expressed in 24h notation using the 'MM:HH' format, at which point all cache records for the route
      expire. Cannot be used together with `expiresIn`.
    - `staleIn` - number of milliseconds to mark an item stored in cache as stale and reload it. Must be less than `expiresIn`.
    - `staleTimeout` - number of milliseconds to wait before checking if an item is stale.
    - `generateTimeout` - number of milliseconds to wait before returning a timeout error when an item is not in the cache and the generate
      method is taking too long.
    - `segment` - optional segment name, used to isolate cached items within the cache partition. Defaults to '!name' where 'name' is the
      plugin name. When setting segment manually, it must begin with '!!'.
    - `cache` - the name of the cache connection configured in the ['server.cache` option](#server.config.cache). Defaults to the default cache.
    - `shared` - if true, allows multiple cache users to share the same segment (e.g. multiple servers in a pack using the same cache. Default
      to not shared.

```javascript
exports.register = function (plugin, options, next) {

    var cache = plugin.cache({ expiresIn: 60 * 60 * 1000 });
    next();
};
```

#### `plugin.bind(bind)`

Sets a global plugin bind used as the default bind when adding a route or an extension using the plugin interface (if no
explicit bind is provided as an option). The bind object is made available within the handler and extension methods via `this`.

```javascript
var handler = function (request, reply) {

    request.reply(this.message);
};

exports.register = function (plugin, options, next) {

    var bind = {
        message: 'hello'
    };

    plugin.bind(bind);
    plugin.route({ method: 'GET', path: '/', handler: handler });
    next();
};
```

#### `plugin.handler(name, method)`

Registers a new handler type as describe in [`server.handler(name, method)`](#serverhandlername-method).

```javascript
exports.register = function (plugin, options, next) {

    var handlerFunc = function (route, options) {

        return function (request, reply) {

            reply('Message from plugin handler: ' + options.msg);
        }
    };

    plugin.handler('testHandler', handlerFunc);
    next();
}
```

#### `plugin.render(template, context, [options], callback)`

Utilizes the plugin views engine configured to render a template where:
- `template` - the template filename and path, relative to the templates path configured via ['plugin.views()`](#pluginviewsoptions).
- `context` - optional object used by the template to render context-specific result. Defaults to no context `{}`.
- `options` - optional object used to override the plugin's ['plugin.views()`](#pluginviewsoptions) configuration.
- `callback` - the callback function with signature `function (err, rendered, config)` where:
    - `err` - the rendering error if any.
    - `rendered` - the result view string.
    - `config` - the configuration used to render the template.

```javascript
exports.register = function (plugin, options, next) {

    plugin.views({
        engines: {
            html: {
              module: Handlebars.create()
            }
        },
        path: './templates'
    });

    plugin.render('hello', context, function (err, rendered, config) {

        console.log(rendered);
        next();
    });
};
```

### Selectable methods and properties

The plugin interface selectable methods and properties are those available both on the `plugin` object received via the
[`exports.register()`](#exportsregisterplugin-options-next) interface and the objects received by calling
[`plugin.select()`](#pluginselectlabels). However, unlike the root methods, they operate only on the selected subset of
servers.

#### `plugin.select(labels)`

Selects a subset of pack servers using the servers' `labels` configuration option where:

- `labels` - a single string or array of strings of labels used as a logical OR statement to select all the servers with matching
  labels in their configuration.

Returns a new `plugin` interface with only access to the [selectable methods and properties](#selectable-methods-and-properties).
Selecting again on a selection operates as a logic AND statement between the individual selections.

```javascript
exports.register = function (plugin, options, next) {

    var selection = plugin.select('web');
    selection.route({ method: 'GET', path: '/', handler: function (request, reply) { reply('ok'); } });
    next();
};
```

#### `plugin.length`

The number of selected servers.

```javascript
exports.register = function (plugin, options, next) {

    var count = plugin.length;
    var selectedCount = plugin.select('web').length;
    next();
};
```

#### `plugin.servers`

The selected servers array.

```javascript
exports.register = function (plugin, options, next) {

    var selection = plugin.select('web');
    selection.servers.forEach(function (server) {

        server.route({ method: 'GET', path: '/', handler: function (request, reply) { reply('ok'); } });
    });

    next();
};
```

#### `plugin.events`

An emitter containing the events of all the selected servers.

```javascript
exports.register = function (plugin, options, next) {

    plugin.events.on('internalError', function (request, err) {

        console.log(err);
    });

    next();
};
```

#### `plugin.expose(key, value)`

Exposes a property via `plugin.plugins[name]` (if added to the plugin root without first calling `plugin.select()`) and `server.plugins[name]`
('name' of plugin) object of each selected pack server where:

- `key` - the key assigned (`server.plugins[name][key]` or `plugin.plugins[name][key]`).
- `value` - the value assigned.

```javascript
exports.register = function (plugin, options, next) {

    plugin.expose('util', function () { console.log('something'); });
    next();
};
```

#### `plugin.expose(obj)`

Merges a deep copy of an object into to the existing content of `plugin.plugins[name]` (if added to the plugin root without first calling
`plugin.select()`) and `server.plugins[name]` ('name' of plugin) object of each selected pack server where:

- `obj` - the object merged into the exposed properties container.

```javascript
exports.register = function (plugin, options, next) {

    plugin.expose({ util: function () { console.log('something'); } });
    next();
};
```

#### `plugin.route(options)`

Adds a server route to the selected pack's servers as described in [`server.route(options)`](#serverrouteoptions).

```javascript
exports.register = function (plugin, options, next) {

    var selection = plugin.select('web');
    selection.route({ method: 'GET', path: '/', handler: function (request, reply) { reply('ok'); } });
    next();
};
```

#### `plugin.route(routes)`

Adds multiple server routes to the selected pack's servers as described in [`server.route(routes)`](#serverrouteroutes).

```javascript
exports.register = function (plugin, options, next) {

    var selection = plugin.select('admin');
    selection.route([
        { method: 'GET', path: '/1', handler: function (request, reply) { reply('ok'); } },
        { method: 'GET', path: '/2', handler: function (request, reply) { reply('ok'); } }
    ]);

    next();
};
```

#### `plugin.state(name, [options])`

Adds a state definition to the selected pack's servers as described in [`server.state()`](#serverstatename-options).

```javascript
exports.register = function (plugin, options, next) {

    plugin.state('example', { encoding: 'base64' });
    next();
};
```

#### `plugin.auth.scheme(name, scheme)`

Adds an authentication scheme to the selected pack's servers as described in [`server.auth.scheme()`](#serverauthschemename-scheme).

#### `plugin.auth.strategy(name, scheme, [mode], [options])`

Adds an authentication strategy to the selected pack's servers as described in [`server.auth.strategy()`](#serverauthstrategyname-scheme-mode-options).

#### `plugin.ext(event, method, [options])`

Adds an extension point method to the selected pack's servers as described in [`server.ext()`](#serverextevent-method-options).

```javascript
exports.register = function (plugin, options, next) {

    plugin.ext('onRequest', function (request, extNext) {

        console.log('Received request: ' + request.path);
        extNext();
    });

    next();
};
```

#### `plugin.register(plugins, [options], callback)`

Adds a plugin to the selected pack's servers as described in [`pack.register()`](#packregisterplugins-options-callback).

```javascript
exports.register = function (plugin, options, next) {

    plugin.register({
        plugin: require('plugin_name'),
        options: {
            message: 'hello'
        }
    }, next);
};
```

#### `plugin.dependency(deps, [after])`

Declares a required dependency upon other plugins where:

- `deps` - a single string or array of strings of plugin names which must be registered in order for this plugin to operate. Plugins listed
  must be registered in the same pack transaction to allow validation of the dependency requirements. Does not provide version dependency which
  should be implemented using [npm peer dependencies](http://blog.nodejs.org/2013/02/07/peer-dependencies/).
- `after` - an optional function called after all the specified dependencies have been registered and before the servers start. The function is only
  called if the pack servers are started. If a circular dependency is created, the call will assert (e.g. two plugins each has an `after` function
  to be called after the other). The function signature is `function(plugin, next)` where:
    - `plugin` - the [plugin interface](#plugin-interface) object.
    - `next` - the callback function the method must call to return control over to the application and complete the registration process. The function
      signature is `function(err)` where:
        - `err` - internal plugin error condition, which is returned back via the [`pack.start(callback)`](#packstartcallback) callback. A plugin
          registration error is considered an unrecoverable event which should terminate the application.

```javascript
exports.register = function (plugin, options, next) {

    plugin.dependency('yar', after);
    next();
};

var after = function (plugin, next) {

    // Additional plugin registration logic
    next();
};
```
