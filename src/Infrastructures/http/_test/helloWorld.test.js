const container = require('../../container');
const createServer = require('../createServer');

describe('GET / endpoint', () => {
  it('should return 200 and hello world', async () => {
    // Arrange
    const server = await createServer(container);

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/',
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.value).toEqual('Hello world!');
  });
});
