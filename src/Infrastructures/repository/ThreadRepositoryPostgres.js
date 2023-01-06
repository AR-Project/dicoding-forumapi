const ThreadRepository = require('../../Domains/threads/ThreadRepository')

const AddedThread = require('../../Domains/threads/entities/AddedThread')

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addNewThread(newThread) {
    // prepare data
    const { title, body, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: `
      INSERT INTO threads
      VALUES($1, $2, $3, $4, $5)
      RETURNING id, title, owner
      `,
      values: [id, owner, title, body, date]
    }
    // Action
    const result = await this._pool.query(query);

    // Return data as specification
    return new AddedThread({ ...result.rows[0]})
  }
}

module.exports = ThreadRepositoryPostgres;
