const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    owner = 'user-123',
    commentId = 'comment-123',
    content = 'This is a reply.',
    date = new Date().toISOString(),
    isDeleted = false,
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, owner, commentId, content, date, isDeleted],
    };

    await pool.query(query)
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async findRepliesByCommentId(commentId) {
    const query = {
      text: 'SELECT * FROM replies WHERE comment_id = $1',
      values: [commentId],
    };
    const result = await pool.query(query);

    return result.rows;
  },

  async countTotalReplies() {
    const result = await pool.query('SELECT COUNT(*) FROM replies');

    return parseInt(result.rows[0].count, 10);
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },

}

module.exports = RepliesTableTestHelper;
