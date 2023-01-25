/* istanbul ignore file */
/* eslint-disable camelcase */
const pool = require('../src/Infrastructures/database/postgres/pool');

const UserCommentsLikesTableTestHelper = {
  async addCommentLikes({
    id = 'like-123',
    user_id = 'user-123',
    comment_id = 'comment-123',
  }) {
    const query = {
      text: 'INSERT INTO user_comment_likes VALUES ($1, $2, $3)',
      values: [id, user_id, comment_id],
    };

    await pool.query(query);
  },

  async findCommentLikesById(id) {
    const query = {
      text: 'SELECT * FROM user_comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
  async findCommentLikesByCommentId(comment_id) {
    const query = {
      text: 'SELECT * FROM user_comment_likes WHERE comment_id = $1',
      values: [comment_id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async countTotalLikes() {
    const result = await pool.query('SELECT COUNT(*) FROM user_comment_likes');

    return parseInt(result.rows[0].count, 10);
  },

  async cleanTable() {
    await pool.query('DELETE FROM user_comment_likes WHERE 1=1');
  },

};

module.exports = UserCommentsLikesTableTestHelper;
