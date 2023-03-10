const pool = require('../../database/postgres/pool');

// error / exception
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

// Table Helper
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

// Entities
const Reply = require('../../../Domains/replies/entities/Reply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

// Repository
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    const userA = {
      id: 'user-123',
      username: 'usera',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    const userB = {
      id: 'user-456',
      username: 'userb',
      password: 'secret',
      fullname: 'User Ke Dua',
    };

    const thread = {
      id: 'thread-123',
      owner: 'user-123',
      title: 'Thread Title Test',
      body: 'Thread body test lorem ipsum.',
      date: new Date().toISOString(),
    };

    const commentA = {
      id: 'comment-123',
      owner: 'user-123',
      thread_id: 'thread-123',
      content: 'komentar pertama dilapak utama',
      date: 'date1',
      is_deleted: false,
    };
    const commentB = {
      id: 'comment-124',
      owner: 'user-456',
      thread_id: 'thread-123',
      content: 'komentar kedua dilapak utama',
      date: 'date2',
      is_deleted: false,
    };

    await UsersTableTestHelper.addUser({ ...userA });
    await UsersTableTestHelper.addUser({ ...userB });
    await ThreadsTableTestHelper.addThread({ ...thread });
    await CommentsTableTestHelper.addComment({ ...commentA });
    await CommentsTableTestHelper.addComment({ ...commentB });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply inside database table', async () => {
      // Arrange
      const mockPayload = {
        content: 'This is a reply',
      };
      const reply = new Reply({
        ...mockPayload,
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(reply);
      const checkRepliesTable = await RepliesTableTestHelper.findRepliesById('reply-123');
      const totalRepliesTableRows = await RepliesTableTestHelper.countTotalReplies();

      // Assert
      expect(checkRepliesTable).toHaveLength(1);
      expect(totalRepliesTableRows).toEqual(1);
    });

    it('should return addedReply correctly', async () => {
      // Arrange
      const mockPayload = {
        content: 'This is a reply',
      };
      const reply = new Reply({
        ...mockPayload,
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(reply);

      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: mockPayload.content,
        owner: reply.owner,
      }));
    });
  });

  describe('verifyReply function', () => {
    beforeEach(async () => {
      // Arrange
      const reply = {
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
        content: 'reply content',
        date: 'date-1',
        is_deleted: false,
      };

      await RepliesTableTestHelper.addReply(reply);
    });

    it('should throw NotFoundError when replyId is invalid', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const totalRepliesTableRows = await RepliesTableTestHelper.countTotalReplies();

      // Action
      expect(totalRepliesTableRows).toEqual(1);
      await expect(replyRepositoryPostgres.verifyReply('reply-999')).rejects
        .toThrow(NotFoundError);
    });

    it('should NOT throw NotFoundError when replyId is valid / found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const totalRepliesTableRows = await RepliesTableTestHelper.countTotalReplies();

      // Assert
      expect(totalRepliesTableRows).toEqual(1);
      await expect(replyRepositoryPostgres.verifyReply('reply-123')).resolves.not
        .toThrow(NotFoundError);
    });
  });

  describe('verifyReplyOwner function test #1', () => {
    it('should throw AuthorizationError when reply owner NOT MATCH with user ID', async () => {
      // Arrange
      const reply = {
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
        content: 'reply content',
        date: 'date-1',
        is_deleted: false,
      };
      await RepliesTableTestHelper.addReply(reply);
      const helperResult = await RepliesTableTestHelper.findRepliesById('reply-123');

      const validReplyId = 'reply-123';
      const invalidUserId = 'user-999';

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Assert
      expect(helperResult).toHaveLength(1);
      expect(replyRepositoryPostgres.verifyReplyOwner(validReplyId, invalidUserId))
        .rejects.toThrowError(AuthorizationError);
    });
  });

  describe('verifyReplyOwner function test #2', () => {
    it('should NOT throw AuthorizationError when reply owner match with user ID', async () => {
      // Arrange
      const reply = {
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
        content: 'reply content',
        date: 'date-1',
        is_deleted: false,
      };
      await RepliesTableTestHelper.addReply(reply);
      const helperResult = await RepliesTableTestHelper.findRepliesById('reply-123');

      const validReplyId = 'reply-123';
      const validUserId = 'user-123';

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Assert
      expect(helperResult).toHaveLength(1);
      expect(replyRepositoryPostgres.verifyReplyOwner(validReplyId, validUserId))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should change is_delete database reply value ', async () => {
      // Arrange
      const reply = {
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
        content: 'reply content',
        date: 'date-1',
        is_deleted: false,
      };

      await RepliesTableTestHelper.addReply(reply);

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const prevResult = await RepliesTableTestHelper.findRepliesById('reply-123');

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');
      const afterResult = await RepliesTableTestHelper.findRepliesById('reply-123');

      // Assert
      expect(prevResult).toHaveLength(1);
      expect(afterResult).toHaveLength(1);
      expect(prevResult[0].is_deleted).toBe(false);
      expect(afterResult[0].is_deleted).toBe(true);
    });
  });

  describe('getAllRepliesByCommentId function', () => {
    it('should fetch all reply with same threadId and correct payload', async () => {
      const replies = [
        {
          id: 'reply-123',
          owner: 'user-123',
          commentId: 'comment-123',
          content: 'balasan komentar utama',
          date: 'date1',
          is_deleted: false,
        },
        {
          id: 'reply-124',
          owner: 'user-123',
          commentId: 'comment-123',
          content: 'balasan komentar utama',
          date: 'date2',
          is_deleted: true,
        },
        {
          id: 'reply-125',
          owner: 'user-123',
          commentId: 'comment-124',
          content: 'balasan dikomentar sebelah',
          date: 'date3',
          is_deleted: false,
        },
      ];
      const expectedReplies = [
        {
          id: 'reply-123',
          username: 'usera',
          content: 'balasan komentar utama',
          date: 'date1',
          is_deleted: false,
        },
        {
          id: 'reply-124',
          username: 'usera',
          content: 'balasan komentar utama',
          date: 'date2',
          is_deleted: true,
        },
      ];

      // eslint-disable-next-line no-restricted-syntax
      for (const reply of replies) {
        // eslint-disable-next-line no-await-in-loop
        await RepliesTableTestHelper.addReply({ ...reply });
      }

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const totalRepliesInDatabase = await RepliesTableTestHelper.countTotalReplies();

      const result = await replyRepositoryPostgres.getAllRepliesByCommentId('comment-123');

      expect(result).toHaveLength(2);
      expect(totalRepliesInDatabase).toBe(3);
      for (let i = 0; i < result.length; i += 1) {
        expect(result[i].id).toBeDefined();
        expect(result[i].username).toBeDefined();
        expect(result[i].content).toBeDefined();
        expect(result[i].date).toBeDefined();
        expect(result[i].is_deleted).toBeDefined();
        expect(result[i].owner).not.toBeDefined();
        expect(result[i].commentId).not.toBeDefined();
        expect(result[i]).toStrictEqual(expectedReplies[i]);
      }
    });
  });

  describe('getAllRepliesByCommentIds function', () => {
    it('should fetch all replies using comment-id array', async () => {
      // Arrange
      const replies = [
        {
          id: 'reply-123',
          owner: 'user-123',
          commentId: 'comment-123',
          content: 'balasan pertama komentar utama',
          date: 'date1',
          is_deleted: false,
        },
        {
          id: 'reply-124',
          owner: 'user-123',
          commentId: 'comment-123',
          content: 'balasan kedua komentar utama',
          date: 'date2',
          is_deleted: true,
        },
        {
          id: 'reply-125',
          owner: 'user-123',
          commentId: 'comment-124',
          content: 'balasan pertama dikomentar sebelah',
          date: 'date3',
          is_deleted: false,
        },
        {
          id: 'reply-126',
          owner: 'user-123',
          commentId: 'comment-124',
          content: 'balasan kedua dikomentar sebelah',
          date: 'date4',
          is_deleted: false,
        },
      ];

      const parameter = ['comment-123', 'comment-124'];

      const expectedReplies = [
        {
          id: 'reply-123',
          commentId: 'comment-123',
          username: 'usera',
          content: 'balasan pertama komentar utama',
          date: 'date1',
          is_deleted: false,
        },
        {
          id: 'reply-124',
          commentId: 'comment-123',
          username: 'usera',
          content: 'balasan kedua komentar utama',
          date: 'date2',
          is_deleted: true,
        },
        {
          id: 'reply-125',
          commentId: 'comment-124',
          username: 'usera',
          content: 'balasan pertama dikomentar sebelah',
          date: 'date3',
          is_deleted: false,
        },
        {
          id: 'reply-126',
          commentId: 'comment-124',
          username: 'usera',
          content: 'balasan kedua dikomentar sebelah',
          date: 'date4',
          is_deleted: false,
        },
      ];

      // eslint-disable-next-line no-restricted-syntax
      for (const reply of replies) {
        // eslint-disable-next-line no-await-in-loop
        await RepliesTableTestHelper.addReply({ ...reply });
      }

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const totalRepliesInDatabase = await RepliesTableTestHelper.countTotalReplies();

      // Action
      const result = await replyRepositoryPostgres.getAllRepliesByCommentIds(parameter);

      // Assert
      expect(totalRepliesInDatabase).toBe(4);
      expect(result).toStrictEqual(expectedReplies);
    });
  });
});
