const Credentials = require('../../../../Domains/authorization/entities/Credentials');

const ChangeCommentLikeUseCase = require('../../../../Applications/use_case/ChangeCommentLikeUseCase');

class CommentLikeHandler {
  constructor(container) {
    this._container = container;

    this.commentLikeHandler = this.commentLikeHandler.bind(this);
  }

  async commentLikeHandler(request) {
    const userCredentials = new Credentials(request.auth.credentials);
    const { threadId, commentId } = request.params;

    const changeCommentLikeUseCase = this._container.getInstance(ChangeCommentLikeUseCase.name);

    await changeCommentLikeUseCase.execute(userCredentials.id, commentId, threadId);

    return {
      status: 'success',
    };
  }
}

module.exports = CommentLikeHandler;
