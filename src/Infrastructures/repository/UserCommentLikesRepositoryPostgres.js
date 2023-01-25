const UserCommentLikesRepository = require('../../Domains/userCommentLikes/UserCommentLikesRepository');

class UserCommentLikesRepositoryPostgres extends UserCommentLikesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async currentLikeStatus(userId, commentId) {
    const query = {
      text: `
        SELECT COUNT(*) 
        FROM user_comment_likes
        WHERE user_id = $1 AND comment_id = $2`,
      values: [userId, commentId],
    };
    const result = await this._pool.query(query);

    if (result.rows[0].count === '1') { // '0' == likes is NOT found
      return true;
    }
    return false;
  }

  async addLike(userId, commentId) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO user_comment_likes VALUES ($1, $2, $3)',
      values: [id, userId, commentId],
    };

    await this._pool.query(query);
  }

  async removeLike(userId, commentId) {
    const query = {
      text: `
        DELETE
        FROM user_comment_likes
        WHERE user_id = $1 AND comment_id = $2`,
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async getLikesNumberByCommentIds(commentIds) {
    const query = {
      text: `
        SELECT comment_id, COUNT(*)
        FROM user_comment_likes
        WHERE comment_id = ANY($1::text[])
        GROUP BY comment_id
        ORDER BY comment_id ASC`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    const mappedResult = result.rows.map((row) => ({
      commentId: row.comment_id,
      count: parseInt(row.count, 10),
    }));

    return mappedResult;
  }
}

module.exports = UserCommentLikesRepositoryPostgres;
