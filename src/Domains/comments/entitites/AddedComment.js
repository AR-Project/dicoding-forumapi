class AddedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.content = payload.content;
    this.owner = payload.owner;
  }

  _verifyPayload(payload) {
    const { content, owner, id } = payload;

    if (!id) {
      throw new Error('ADDED_COMMENT.MISSING_COMMENT_ID');
    }
    if (!content) {
      throw new Error('ADDED_COMMENT.MISSING_CONTENT');
    }
    if (!owner) {
      throw new Error('ADDED_COMMENT.MISSING_OWNER');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddedComment;
