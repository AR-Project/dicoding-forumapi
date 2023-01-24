const Credentials = require('../../../../Domains/authorization/entities/Credentials');

const AddNewThreadUseCase = require('../../../../Applications/use_case/AddNewThreadUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const userCredentials = new Credentials(request.auth.credentials);

    const addNewThreadUseCase = this._container.getInstance(AddNewThreadUseCase.name);

    const addedThread = await addNewThreadUseCase.execute(request.payload, userCredentials.id);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);

    return response;
  }

  async getThreadHandler(request) {
    const { threadId } = request.params;

    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);

    const thread = await getThreadUseCase.execute(threadId);

    return {
      status: 'success',
      data: {
        thread,
      },
    };
  }
}

module.exports = ThreadHandler;
