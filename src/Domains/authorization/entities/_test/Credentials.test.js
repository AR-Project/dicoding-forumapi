const Credentials = require('../Credentials');

describe('Credentials entities', () => {
  it('should throw error when credentials does not contain needed property', () => {
    // Arrange
    const credentials = {
      username: 'username',
    };

    expect(() => new Credentials(credentials)).toThrowError('CREDENTIALS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when credentials not meet data type specification', () => {
    // Arrange
    const credentials = {
      id: 123,
      username: 'username',
    };

    expect(() => new Credentials(credentials)).toThrowError('CREDENTIALS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create credentials entities correctly', () => {
    // Arrange
    const credentials = {
      id: 'user-123',
      username: 'username',
    };

    // Action
    const newCredentials = new Credentials(credentials);

    // Assert
    expect(newCredentials).toBeInstanceOf(Credentials);
    expect(newCredentials.id).toEqual(credentials.id);
    expect(newCredentials.username).toEqual(credentials.username);
  });
});
