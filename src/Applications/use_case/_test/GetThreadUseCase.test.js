const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRespository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should throw error if any parameter is missing', async () => {
    // Arrange
    const parameter = 'thread-123';
    const expectedGetThread = {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread body.',
      date: 'date',
      username: 'username',
    };

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

    const expectedGetAllRepliesByCommentId = [
      {
        id: 'reply-123',
        username: 'username',
        date: 'date',
        content: 'Reply #1 content.',
        is_deleted: true,
      },
      {
        id: 'reply-124',
        username: 'username',
        date: 'date',
        content: 'Reply #2 content.',
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
              id: expectedGetAllRepliesByCommentId[0].id,
              content: '**balasan telah dihapus**',
              username: expectedGetAllRepliesByCommentId[0].username,
              date: expectedGetAllRepliesByCommentId[0].date,
            },
            {
              id: expectedGetAllRepliesByCommentId[1].id,
              content: expectedGetAllRepliesByCommentId[1].content,
              username: expectedGetAllRepliesByCommentId[1].username,
              date: expectedGetAllRepliesByCommentId[1].date,
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
              id: expectedGetAllRepliesByCommentId[0].id,
              content: '**balasan telah dihapus**',
              username: expectedGetAllRepliesByCommentId[0].username,
              date: expectedGetAllRepliesByCommentId[0].date,
            },
            {
              id: expectedGetAllRepliesByCommentId[1].id,
              content: expectedGetAllRepliesByCommentId[1].content,
              username: expectedGetAllRepliesByCommentId[1].username,
              date: expectedGetAllRepliesByCommentId[1].date,
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
    mockReplyRepository.getAllRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedGetAllRepliesByCommentId));

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
    expect(mockReplyRepository.getAllRepliesByCommentId)
      .toBeCalledTimes(2);
  });
});
