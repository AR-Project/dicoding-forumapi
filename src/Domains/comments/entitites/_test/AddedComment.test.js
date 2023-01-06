const AddedComment = require('../AddedComment');

describe('Comment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    /** Correct payload, id, content, owner */

    // Arrange
    const missingContent = {
      id: 'thread-123',
      owner: 'user-123'
    }
    const missingOwner = {
      id: 'thread-123',
      content: 'This is a comment with missing owner',
    }
    const missingId = {
      content: 'This is a comment with missing owner',
      owner: 'user-123'
    }
    // Action Assert
    expect(() => new AddedComment(missingContent)).toThrowError('ADDED_COMMENT.MISSING_CONTENT');
    expect(() => new AddedComment(missingOwner)).toThrowError('ADDED_COMMENT.MISSING_OWNER');
    expect(() => new AddedComment(missingId)).toThrowError('ADDED_COMMENT.MISSING_COMMENT_ID');
  })

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const wrongTypeOf = {
      id: 123,
      content: {},
      owner: 'user-123',
    }

    expect(() => new AddedComment(wrongTypeOf)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');

  })

  it('should create Comment entity correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'Comment inside correct payload',
      owner: 'user-123',
    }

    const comment = new AddedComment(payload);

    expect(comment).toBeInstanceOf(AddedComment);
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual(payload.content);
    expect(comment.owner).toEqual(payload.owner);
  })
})
