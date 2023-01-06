// postThreadHandler

const AddNewThreadUseCase = require('../../../../Applications/use_case/AddNewThreadUseCase');
const Credentials = require('../../../../Domains/authorization/entities/Credentials')

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const userCredentials = new Credentials(request.auth.credentials);
    // console.log(userCredentials);
    const addNewThreadUseCase  = this._container.getInstance(AddNewThreadUseCase.name);
    const addedThread = await addNewThreadUseCase.execute(request.payload, userCredentials.id)
    // console.log(request.payload);
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      }
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadHandler;