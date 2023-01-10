const AddedThread = require('../AddedThread');

describe('Added Thread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange - correct payload id, title, owner
    const payload = {
      id: 'thread-123',
      title: 'Title Inside Incorrect Payload',
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange - correct payload id, title, owner
    const payload = {
      id: {},
      title: 'Title Inside Incorrect Payload',
      owner: 12345,
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create UserLogin entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Title Inside Correct Payload.',
      owner: 'user-123',
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread).toBeInstanceOf(AddedThread);
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
