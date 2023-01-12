/* istanbul ignore file */
/* eslint-disable camelcase */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    owner = 'user-123',
    thread_id = 'thread-123',
    content = 'This is a comment',
    date = new Date().toISOString(),
    is_deleted = false,
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, owner, thread_id, content, date, is_deleted],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    // expected result is an array of rows
    return result.rows;
  },

  async findCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT * FROM comments WHERE thread_id = $1',
      values: [threadId],
    };
    const result = await pool.query(query);

    // expected result is an array of rows
    return result.rows;
  },

  async countTotalComments() {
    const result = await pool.query('SELECT COUNT(*) FROM comments');

    return parseInt(result.rows[0].count, 10);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
