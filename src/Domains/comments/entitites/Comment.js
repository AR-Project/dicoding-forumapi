class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.content = payload.content;
    this.owner = payload.owner;
    this.threadId = payload.threadId;
  }

  _verifyPayload(payload) {
    const { content, owner, threadId } = payload;

    if (!content) {
      throw new Error('COMMENT.MISSING_CONTENT');
    }
    if (!owner) {
      throw new Error('COMMENT.MISSING_OWNER');
    }
    if (!threadId) {
      throw new Error('COMMENT.MISSING_THREAD_ID');
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;
