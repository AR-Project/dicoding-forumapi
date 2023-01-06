// Postgress pool
const pool = require('../../database/postgres/pool');

// Table Helper
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

// entities
const NewThread = require('../../../Domains/threads/entities/NewThread')
const AddedThread = require('../../../Domains/threads/entities/AddedThread')

// Repository
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres')

describe('ThreadRepositoryPostgress', () =>{
  beforeEach(async () => {
    const user = {
      id : 'user-123', 
      username : 'dicoding', 
      password : 'secret', 
      fullname : 'Dicoding Indonesia',
    }
    await UsersTableTestHelper.addUser({...user});
  })

  
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  })

  afterAll(async () => {
    await pool.end();
  })

  describe('addNewThread function', () => {
    it('should persist new thread and return added thread correctly', async () =>{
      // Arrange
      const newThread = new NewThread({
        title: 'A Thread Title',
        body: 'Body content of a thread.',
        owner: 'user-123'
      })
      const fakeIdGenerator = () => '123'
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action 
      await threadRepositoryPostgres.addNewThread(newThread);
      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');

      // Assert 
      expect(thread).toHaveLength(1);
    })

    it('should return addedThread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'A Thread Title',
        body: 'Body content of a thread.',
        owner: 'user-123'
      })
      const fakeIdGenerator = () => '123'
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action 
      const addedThread = await threadRepositoryPostgres.addNewThread(newThread);
      
      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: newThread.title,
        owner: newThread.owner
      }))
    })

  })
})
