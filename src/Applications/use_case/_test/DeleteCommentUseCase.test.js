const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should throw error if any params is missing', async () => {
    const threadId = 'thread_id';
    const commentId = 'comment_id';
    const userId = 'user_id';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(deleteCommentUseCase.execute(undefined, commentId, userId)).rejects
      .toThrowError('DELETE_COMMENT_USECASE.MISSING_PARAM');
    await expect(deleteCommentUseCase.execute(threadId, undefined, userId)).rejects
      .toThrowError('DELETE_COMMENT_USECASE.MISSING_PARAM');
    await expect(deleteCommentUseCase.execute(threadId, commentId, undefined)).rejects
      .toThrowError('DELETE_COMMENT_USECASE.MISSING_PARAM');
  });

  it('should orchestrating the deleting comment action correctly', async () => {
    // Arrange
    const threadId = 'thread_id';
    const commentId = 'comment_id';
    const userId = 'user_id';

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteCommentUseCase.execute(threadId, commentId, userId);

    expect(mockThreadRepository.verifyThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, userId);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId);
  });
});
