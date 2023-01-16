// Domains
const Comment = require('../../../Domains/comments/entitites/Comment');
const AddedComment = require('../../../Domains/comments/entitites/AddedComment');

// Abstract Repository
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

// Use Case
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddComment use case', () => {
  it('should throw error if any parameter is missing', async () => {
    // Arrange
    const useCasePayload = {
      content: 'This is comment',
    };
    const ownerId = 'user-123';
    const threadId = 'thread-123';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => Promise.resolve());

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(addCommentUseCase.execute(useCasePayload, undefined, threadId)).rejects
      .toThrowError('ADD_COMMENT_USECASE.MISSING_OWNER_ID_PARAM');
    await expect(addCommentUseCase.execute(useCasePayload, ownerId, undefined)).rejects
      .toThrowError('ADD_COMMENT_USECASE.MISSING_THREAD_ID_PARAM');
  });

  it('should orchestrating adding comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'This is comment',
    };
    const ownerId = 'user-123';
    const threadId = 'thread-123';

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: ownerId,
    });

    // create dependencies
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // mocking needed function
    mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: ownerId,
      })));

    // create use case instance
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload, ownerId, threadId);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.verifyThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(new Comment({
      content: useCasePayload.content,
      owner: ownerId,
      threadId,
    }));
  });
});
