const NewThread = require('../../Domains/threads/entities/NewThread')
const Credentials = require('../../Domains/authorization/entities/Credentials')

class AddNewThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, credentials) {
    // Sanitize credentials
    const newCredentials = new Credentials(credentials);
    const {id: owner} = newCredentials;

    // Sanitize thread payload
    const newThread = new NewThread({...useCasePayload, owner});

    // Action
    return this._threadRepository.addNewThread(newThread);
  }
}

module.exports = AddNewThreadUseCase;
