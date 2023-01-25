class HelloWorldHandler {
  constructor() {
    this.getHelloWorldHandler = this.getHelloWorldHandler.bind(this);
  }

  getHelloWorldHandler() {
    return {
      value: 'Hello world!',
    };
  }
}

module.exports = HelloWorldHandler;
