const NewThread = require('../NewThread');

describe('New Thread entities', () => {
  it('should throw error when payload does not containe needed property', () => {
    // Arange  
    // Correct payload title and body
    const payload = {
      title: 'This is Thread Title inside incorrect payload'
    }

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  })

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 'Title inside incorrect Payload',
      body: 12345,
      owner: {},
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create UserLogin entities correctly', () => {
    // Arrange
    const payload = {
      title: 'Title Inside Correct Payload',
      body: 'Body Content inside correct payload.',
      owner: 'user-123'
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread).toBeInstanceOf(NewThread);
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread.owner).toEqual(payload.owner);
  });

})