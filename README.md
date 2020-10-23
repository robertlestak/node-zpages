# node-zpages

Standard z-page health check methods to be imported as needed.

## http

`HTTPHandlers` accepts `http` `req, res, next`. 

If using `http`, pass `req` and `res` to `HTTPHandlers`. 

## express

`HTTPHandlers` can be registered as `express` middleware with `app.use()`.

## koa

`HTTPHandlersKoa` can be registered as `koa` middleware with `app.use()`.

## other libraries

If application does not use the above libraries, application will need to register handlers. See `pkg/zpages/zpages.js` `HTTPHandlers` method for example.

It is recommended to use the same paths as defined in `HTTPHandlers` for consistency across applications.

## Status Page

In addition to dependency health checks, this package also creates a `/statusz` endpoint which returns a JSON `map[string]interface{}`.

This is automatically populated with the environment variables `VERSION` and `ENV`, and additional key/value pairs can be added when initialized.

## Supported Drivers

All health checks are configured with a `Driver` object.

Each driver struct is exposed through the `zpages` package, and the `constructor` accepts an `Object` input containing the driver's configuration parameters.

```
type HTTP struct {
	Name        string
	Address     string
	Method      string
	Body        []byte
	StatusCodes []int
}
```

`Name` is a user-identifiable field to reference the checked resource.

See driver configuration below for specific driver configurations.

See [./docs/drivers.md](./docs/drivers.md) for supported drivers and configurations.

See [examples/](./examples/) for a basic example usage.
