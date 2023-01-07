const CommentRepository = require("../../Domains/comments/CommentsRepository");

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
}

module.exports = CommentRepositoryPostgres;