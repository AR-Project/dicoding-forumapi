const Credentials = require('../../../../Domains/authorization/entities/Credentials');

const AddNewThreadUseCase = require('../../../../Applications/use_case/AddNewThreadUseCase');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');
const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
    this.addReplyHandler = this.addReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    // Store incoming information
    const userCredentials = new Credentials(request.auth.credentials);

    // Invoke UseCase
    const addNewThreadUseCase = this._container.getInstance(AddNewThreadUseCase.name);

    // Action!!
    const addedThread = await addNewThreadUseCase.execute(request.payload, userCredentials.id);

    // Arrange response
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);

    // Bye, bye love you.
    return response;
  }

  async postCommentHandler(request, h) {
    // Store incoming information
    const userCredentials = new Credentials(request.auth.credentials);
    const { threadId } = request.params;

    // Invoke UseCase
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    // Action!!
    const addedComment = await addCommentUseCase
      .execute(request.payload, userCredentials.id, threadId);

    // Arrange response
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);

    // Bye, bye love you.
    return response;
  }

  async deleteCommentHandler(request) {
    const userCredentials = new Credentials(request.auth.credentials);
    const { commentId, threadId } = request.params;

    // Invoke UseCase
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    // Action
    await deleteCommentUseCase.execute(threadId, commentId, userCredentials.id);
    return {
      status: 'success',
    };
  }

  async getThreadHandler(request) {
    const { threadId } = request.params;

    // Invoke UseCase
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);

    // Action
    const thread = await getThreadUseCase.execute(threadId);

    // Bye, bye love you
    return {
      status: 'success',
      data: {
        thread,
      },
    };
  }

  async addReplyHandler(request, h) {
    const userCredentials = new Credentials(request.auth.credentials);
    const {threadId, commentId} = request.params;

    // Invoke use case
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);

    // Action 
    const addedReply = await addReplyUseCase
      .execute(request.payload, userCredentials.id, threadId, commentId);

    // Arrange response
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);

    // Bye, bye love you.
    return response;
  }

  async deleteReplyHandler(request, h) {
    const userCredentials = new Credentials(request.auth.credentials);
    const {threadId, commentId, replyId} = request.params;

    // Invoke Use Case
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);

    // Action
    await deleteReplyUseCase.execute(replyId, commentId, threadId, userCredentials.id);

    return {
      status: 'success'
    }
  }
}

module.exports = ThreadHandler;
