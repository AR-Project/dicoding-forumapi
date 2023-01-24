const pool = require('../../database/postgres/pool');

// error / exception
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

// Table Helper
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

// Entities
const Comment = require('../../../Domains/comments/entitites/Comment');
const AddedComment = require('../../../Domains/comments/entitites/AddedComment');

// Repository
const CommentRepositoryPostgres = require('../CommentRespositoryPostgres');

describe('CommentRepositoryPostgress', () => {
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

    const threadA = {
      id: 'thread-123',
      owner: 'user-123',
      title: 'Thread Title Test',
      body: 'Thread body test lorem ipsum.',
      date: new Date().toISOString(),
    };
    const threadB = {
      id: 'thread-456',
      owner: 'user-456',
      title: 'Thread Sebelah',
      body: 'Thread sebelah beda lapak.',
      date: new Date().toISOString(),
    };
    await UsersTableTestHelper.addUser({ ...userA });
    await UsersTableTestHelper.addUser({ ...userB });
    await ThreadsTableTestHelper.addThread({ ...threadA });
    await ThreadsTableTestHelper.addThread({ ...threadB });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const mockPayload = {
        content: 'This is comment',
      };
      const comment = new Comment({
        ...mockPayload,
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(comment);
      const checkCommentTable = await CommentsTableTestHelper.findCommentsById('comment-123');

      // Assert
      expect(checkCommentTable).toHaveLength(1);
    });
    it('should return addedThread correctly', async () => {
      // Arrange
      const mockPayload = {
        content: 'This is comment',
      };
      const comment = new Comment({
        ...mockPayload,
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(comment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: mockPayload.content,
        owner: comment.owner,
      }));
    });
  });

  describe('verifyComment function', () => {
    it('should throw NotFoundError when commentId is INVALID', async () => {
      // Arrange
      const mockPayload = {
        content: 'This is comment',
      };
      const comment = new Comment({
        ...mockPayload,
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(comment);
      const checkCommentTable = await CommentsTableTestHelper.findCommentsById('comment-123');

      // Assert
      expect(checkCommentTable).toHaveLength(1);
      await expect(commentRepositoryPostgres.verifyComment('comment-999')).rejects.toThrowError(NotFoundError);
    });
    it('should not throw error when a comment is found', async () => {
      const mockPayload = {
        content: 'This is comment',
      };
      const comment = new Comment({
        ...mockPayload,
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(comment);
      const checkCommentTable = await CommentsTableTestHelper.findCommentsById('comment-123');

      // Assert
      expect(checkCommentTable).toHaveLength(1);
      await expect(commentRepositoryPostgres.verifyComment('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    beforeEach(async () => {
      // Arrange
      const comment = {
        id: 'comment-123',
        owner: 'user-123',
        thread_id: 'thread-123',
        content: 'comment content',
        date: 'date-1',
        is_deleted: false,
      };
      await CommentsTableTestHelper.addComment(comment);
    });

    it('should throw AuthorizationError when comment.owner does NOT MATCH with userId', async () => {
      const invalidUserId = 'user-999';
      const validCommentId = 'comment-123';

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      // await commentRepositoryPostgres.addComment(comment);

      // Action and Assert
      expect(commentRepositoryPostgres.verifyCommentOwner(validCommentId, invalidUserId))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment.owner MATCH with userId', async () => {
      const validUserId = 'user-123';
      const validCommentId = 'comment-123';

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      // await commentRepositoryPostgres.addComment(comment);

      // Assert
      expect(commentRepositoryPostgres.verifyCommentOwner(validCommentId, validUserId))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteComment', () => {
    it('should change is_delete comment value on database', async () => {
      // Arrange
      const comment = {
        id: 'comment-123',
        owner: 'user-123',
        thread_id: 'thread-123',
        content: 'comment content',
        date: 'date-1',
        is_deleted: false,
      };
      await CommentsTableTestHelper.addComment(comment);

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // await commentRepositoryPostgres.addComment(comment);
      const prevResult = await CommentsTableTestHelper.findCommentsById('comment-123');

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');
      const afterResult = await CommentsTableTestHelper.findCommentsById('comment-123');

      // Assert
      expect(afterResult).toHaveLength(1);
      expect(prevResult).toHaveLength(1);
      expect(prevResult[0].is_deleted).toBe(false);
      expect(afterResult[0].is_deleted).toBe(true);
    });
  });

  describe('getAllCommentsByThreadId', () => {
    it('should get all comment under same threadId with correct payload', async () => {
      // Arrange
      const comments = [
        {
          id: 'comment-123',
          owner: 'user-123',
          thread_id: 'thread-123',
          content: 'komentar pertama dilapak utama',
          date: 'date1',
          is_deleted: false,
        },
        {
          id: 'comment-124',
          owner: 'user-456',
          thread_id: 'thread-123',
          content: 'komentar kedua dilapak utama',
          date: 'date2',
          is_deleted: false,
        },
        {
          id: 'comment-125',
          owner: 'user-123',
          thread_id: 'thread-123',
          content: 'komentar ketiga dilapak utama',
          date: 'date3',
          is_deleted: false,
        },
        {
          id: 'comment-126',
          owner: 'user-456',
          thread_id: 'thread-123',
          content: 'komentar keempat lapak utama tapi dihapus',
          date: 'date4',
          is_deleted: true,
        },
        {
          id: 'comment-127',
          owner: 'user-123',
          thread_id: 'thread-123',
          content: 'komentar kelima lapak utama',
          date: 'date5',
          is_deleted: false,
        },
        {
          id: 'comment-128',
          owner: 'user-123',
          thread_id: 'thread-456',
          content: 'komentar keenam lapak sebelah',
          date: 'date6',
          is_deleted: false,
        },
      ];

      const expectedComments = [
        {
          id: 'comment-123',
          username: 'usera',
          content: 'komentar pertama dilapak utama',
          date: 'date1',
          is_deleted: false,
        },
        {
          id: 'comment-124',
          username: 'userb',
          content: 'komentar kedua dilapak utama',
          date: 'date2',
          is_deleted: false,
        },
        {
          id: 'comment-125',
          username: 'usera',
          content: 'komentar ketiga dilapak utama',
          date: 'date3',
          is_deleted: false,
        },
        {
          id: 'comment-126',
          username: 'userb',
          content: 'komentar keempat lapak utama tapi dihapus',
          date: 'date4',
          is_deleted: true,
        },
        {
          id: 'comment-127',
          username: 'usera',
          content: 'komentar kelima lapak utama',
          date: 'date5',
          is_deleted: false,
        },
      ];

      // eslint-disable-next-line no-restricted-syntax
      for (const comment of comments) {
        // eslint-disable-next-line no-await-in-loop
        await CommentsTableTestHelper.addComment({ ...comment });
      }

      const totalCommentsInDatabase = await CommentsTableTestHelper.countTotalComments();

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await commentRepositoryPostgres.getAllCommentsByThreadId('thread-123');

      // Assert
      expect(result).toHaveLength(5);
      expect(totalCommentsInDatabase).toBe(6);

      for (let i = 0; i < result.length; i += 1) {
        expect(result[i].id).toBeDefined();
        expect(result[i].username).toBeDefined();
        expect(result[i].content).toBeDefined();
        expect(result[i].date).toBeDefined();
        expect(result[i].is_deleted).toBeDefined();
        expect(result[i].threadId).not.toBeDefined();
        expect(result[i].owner).not.toBeDefined();
        expect(result[i]).toStrictEqual(expectedComments[i]);
      }
    });
  });
});
