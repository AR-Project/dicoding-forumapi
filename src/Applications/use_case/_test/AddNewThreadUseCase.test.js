// Domains
const NewThread = require('../../../Domains/threads/entities/NewThread')
const AddedThread = require('../../../Domains/threads/entities/AddedThread')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')

// Use Case
const AddNewThreadUseCase = require('../AddNewThreadUseCase')

describe('AddNewThreadUseCase', () => {
  it('should orchestrating the add new thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Thread Title',
      body: 'Thread body.',
    }

    const credentials = {
      id: 'user-123',
      username: 'johndoe'
    }

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'user-123'
    })

    // create dependencies of use case, for usecase test.
    const mockThreadRepository = new ThreadRepository();

    // mocking needed function
    // mockUserRepository.addUser = jest.fn().mockImplementation(() => Promise.resolve(expectedRegisteredUser));
    mockThreadRepository.addNewThread = jest.fn().mockImplementation(() => Promise.resolve(expectedAddedThread))

    // create use case instance
    const addNewThreadUseCase = new AddNewThreadUseCase({
      threadRepository: mockThreadRepository,
    })

    // ACTION!!  🎬
    const addedThread = await addNewThreadUseCase.execute(useCasePayload, credentials);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addNewThread).toBeCalledWith(new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: credentials.id
    }));
  })
})