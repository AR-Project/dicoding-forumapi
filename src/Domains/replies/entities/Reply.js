class Reply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.content = payload.content;
    this.owner = payload.owner;
    this.commentId = payload.commentId;
  }

  _verifyPayload(payload) {
    const { content, owner, commentId } = payload;

    if (!content) {
      throw new Error('REPLY.MISSING_CONTENT');
    }
    if (!owner) {
      throw new Error('REPLY.MISSING_OWNER');
    }
    if (!commentId) {
      throw new Error('REPLY.MISSING_COMMENT_ID');
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof commentId !== 'string') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
