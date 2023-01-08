const AddNewThreadUseCase = require('../../../../Applications/use_case/AddNewThreadUseCase');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const Credentials = require('../../../../Domains/authorization/entities/Credentials')

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    // Store incoming information
    const userCredentials = new Credentials(request.auth.credentials);

    // Invoke UseCase
    const addNewThreadUseCase  = this._container.getInstance(AddNewThreadUseCase.name);

    // Action!!
    const addedThread = await addNewThreadUseCase.execute(request.payload, userCredentials.id)

    // Arrange response
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      }
    });
    response.code(201);

    // Bye, bye love you.
    return response;
  }

  async postCommentHandler(request, h) {
    // Store incoming information
    const userCredentials = new Credentials(request.auth.credentials);
    const {threadId} = request.params;
  
    // Invoke UseCase
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    // Action!!
    const addedComment = await addCommentUseCase.execute(request.payload, userCredentials.id, threadId)
    
    // Arrange response
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      }
    })
    response.code(201);

    // Bye, bye love you.
    return response;
  }
}

module.exports = ThreadHandler;
