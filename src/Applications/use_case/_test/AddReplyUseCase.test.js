// Domains
const Reply = require('../../../Domains/replies/entities/Reply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

// Abstract Repository
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

// Use case
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should throw error if any parameter is missing', async () => {
    // Arrange
    const useCasePayload = {
      content: 'This is a reply.',
    };
    const ownerId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(addReplyUseCase.execute(useCasePayload, undefined, threadId, commentId)).rejects
      .toThrowError('REPLY_COMMENT_USECASE.MISSING_PARAMETER');
    await expect(addReplyUseCase.execute(useCasePayload, ownerId, undefined, commentId)).rejects
      .toThrowError('REPLY_COMMENT_USECASE.MISSING_PARAMETER');
    await expect(addReplyUseCase.execute(useCasePayload, ownerId, threadId, undefined)).rejects
      .toThrowError('REPLY_COMMENT_USECASE.MISSING_PARAMETER');
  });

  it('should orchestrating adding reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'This is a reply.',
    };
    const ownerId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: ownerId,
    });

    // Create dependencies and mocking needed it function
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: ownerId,
      })));

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyComment = jest.fn().mockImplementation(() => Promise.resolve());

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => Promise.resolve());

    // Create use case instance
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload, ownerId, threadId, commentId);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(commentId);
    expect(mockThreadRepository.verifyThread).toBeCalledWith(threadId);
    expect(mockReplyRepository.addReply).toBeCalledWith(new Reply({
      content: useCasePayload.content,
      owner: ownerId,
      commentId,
    }));
  });
});
