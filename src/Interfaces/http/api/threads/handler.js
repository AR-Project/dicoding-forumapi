const Credentials = require('../../../../Domains/authorization/entities/Credentials');

const AddNewThreadUseCase = require('../../../../Applications/use_case/AddNewThreadUseCase');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
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

  async deleteCommentHandler(request, h) {
    const userCredentials = new Credentials(request.auth.credentials);
    const {commentId, threadId} = request.params;

    // Invoke UseCase
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    // Action
    await deleteCommentUseCase.execute(threadId, commentId, userCredentials.id);
    return {
      status: 'success',
    }
  }
}

module.exports = ThreadHandler;
