const AddedReply = require('../AddedReply');

describe('Reply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    /** Correct payload, id, content, owner */

    // Arrange
    const missingContent = {
      id: 'comment-123',
      owner: 'user-123',
    };
    const missingOwner = {
      id: 'comment-123',
      content: 'This is a reply with missing owner',
    };
    const missingId = {
      content: 'This is a reply with missing owner',
      owner: 'user-123',
    };
    // Action Assert
    expect(() => new AddedReply(missingContent)).toThrowError('ADDED_REPLY.MISSING_CONTENT');
    expect(() => new AddedReply(missingOwner)).toThrowError('ADDED_REPLY.MISSING_OWNER');
    expect(() => new AddedReply(missingId)).toThrowError('ADDED_REPLY.MISSING_REPLY_ID');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const wrongTypeOf = {
      id: 123,
      content: {},
      owner: 'user-123',
    };

    expect(() => new AddedReply(wrongTypeOf)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create reply entity correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'reply inside correct payload',
      owner: 'user-123',
    };

    const reply = new AddedReply(payload);

    expect(reply).toBeInstanceOf(AddedReply);
    expect(reply.id).toEqual(payload.id);
    expect(reply.content).toEqual(payload.content);
    expect(reply.owner).toEqual(payload.owner);
  });
});
