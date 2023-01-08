const pool = require('../../database/postgres/pool');

const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/thread/{threadId}/comment endpoint', () => { 
  // declare accessToken variable 
  let accessToken;
  let threadId;

  beforeAll(async() => {
    // create register, login, and thread payload
    const userRegisterPayload = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    }
    const threadPayload = {
      title: 'Thread title',
      body: 'Thread body',
    };
    const userLoginPayload = {
      username: userRegisterPayload.username,
      password: userRegisterPayload.password
    };
    // CREATE SERVER
    const server = await createServer(container);

    // REGISTER
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: userRegisterPayload,
    });
    
    // LOGIN
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userLoginPayload,
    });

    // Parse and Store access token 
    const loginResponseJson = await JSON.parse(loginResponse.payload);
    accessToken = loginResponseJson.data.accessToken;

    // POST A THREAD
    const postThreadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: threadPayload,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    // Parse and Store threadId
    const postThreadResponseJson = await JSON.parse(postThreadResponse.payload);
    const { id } = postThreadResponseJson.data.addedThread;
    threadId = id;
  })

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  })
  
  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comment', () => { 
    it('should response 201 and persisted comment', async () => { 
      // Arrange
      const requestPayload = {
        content: 'This is a comment'
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    })
   })

 })
 