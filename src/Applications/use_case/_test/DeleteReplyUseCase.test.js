const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase = ', () => {
  it('should throw error if any param is missing', async () => {
    const replyId = 'reply_id';
    const commentId = 'comment_id';
    const threadId = 'thread_id';
    const userId = 'user_id';

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    })

    await expect(deleteReplyUseCase.execute(undefined, commentId, threadId, userId)).rejects
      .toThrowError('DELETE_REPLY_USECASE.MISSING_PARAM');
    await expect(deleteReplyUseCase.execute(replyId, undefined, threadId, userId)).rejects
      .toThrowError('DELETE_REPLY_USECASE.MISSING_PARAM');
    await expect(deleteReplyUseCase.execute(replyId, commentId, undefined, userId)).rejects
      .toThrowError('DELETE_REPLY_USECASE.MISSING_PARAM');
    await expect(deleteReplyUseCase.execute(replyId, commentId, threadId, undefined)).rejects
      .toThrowError('DELETE_REPLY_USECASE.MISSING_PARAM');
    // await expect(deleteReplyUseCase.execute(replyId, commentId, threadId, userId)).rejects
    //   .toThrowError('DELETE_REPLY_USECASE.MISSING_PARAM');
  })

  it('should orchestrating the deleting reply action correctly', async () => {
    // Arrange
    const replyId = 'reply_id';
    const commentId = 'comment_id';
    const threadId = 'thread_id';
    const userId = 'user_id';

    // Arrange mock repository
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.verifyReply = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());


    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    })

    await deleteReplyUseCase.execute(replyId, commentId, threadId, userId);
    
    expect(mockThreadRepository.verifyThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(commentId);
    expect(mockReplyRepository.verifyReply).toBeCalledWith(replyId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(replyId, userId);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(replyId);


  })
})