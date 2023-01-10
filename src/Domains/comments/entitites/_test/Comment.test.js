const Comment = require('../Comment');

describe('Comment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    /** Correct payload, content, owner, threadId */

    // Arrange
    const missingContent = {
      owner: 'user-123',
      threadId: 'thread-123',
    };
    const missingOwner = {
      content: 'This is a comment with missing owner',
      threadId: 'thread-123',
    };
    const missingParent = {
      content: 'This is a comment with missing owner',
      owner: 'user-123',
    };
    // Action Assert
    expect(() => new Comment(missingContent)).toThrowError('COMMENT.MISSING_CONTENT');
    expect(() => new Comment(missingOwner)).toThrowError('COMMENT.MISSING_OWNER');
    expect(() => new Comment(missingParent)).toThrowError('COMMENT.MISSING_THREAD_ID');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const wrongTypeOf = {
      content: {},
      owner: 'user-123',
      threadId: 123,
    };

    expect(() => new Comment(wrongTypeOf)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Comment entity correctly', () => {
    const payload = {
      content: 'Comment inside correct payload',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const comment = new Comment(payload);

    expect(comment).toBeInstanceOf(Comment);
    expect(comment.content).toEqual(payload.content);
    expect(comment.owner).toEqual(payload.owner);
    expect(comment.threadId).toEqual(payload.threadId);
  });
});
