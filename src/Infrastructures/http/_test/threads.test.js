const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  // declare accessToken variable 
  let accessToken;

  beforeAll(async() => {
    // Create server for all test.
    const server = await createServer(container);

    // create register payload
    const userRegisterPayload = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    }

    // register user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: userRegisterPayload,
    })
    
    // create login payload
    const userLoginPayload = {
      username: userRegisterPayload.username,
      password: userRegisterPayload.password
    }

    // login the user
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userLoginPayload,
    });

    // Parse login response 
    const loginResponseJson = JSON.parse(loginResponse.payload)

    // Store access token
    accessToken = loginResponseJson.data.accessToken;
  })

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  })

  afterAll(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads', () => {
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
          'Authorization': `Bearer ${accessToken}`
        }
      })

      // Assert 
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();

    })
  })
})