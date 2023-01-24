const Credentials = require('../../../../Domains/authorization/entities/Credentials');

const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class ReplyHandler {
  constructor(container) {
    this._container = container;

    this.addReplyHandler = this.addReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async addReplyHandler(request, h) {
    const userCredentials = new Credentials(request.auth.credentials);
    const { threadId, commentId } = request.params;

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

  async deleteReplyHandler(request) {
    const userCredentials = new Credentials(request.auth.credentials);
    const { threadId, commentId, replyId } = request.params;

    // Invoke Use Case
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);

    // Action
    await deleteReplyUseCase.execute(replyId, commentId, threadId, userCredentials.id);

    return {
      status: 'success',
    };
  }
}

module.exports = ReplyHandler;
