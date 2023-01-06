// Domains
const Comment = require('../../../Domains/comments/entitites/Comment');
const AddedComment = require('../../../Domains/comments/entitites/AddedComment');

// Abstract Repository
const CommentsRepositories = require('../../../Domains/comments/CommentsRepositories');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');


// Use Case
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddComment use case', () => { 
  it('should throw error if any parameter is missing', async () => { 
    // Arrange
    const useCasePayload = {
      content: 'This is comment'
    }, ownerId = 'user-123', threadId = 'thread-123'

    const mockCommentsRepository = new CommentsRepositories();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => {
      return Promise.resolve()
    })

    const addCommentUseCase = new AddCommentUseCase({
      commentsRepository: mockCommentsRepository,
      threadRepository: mockThreadRepository,
    })

    await expect(addCommentUseCase.execute(useCasePayload, undefined, threadId)).rejects
      .toThrowError('ADD_COMMENT_USECASE.MISSING_OWNER_ID_PARAM')
    await expect(addCommentUseCase.execute(useCasePayload, ownerId, undefined)).rejects
      .toThrowError('ADD_COMMENT_USECASE.MISSING_THREAD_ID_PARAM')
  })

  it('should orchestrating adding comment action correctly', async () => { 
    // Arrange
    const useCasePayload = {
      content: 'This is comment'
    }, ownerId = 'user-123', threadId = 'thread-123'

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: ownerId
    })

    // create dependencies
    const mockCommentsRepository = new CommentsRepositories();
    const mockThreadRepository = new ThreadRepository();

    // mocking needed function
    mockThreadRepository.verifyThread = jest.fn().mockImplementation(() => {
      return Promise.resolve()
    })
    mockCommentsRepository.addComment = jest.fn().mockImplementation(() => {
      return Promise.resolve(expectedAddedComment)
    })

    // create use case instance
    const addCommentUseCase = new AddCommentUseCase({
      commentsRepository: mockCommentsRepository,
      threadRepository: mockThreadRepository,
    })

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload, ownerId, threadId);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.verifyThread).toBeCalledWith(threadId);
    expect(mockCommentsRepository.addComment).toBeCalledWith(new Comment({
      content: useCasePayload.content,
      owner: ownerId,
      threadId: threadId
    }))
   })
 })