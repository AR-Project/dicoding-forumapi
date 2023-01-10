const NewThread = require('../../Domains/threads/entities/NewThread');

class AddNewThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, ownerId) {
    // Sanitize
    this._verifyOwnerId(ownerId);
    const newThread = new NewThread({ ...useCasePayload, owner: ownerId });

    // Action
    return this._threadRepository.addNewThread(newThread);
  }

  _verifyOwnerId(id) {
    if (!id) {
      throw new Error('ADD_NEW_THREAD.MISSING_AUTHENTICATION');
    }
    if (typeof id !== 'string') {
      throw new Error('ADD_NEW_THREAD.ID_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddNewThreadUseCase;
