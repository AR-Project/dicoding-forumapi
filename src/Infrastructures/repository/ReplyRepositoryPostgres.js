const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

const AddedReply = require('../../Domains/replies/entities/AddedReply');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(reply) {
    // Prepare data
    const { content, owner, commentId } = reply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDeleted = false;

    const query = {
      text: `
        INSERT INTO replies
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING id, content, owner
      `,
      values: [id, owner, commentId, content, date, isDeleted],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReply(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('balasan tidak ditemukan di database');
    }
  }

  async verifyReplyOwner(replyId, userId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('anda bukan pemilik balasan ini');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };
    await this._pool.query(query);
  }

  async getAllRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT replies.id, users.username, replies.date, replies.content, replies.is_deleted
        FROM replies
        LEFT JOIN users
          ON replies.owner = users.id
        WHERE replies.comment_id = $1
        ORDER BY replies.date ASC
      `,
      values: [commentId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
