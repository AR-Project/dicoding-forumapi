const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRespository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should throw error if any parameter is missing', async () => {
    // Arrange
    const invalidParameter = undefined;

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRespository();

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });
    // Action & assert
    await expect(getThreadUseCase.execute(invalidParameter))
      .rejects
      .toThrowError('GET_THREAD_USECASE.MISSING_PARAMS');
  });

  it('should orchestrating get thread action correctly ', async () => {
    // Arrange
    const expectedGetThread = {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread body.',
      date: 'date',
      username: 'username',
    };
    const parameter = 'thread-123';

    const expectedGetAllCommentsByThreadId = [
      {
        id: 'comment-123',
        username: 'username',
        date: 'date',
        content: 'Comment #1 content.',
        is_deleted: false,
      },
      {
        id: 'comment-456',
        username: 'username',
        date: 'date',
        content: 'Comment #2 content.',
        is_deleted: true,
      },
    ];
    const commentIdParameter = ['comment-123', 'comment-456'];

    const expectedGetAllRepliesByCommentIds = [
      {
        id: 'reply-123',
        commentId: 'comment-123',
        username: 'username',
        date: 'date1',
        content: 'Reply #1 content.',
        is_deleted: true,
      },
      {
        id: 'reply-124',
        commentId: 'comment-123',
        username: 'username',
        date: 'date2',
        content: 'Reply #2 content.',
        is_deleted: false,
      },
      {
        id: 'reply-125',
        commentId: 'comment-456',
        username: 'username',
        date: 'date3',
        content: 'Reply #3 content.',
        is_deleted: false,
      },
    ];

    const expectedGetThreadResult = {
      id: expectedGetThread.id,
      title: expectedGetThread.title,
      body: expectedGetThread.body,
      date: expectedGetThread.date,
      username: expectedGetThread.username,
      comments: [
        {
          id: expectedGetAllCommentsByThreadId[0].id,
          username: expectedGetAllCommentsByThreadId[0].username,
          date: expectedGetAllCommentsByThreadId[0].date,
          content: expectedGetAllCommentsByThreadId[0].content,
          replies: [
            {
              id: expectedGetAllRepliesByCommentIds[0].id,
              content: '**balasan telah dihapus**',
              username: expectedGetAllRepliesByCommentIds[0].username,
              date: expectedGetAllRepliesByCommentIds[0].date,
            },
            {
              id: expectedGetAllRepliesByCommentIds[1].id,
              content: expectedGetAllRepliesByCommentIds[1].content,
              username: expectedGetAllRepliesByCommentIds[1].username,
              date: expectedGetAllRepliesByCommentIds[1].date,
            },
          ],
        },
        {
          id: expectedGetAllCommentsByThreadId[1].id,
          username: expectedGetAllCommentsByThreadId[1].username,
          date: expectedGetAllCommentsByThreadId[1].date,
          content: '**komentar telah dihapus**',
          replies: [
            {
              id: expectedGetAllRepliesByCommentIds[2].id,
              content: expectedGetAllRepliesByCommentIds[2].content,
              username: expectedGetAllRepliesByCommentIds[2].username,
              date: expectedGetAllRepliesByCommentIds[2].date,
            },
          ],
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRespository();

    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedGetThread));
    mockCommentRepository.getAllCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedGetAllCommentsByThreadId));
    mockReplyRepository.getAllRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedGetAllRepliesByCommentIds));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const actualGetThreadResult = await getThreadUseCase.execute(parameter);

    // Assert
    expect(actualGetThreadResult).toEqual(expectedGetThreadResult);
    actualGetThreadResult.comments.forEach((comment) => {
      expect(comment.is_deleted).toBeUndefined();
      comment.replies.forEach((reply) => {
        expect(reply.is_deleted).toBeUndefined();
      });
    });
    expect(mockThreadRepository.verifyThread)
      .toBeCalledWith(parameter);
    expect(mockThreadRepository.getThread)
      .toBeCalledWith(parameter);
    expect(mockCommentRepository.getAllCommentsByThreadId)
      .toBeCalledWith(parameter);
    expect(mockReplyRepository.getAllRepliesByCommentIds)
      .toBeCalledWith(commentIdParameter);
  });
});
