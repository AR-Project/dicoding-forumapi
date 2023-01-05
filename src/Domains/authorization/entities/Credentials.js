class Credentials {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
  }

  _verifyPayload(payload) {
    const {id, username} = payload;

    if (!id || !username) {
      throw new Error('CREDENTIALS.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof id !== 'string' || typeof username !== 'string') {
      throw new Error ('CREDENTIALS.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = Credentials;