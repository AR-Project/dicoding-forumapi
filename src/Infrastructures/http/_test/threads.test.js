const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  // declare accessToken variable
  let accessToken;

  beforeAll(async () => {
    // Create server for all test.
    const server = await createServer(container);

    // create register payload
    const userRegisterPayload = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };

    // register user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: userRegisterPayload,
    });

    // create login payload
    const userLoginPayload = {
      username: userRegisterPayload.username,
      password: userRegisterPayload.password,
    };

    // login the user
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userLoginPayload,
    });

    // Parse login response
    const loginResponseJson = JSON.parse(loginResponse.payload);

    // Store access token
    accessToken = loginResponseJson.data.accessToken;
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 401 (Authentication Error) when headers not contain accessToken', async () => {
      // Arrange
      const requestPayload = {
        title: 'Thread title',
        body: 'Thread body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when payload is wrong type / invalid / missing some', async () => {
      // Arrange
      const requestPayload = {
        title: 'Thread title',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Thread title',
        body: 'Thread body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    let threadId;
    beforeEach(async () => {
      // Arange: prepare server
      const server = await createServer(container);

      // Arrange: Post a thread
      const postThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Thread Title at http test',
          body: 'Thread body at http test',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Arrange: Get and store threadId
      const postThreadResponseJson = JSON.parse(postThreadResponse.payload);
      threadId = postThreadResponseJson.data.addedThread.id;
    });

    it('should response 404 when threadId is invalid / no such thread', async () => {
      // Arange: prepare server
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/xxxInvalidThreadId',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 200 and return correct payload', async () => {
      // Arange: prepare server
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });
  });
});
