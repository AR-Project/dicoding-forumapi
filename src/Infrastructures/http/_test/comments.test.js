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
  let accessTokenSecond;
  let threadId;

  beforeAll(async () => {
    // Arrange two DIFFRENET user payload for registering and login
    const userRegisterPayload = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    const userRegisterPayloadSecond = {
      username: 'userkedua',
      password: 'secret',
      fullname: 'User Nomor Dua',
    };
    const userLoginPayload = {
      username: userRegisterPayload.username,
      password: userRegisterPayload.password,
    };
    const userLoginPayloadSecond = {
      username: userRegisterPayloadSecond.username,
      password: userRegisterPayloadSecond.password,
    };

    // Arrange payload for a thread
    const threadPayload = {
      title: 'Thread title',
      body: 'Thread body',
    };
    // CREATE SERVER
    const server = await createServer(container);

    // REGISTER TWO DIFFERENT USER
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: userRegisterPayload,
    });
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: userRegisterPayloadSecond,
    });

    // LOGIN TWO DIFFERENT USER
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userLoginPayload,
    });
    const loginResponseSecond = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userLoginPayloadSecond,
    });

    // Parse and Store access token BOTH USER
    const loginResponseJson = await JSON.parse(loginResponse.payload);
    const loginResponseSecondJson = await JSON.parse(loginResponseSecond.payload);
    accessToken = loginResponseJson.data.accessToken;
    accessTokenSecond = loginResponseSecondJson.data.accessToken;

    // POST A THREAD
    const postThreadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: threadPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Parse and Store threadId
    const postThreadResponseJson = await JSON.parse(postThreadResponse.payload);
    const { id } = postThreadResponseJson.data.addedThread;
    threadId = id;
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comment', () => {
    it('should response 401 when header not contain accessToken', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is a comment',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        // MISSING AUTHORIZATION
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when thread ID is invalid, no such thread', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is a comment',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xxx/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when body payload is mismatch / missing', async () => {
      // Arrange
      const requestPayload = {
        wrongBody: '',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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

    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is a comment',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });
  });

  describe('when DELETE /thread/{treadId}/comment/{commentId}', () => {
    let commentId;
    beforeEach(async () => {
      // Arrange
      const requestPayload = {
        content: 'This is a comment',
      };
      const server = await createServer(container);
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const addCommentResponseJson = JSON.parse(addCommentResponse.payload);
      commentId = addCommentResponseJson.data.addedComment.id;
    });

    it('should should response 401 when header not contain accessToken', async () => {
      // Arrange
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        // MISSING AUTHORIZATION
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it('should response 403 when user deleting not owned comment', async () => {
      // Arrange
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessTokenSecond}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when user deleting invalid thread', async () => {
      // Arrange
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/xxInvalidThreadIdxx/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessTokenSecond}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
    it('should response 404 when user deleting invalid comment', async () => {
      // Arrange
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/xxInvalidCommentId`,
        headers: {
          Authorization: `Bearer ${accessTokenSecond}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 200 and soft-delete comment', async () => {
      // Arrange
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
