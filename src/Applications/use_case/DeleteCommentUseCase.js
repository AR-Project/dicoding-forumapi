class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, userId) {
    this._verifyParameter(threadId, commentId, userId);
    await this._threadRepository.verifyThread(threadId);
    await this._commentRepository.verifyComment(commentId);
    await this._commentRepository.verifyCommentOwner(commentId, userId);
    await this._commentRepository.deleteComment(commentId);
  }

  _verifyParameter(threadId, commentId, userId) {
    if (!threadId || !commentId || !userId) {
      throw new Error('DELETE_COMMENT_USECASE.MISSING_PARAM');
    }
  }
}

module.exports = DeleteCommentUseCase;
