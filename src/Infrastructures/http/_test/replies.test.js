const pool = require('../../database/postgres/pool');

const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/thread/{threadId}/comment endpoint', () => {
  // declare variable needed for test
  let accessToken;
  let accessTokenSecond;
  let threadId;
  let commentId;

  beforeAll(async () => {
    // create register, login, thread, comment payload
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

    // CREATE SERVER
    const server = await createServer(container);

    // REGISTER
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

    // LOGIN and store access token
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
    const loginResponseJson = await JSON.parse(loginResponse.payload);
    accessToken = loginResponseJson.data.accessToken;
    const loginResponseSecondJson = await JSON.parse(loginResponseSecond.payload);
    accessTokenSecond = loginResponseSecondJson.data.accessToken;

    // POST THREAD and store threadId
    const postThreadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'Thread title',
        body: 'Thread body',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const postThreadResponseJson = await JSON.parse(postThreadResponse.payload);
    threadId = postThreadResponseJson.data.addedThread.id;

    // POST COMMENT and store commentId
    const postCommentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: {
        content: 'This is a comment',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const postCommentResponseJson = await JSON.parse(postCommentResponse.payload);
    commentId = postCommentResponseJson.data.addedComment.id;
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comment/{commentId}/replies', () => {
    it('should response 401 when header not contain accessToken', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is a reply',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        // MISSING AUTHORIZATION
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when threadId invalid, no such thread', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is a reply',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/xxInvalidThreadIdxx/comments/${commentId}/replies`,
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

    it('should response 404 when commentId invalid, no such comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is a reply',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/xxInvalidCommentIdxx/replies`,
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

    it('should response 400 when body payload mismatch / missing', async () => {
      // Arrange
      const requestPayload = {
        wrongBody: '',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
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
        content: 'This is a reply',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe('when DELETE /thread/{treadId}/comment/{commentId}/replies/{replyId}', () => {
    let replyId;
    beforeEach(async () => {
      const requestPayload = {
        content: 'This is a reply',
      };
      const server = await createServer(container);
      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const addReplyResponseJson = JSON.parse(addReplyResponse.payload);
      replyId = addReplyResponseJson.data.addedReply.id;
    });

    it('should response 401 when header not contain accessToken', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        // MISSING AUTHORIZATION
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it('should response 403 when reply is deleted not by its owner', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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

    it('should response 200 and soft-delete comment', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
