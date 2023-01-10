const Reply = require('../Reply');

describe('Reply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    /** Correct payload, content, owner, commentId */

    // Arrange
    const missingContent = {
      owner: 'user-123',
      commentId: 'comment-123',
    };
    const missingOwner = {
      content: 'This is a reply with missing owner',
      commentId: 'comment-123',
    };
    const missingParent = {
      content: 'This is a reply with missing owner',
      owner: 'user-123',
    };
    // Action Assert
    expect(() => new Reply(missingContent)).toThrowError('REPLY.MISSING_CONTENT');
    expect(() => new Reply(missingOwner)).toThrowError('REPLY.MISSING_OWNER');
    expect(() => new Reply(missingParent)).toThrowError('REPLY.MISSING_COMMENT_ID');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const wrongTypeOf = {
      content: {},
      owner: 'user-123',
      commentId: 123,
    };

    expect(() => new Reply(wrongTypeOf)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Reply entity correctly', () => {
    const payload = {
      content: 'Reply inside correct payload',
      owner: 'user-123',
      commentId: 'comment-123',
    };

    const reply = new Reply(payload);

    expect(reply).toBeInstanceOf(Reply);
    expect(reply.content).toEqual(payload.content);
    expect(reply.owner).toEqual(payload.owner);
    expect(reply.commentId).toEqual(payload.commentId);
  });
});
