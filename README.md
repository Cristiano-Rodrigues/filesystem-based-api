# Filesystem Based Route API

## Specs

- [x] - Under the User selected folder the directory structure is used to define the routes.
- [x] - Only the route.(js|ts) are recognized as route files.
- [x] - Functions exported by these files need to have the name of a supported HTTP methods (this is to define the HTTP method of the route)
- [x] - A route file can export more than one method function at a time
- [x] - Exported functions need to have access to the Request object
- [] - The data returned by the exported functions will be used by the Response Object.
- [x] - Use the pattern /route/[param] to define a request param