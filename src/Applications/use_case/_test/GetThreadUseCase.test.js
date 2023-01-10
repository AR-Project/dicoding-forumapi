const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const GetThreadUseCase = require("../GetThreadUseCase");

describe('GetThreadUseCase', () => {
  it('should throw error if any parameter is missing', async () => {
    // Arrange
    const parameter = 'thread-123';
    const expectedGetThread = {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread body.',
      date: 'date',
      username: 'username'
    }

    const expectedGetAllCommentsByThreadId = [
      {
        id: 'comment-123',
        username: 'username',
        date: 'date',
        content: 'Comment #1 content.',
        is_deleted: false
      },
      {
        id: 'comment-456',
        username: 'username',
        date: 'date',
        content: 'Comment #2 content.',
        is_deleted: true
      },
    ]

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
        },
        {
          id: expectedGetAllCommentsByThreadId[1].id,
          username: expectedGetAllCommentsByThreadId[1].username,
          date: expectedGetAllCommentsByThreadId[1].date,
          content: '**komentar telah dihapus**',
        }
      ]
    }


    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedGetThread))
    mockCommentRepository.getAllCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedGetAllCommentsByThreadId))

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    })

    const actualGetThreadResult = await getThreadUseCase.execute(parameter);

    // Assert
    expect(actualGetThreadResult).toEqual(expectedGetThreadResult);
    actualGetThreadResult.comments.forEach((comment) => {
      expect(comment.is_deleted).toBeUndefined();
    })
    expect(mockThreadRepository.verifyThread)
      .toBeCalledWith(parameter)
    expect(mockThreadRepository.getThread)
      .toBeCalledWith(parameter)
    expect(mockCommentRepository.getAllCommentsByThreadId)
      .toBeCalledWith(parameter)
  })
})