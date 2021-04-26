const path = require('path');

module.exports = class ImplResolverPlugin {
  constructor(mapper) {
    this.mapper = mapper;
  }

  apply(resolver) {
    const target = resolver.ensureHook('resolve');
    const froms = Object.keys(this.mapper);

    resolver
      .getHook('resolve')
      .tapAsync('ImplResolverPlugin', (request, resolveContext, callback) => {
        const requestPath = path.resolve(request.path, request.request);
        const source = froms.find((src) => requestPath.endsWith(src));

        if (source) {
          const newRequest = {
            ...request,
            request: path.resolve(source, `../${this.mapper[source]}`),
          };

          return resolver.doResolve(
            target,
            newRequest,
            null,
            resolveContext,
            callback,
          );
        }

        return callback();
      });
  }
};
