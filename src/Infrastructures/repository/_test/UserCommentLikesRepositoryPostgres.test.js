/* eslint-disable camelcase */
const pool = require('../../database/postgres/pool');

// Table Helper
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UserCommentLikesTableTestHelper = require('../../../../tests/UserCommentLikesTableTestHelper');

// Repository
const UserCommentLikesRepositoryPostgres = require('../UserCommentLikesRepositoryPostgres');

describe('UserCommentLikesRepositoryPostgres', () => {
  beforeAll(async () => {
    const userA = {
      id: 'user-001',
      username: 'usera',
      password: 'secret',
      fullname: 'User Pertama',
    };
    const userB = {
      id: 'user-002',
      username: 'userb',
      password: 'secret',
      fullname: 'User Kedua',
    };
    const thread = {
      id: 'thread-001',
      owner: 'user-001',
      title: 'Thread Title Test',
      body: 'Thread body test lorem ipsum.',
      date: 'date',
    };
    const commentA = {
      id: 'comment-001',
      owner: 'user-001',
      thread_id: 'thread-001',
      content: 'Komentar pertama',
      date: 'date-1',
      is_deleted: false,
    };
    const commentB = {
      id: 'comment-002',
      owner: 'user-002',
      thread_id: 'thread-001',
      content: 'Komentar kedua',
      date: 'date-1',
      is_deleted: false,
    };

    await UsersTableTestHelper.addUser({ ...userA });
    await UsersTableTestHelper.addUser({ ...userB });
    await ThreadsTableTestHelper.addThread({ ...thread });
    await CommentsTableTestHelper.addComment({ ...commentA });
    await CommentsTableTestHelper.addComment({ ...commentB });
  });

  afterEach(async () => {
    await UserCommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('currentLikesStatus function', () => {
    beforeEach(async () => {
      const likes = [
        {
          id: 'like-001',
          user_id: 'user-001',
          comment_id: 'comment-001',
        },
        {
          id: 'like-002',
          user_id: 'user-001',
          comment_id: 'comment-002',
        },
        {
          id: 'like-003',
          user_id: 'user-002',
          comment_id: 'comment-001',
        },
      ];
      // eslint-disable-next-line no-restricted-syntax
      for (const like of likes) {
        // eslint-disable-next-line no-await-in-loop
        await UserCommentLikesTableTestHelper.addCommentLikes({ ...like });
      }
    });

    it('should return true if likes exist', async () => {
      // Arrange
      const validUserId = 'user-001';
      const validCommentId = 'comment-001';
      const fakeIdGenerator = () => '123';
      const userCommentLikesRepositoryPostgres = new UserCommentLikesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const likesOnTable = await UserCommentLikesTableTestHelper.countTotalLikes();
      const result = await userCommentLikesRepositoryPostgres
        .currentLikeStatus(validUserId, validCommentId);

      expect(likesOnTable).toBe(3);
      expect(result).toBe(true);
    });

    it('should return false if likes not exist', async () => {
      // Arrange
      const validUserId = 'user-002';
      const validCommentId = 'comment-002';
      const fakeIdGenerator = () => '123';
      const userCommentLikesRepositoryPostgres = new UserCommentLikesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const likesOnTable = await UserCommentLikesTableTestHelper.countTotalLikes();
      const result = await userCommentLikesRepositoryPostgres
        .currentLikeStatus(validUserId, validCommentId);

      expect(likesOnTable).toBe(3);
      expect(result).toBe(false);
    });
  });

  describe('addLike function', () => {
    it('should persist like data', async () => {
      const userId = 'user-001';
      const commentId = 'comment-001';
      const fakeIdGenerator = () => '123';
      const userCommentLikesRepositoryPostgres = new UserCommentLikesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const likesOnTableBefore = await UserCommentLikesTableTestHelper
        .countTotalLikes();

      // Action
      await userCommentLikesRepositoryPostgres.addLike(userId, commentId);
      const likesOnTableAfter = await UserCommentLikesTableTestHelper
        .countTotalLikes();
      const persistedData = await UserCommentLikesTableTestHelper
        .findCommentLikesById('like-123');

      // Assert
      expect(likesOnTableBefore).toBe(0);
      expect(likesOnTableAfter).toBe(1);
      expect(persistedData).toHaveLength(1);
    });
  });

  describe('removeLike function', () => {
    it('should remove like data', async () => {
      // Arrange
      const likes = [
        {
          id: 'like-001',
          user_id: 'user-001',
          comment_id: 'comment-001',
        },
        {
          id: 'like-002',
          user_id: 'user-001',
          comment_id: 'comment-002',
        },
        {
          id: 'like-003',
          user_id: 'user-002',
          comment_id: 'comment-001',
        },
      ];
      // eslint-disable-next-line no-restricted-syntax
      for (const like of likes) {
        // eslint-disable-next-line no-await-in-loop
        await UserCommentLikesTableTestHelper.addCommentLikes({ ...like });
      }
      const userId = 'user-001';
      const commentId = 'comment-002';
      const fakeIdGenerator = () => '123';
      const userCommentLikesRepositoryPostgres = new UserCommentLikesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Pre-action
      const likesOnTableBefore = await UserCommentLikesTableTestHelper
        .countTotalLikes();

      // Action
      await userCommentLikesRepositoryPostgres.removeLike(userId, commentId);

      // Post-action
      const likesOnTableAfter = await UserCommentLikesTableTestHelper
        .countTotalLikes();
      const persistedData = await UserCommentLikesTableTestHelper
        .findCommentLikesById('like-002');

      // Assert
      expect(likesOnTableBefore).toBe(3);
      expect(likesOnTableAfter).toBe(2);
      expect(persistedData).toHaveLength(0);
    });
  });

  describe('getLikesNumberByCommentIds', () => {
    it('should return each comment likes in commentIds array ', async () => {
      // Arrange
      const likes = [
        {
          id: 'like-001',
          user_id: 'user-001',
          comment_id: 'comment-001',
        },
        {
          id: 'like-002',
          user_id: 'user-001',
          comment_id: 'comment-002',
        },
        {
          id: 'like-003',
          user_id: 'user-002',
          comment_id: 'comment-001',
        },
      ];
      // eslint-disable-next-line no-restricted-syntax
      for (const like of likes) {
        // eslint-disable-next-line no-await-in-loop
        await UserCommentLikesTableTestHelper.addCommentLikes({ ...like });
      }
      const parameter = ['comment-001', 'comment-002', 'comment-003'];
      const expectedResult = [
        {
          comment_id: 'comment-001',
          count: 2,
        },
        {
          comment_id: 'comment-002',
          count: 1,
        },
      ];

      const fakeIdGenerator = () => '123';
      const userCommentLikesRepositoryPostgres = new UserCommentLikesRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const result = await userCommentLikesRepositoryPostgres
        .getLikesNumberByCommentIds(parameter);
      const totalLikesOnTable = await UserCommentLikesTableTestHelper
        .countTotalLikes();

      // Assert
      expect(totalLikesOnTable).toBe(3);
      expect(result).toStrictEqual(expectedResult);
    });
  });
});
