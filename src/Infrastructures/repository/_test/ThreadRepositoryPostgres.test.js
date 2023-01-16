// Postgress pool
const pool = require('../../database/postgres/pool');

// Table Helper
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

// entities
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

// Repository
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

// error / exception
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgress', () => {
  beforeAll(async () => {
    const user = {
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    await UsersTableTestHelper.addUser({ ...user });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addNewThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'A Thread Title',
        body: 'Body content of a thread.',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addNewThread(newThread);
      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');

      // Assert
      expect(thread).toHaveLength(1);
    });

    it('should return addedThread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'A Thread Title',
        body: 'Body content of a thread.',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addNewThread(newThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: newThread.title,
        owner: newThread.owner,
      }));
    });
  });

  describe('verifyThread function', () => {
    it('should throw NotFoundError when no thread is found', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'A Thread Title',
        body: 'Body content of a thread.',
        owner: 'user-123',
      });
      const invalidThreadId = 'thread-999';

      // repo and stub
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await threadRepositoryPostgres.addNewThread(newThread);

      // Assert prepare
      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');

      // Assert 🙄
      expect(thread).toHaveLength(1);
      await expect(threadRepositoryPostgres.verifyThread(invalidThreadId))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when thread is found', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'A Thread Title',
        body: 'Body content of a thread.',
        owner: 'user-123',
      });
      const validThreadId = 'thread-123';
      // repo and stub
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await threadRepositoryPostgres.addNewThread(newThread);

      // Assert prepare
      const thread = await ThreadsTableTestHelper.findThreadsById(validThreadId);

      // Assert 🙄
      expect(thread).toHaveLength(1);
      await expect(threadRepositoryPostgres.verifyThread(validThreadId))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getThread function', () => {
    it('should return correct payload when get called', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'A Thread Title',
        body: 'Body content of a thread.',
        owner: 'user-123',
      });
      const validThreadId = 'thread-123';
      const expectedResult = {
        id: 'thread-123',
        title: newThread.title,
        body: newThread.body,
        date: 'date',
        username: 'dicoding',
      };
      // repo and stub
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await threadRepositoryPostgres.addNewThread(newThread);

      // Pre-Assert
      const thread = await ThreadsTableTestHelper.findThreadsById(validThreadId);

      // Assert
      const result = await threadRepositoryPostgres.getThread(validThreadId);
      expect(thread).toHaveLength(1);
      expect(result.id).toBeDefined();
      expect(result.id).toBe(expectedResult.id);
      expect(result.title).toBeDefined();
      expect(result.title).toBe(expectedResult.title);
      expect(result.body).toBeDefined();
      expect(result.body).toBe(expectedResult.body);
      expect(result.date).toBeDefined();
      // cant compare date result because it dynamically generated
      // at exact time data is written on database
      expect(result.username).toBeDefined();
      expect(result.username).toBe(expectedResult.username);
    });
  });
});
