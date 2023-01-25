const pool = require('../../database/postgres/pool');

const UserCommentLikesTableTestHelper = require('../../../../tests/UserCommentLikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  // declare variable needed for test
  let accessToken;
  let accessTokenSecond;
  let threadId;
  let commentId;
  // eslint-disable-next-line no-unused-vars
  let commentIdSecond;

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

    const postSecondCommentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: {
        content: 'This is a comment',
      },
      headers: {
        Authorization: `Bearer ${accessTokenSecond}`,
      },
    });
    const postSecondCommentResponseJson = await JSON.parse(postSecondCommentResponse.payload);
    commentIdSecond = postSecondCommentResponseJson.data.addedComment.id;
  });

  afterEach(async () => {
    await UserCommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when PUT method is called', () => {
    it('should response 401 when header not contain accessToken', async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        // MISSING AUTHORIZATION
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when threadId invalid, no such thread', async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/xxInvalidThreadxx/comments/${commentId}/likes`,
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
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/xxInvalidCommentId/likes`,
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

    it('should response 200 when action is success', async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Post-action
      const totalLikesInTable = await UserCommentLikesTableTestHelper.countTotalLikes();
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(totalLikesInTable).toBe(1);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
