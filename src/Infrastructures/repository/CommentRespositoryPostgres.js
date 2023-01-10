const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const CommentRepository = require("../../Domains/comments/CommentRepository");

const AddedComment = require('../../Domains/comments/entitites/AddedComment')

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment){
    // Prepare data
    const {content, owner, threadId } = comment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDeleted = false;
    const query = {
      text: `
      INSERT INTO comments
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id, content, owner`,
      values: [id, owner, threadId, content, date, isDeleted]
    };

    const result = await this._pool.query(query);
    return new AddedComment({...result.rows[0]})
  }

  async verifyComment(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId]
    }

    const result = await this._pool.query(query);
    
    if (result.rows.length === 0) {
      throw new NotFoundError('comment tidak ditemukan di database')
    }
  }

  async verifyCommentOwner(commentId, userId) {
    const query = {
      text: 'SELECT owner FROM comments where id = $1',
      values: [commentId]
    }

    const result = await this._pool.query(query);
    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('anda bukan pemilik comment ini')
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [commentId],
    }
    await this._pool.query(query);
  }

  async getAllCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT comments.id, users.username, comments.date, comments.content, comments.is_deleted
        FROM comments 
        LEFT JOIN users
          ON comments.owner = users.id
        WHERE comments.thread_id = $1
        ORDER BY comments.date DESC`,
      values: [threadId]
    }

    const result = await this._pool.query(query);
    return result.rows
  }
}

module.exports = CommentRepositoryPostgres;
