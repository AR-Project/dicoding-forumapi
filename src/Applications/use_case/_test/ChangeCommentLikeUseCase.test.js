// Abstract Repository
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserCommentLikesRepository = require('../../../Domains/userCommentLikes/UserCommentLikesRepository');

// Use Case
const ChangeCommentLikeUseCase = require('../ChangeCommentLikeUseCase');

describe('ChangeCommentLikes use case', () => {
  it('should throw error if any parameter is missing', async () => {
    // Arrange
    const userId = 'user-123';
    const commentId = 'comment-123';
    const threadId = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockUserCommentLikesRepository = new UserCommentLikesRepository();
    mockUserCommentLikesRepository.currentLikeStatus = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockUserCommentLikesRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockUserCommentLikesRepository.removeLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const changeCommentLikesUseCase = new ChangeCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userCommentLikesRepository: mockUserCommentLikesRepository,
    });

    await expect(changeCommentLikesUseCase.execute(undefined, commentId, threadId))
      .rejects.toThrowError('CHANGE_LIKE_USECASE.MISSING_PARAM');
    await expect(changeCommentLikesUseCase.execute(userId, undefined, threadId))
      .rejects.toThrowError('CHANGE_LIKE_USECASE.MISSING_PARAM');
    await expect(changeCommentLikesUseCase.execute(userId, commentId, undefined))
      .rejects.toThrowError('CHANGE_LIKE_USECASE.MISSING_PARAM');
  });

  it('should orchestrating ADD comment like action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const commentId = 'comment-123';
    const threadId = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockUserCommentLikesRepository = new UserCommentLikesRepository();
    mockUserCommentLikesRepository.currentLikeStatus = jest.fn()
      .mockImplementation(() => Promise.resolve(false)); // like is not exist
    mockUserCommentLikesRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockUserCommentLikesRepository.removeLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const changeCommentLikesUseCase = new ChangeCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userCommentLikesRepository: mockUserCommentLikesRepository,
    });

    await changeCommentLikesUseCase.execute(userId, commentId, threadId);

    expect(mockThreadRepository.verifyThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(commentId);
    expect(mockUserCommentLikesRepository.currentLikeStatus).toBeCalledWith(userId, commentId);
    expect(mockUserCommentLikesRepository.addLike).toBeCalledWith(userId, commentId);
    expect(mockUserCommentLikesRepository.removeLike).not.toBeCalled();
  });
  it('should orchestrating REMOVE comment like action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const commentId = 'comment-123';
    const threadId = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockUserCommentLikesRepository = new UserCommentLikesRepository();
    mockUserCommentLikesRepository.currentLikeStatus = jest.fn()
      .mockImplementation(() => Promise.resolve(true)); // like is exist
    mockUserCommentLikesRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockUserCommentLikesRepository.removeLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const changeCommentLikesUseCase = new ChangeCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userCommentLikesRepository: mockUserCommentLikesRepository,
    });

    await changeCommentLikesUseCase.execute(userId, commentId, threadId);

    expect(mockThreadRepository.verifyThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(commentId);
    expect(mockUserCommentLikesRepository.currentLikeStatus).toBeCalledWith(userId, commentId);
    expect(mockUserCommentLikesRepository.removeLike).toBeCalledWith(userId, commentId);
    expect(mockUserCommentLikesRepository.addLike).not.toBeCalled();
  });
});
