const HelloWorldHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'helloWorld',
  register: (server) => {
    const helloWorldHandler = new HelloWorldHandler();
    server.route(routes(helloWorldHandler));
  },
};
