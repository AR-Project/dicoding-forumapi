const routes = (handler) => ([
  {
    method: 'GET',
    path: '/',
    handler: handler.getHelloWorldHandler,
  },
]);

module.exports = routes;
