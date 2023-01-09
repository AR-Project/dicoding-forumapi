const pool = require('../../database/postgres/pool');

// error / exception
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

// Table Helper
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

// Entities
const Comment = require('../../../Domains/comments/entitites/Comment')
const AddedComment = require('../../../Domains/comments/entitites/AddedComment')

// Repository
const CommentRepositoryPostgres = require('../CommentRespositoryPostgres')

describe('CommentREpositoryPostgress', () => {
  beforeAll(async () => {
    const user = {
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    }

    const thread = {
      id: 'thread-123',
      owner: 'user-123',
      title: 'Thread Title Test',
      body: 'Thread body test lorem ipsum.',
      date: new Date().toISOString(),
    }
    await UsersTableTestHelper.addUser({ ...user });
    await ThreadsTableTestHelper.addThread({ ...thread });
  })

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  })

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  })

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const mockPayload = {
        content: 'This is comment'
      }
      const comment = new Comment({
        ...mockPayload,
        owner: 'user-123',
        threadId: 'thread-123'
      })
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(comment);
      const checkCommentTable = await CommentsTableTestHelper.findCommentsById('comment-123');
      
      // Assert
      expect(checkCommentTable).toHaveLength(1);
    })
    it('should return addedThread correctly', async () => {
      // Arrange
      const mockPayload = {
        content: 'This is comment'
      }
      const comment = new Comment({
        ...mockPayload,
        owner: 'user-123',
        threadId: 'thread-123'
      })
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(comment);
      
      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: mockPayload.content,
        owner: comment.owner
      }))
    })
  })

  describe('verifyComment function', () => {
    it('should throw NotFoundError when commentId is INVALID', async () => {
      // Arrange
      const mockPayload = {
        content: 'This is comment'
      }
      const comment = new Comment({
        ...mockPayload,
        owner: 'user-123',
        threadId: 'thread-123'
      })
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(comment);
      const checkCommentTable = await CommentsTableTestHelper.findCommentsById('comment-123');

      // Assert
      expect(checkCommentTable).toHaveLength(1);
      await expect(commentRepositoryPostgres.verifyComment('comment-999')).rejects.toThrowError(NotFoundError);
    })
    it('should not throw error when a comment is found', async () => { 
      const mockPayload = {
        content: 'This is comment'
      }
      const comment = new Comment({
        ...mockPayload,
        owner: 'user-123',
        threadId: 'thread-123'
      })
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(comment);
      const checkCommentTable = await CommentsTableTestHelper.findCommentsById('comment-123');

      // Assert
      expect(checkCommentTable).toHaveLength(1);
      await expect(commentRepositoryPostgres.verifyComment('comment-123')).resolves.not.toThrowError(NotFoundError);
     })
  })
  
  describe('verifyCommentOwner', () => {
    beforeEach(async () => {
      const mockPayload = {
        content: 'This is comment'
      }
      const comment = new Comment({
        ...mockPayload,
        owner: 'user-123',
        threadId: 'thread-123'
      })
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(comment);

    })

    it('should throw AuthorizationError when comment.owner does NOT MATCH with userId', async () => {
      // Arrange
      const invalidUserId = 'user-999'
      const validCommentId = 'comment-123'
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      
      // Assert
      expect(commentRepositoryPostgres.verifyCommentOwner(validCommentId, invalidUserId)).rejects.toThrow(AuthorizationError);
    })

    it('should not throw AuthorizationError when comment.owner MATCH with userId', async () => { 
      // Arrange
      const validUserId = 'user-123'
      const validCommentId = 'comment-123'
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Assert
      expect(commentRepositoryPostgres.verifyCommentOwner(validCommentId, validUserId)).resolves.not.toThrow(AuthorizationError);
     })
  })

})
