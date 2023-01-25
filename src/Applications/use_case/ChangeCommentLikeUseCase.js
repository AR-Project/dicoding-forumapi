class ChangeCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, userCommentLikesRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._userCommentLikesRepository = userCommentLikesRepository;
  }

  async execute(userId, commentId, threadId) {
    this._verifyParameter(userId, commentId, threadId);
    await this._threadRepository.verifyThread(threadId);
    await this._commentRepository.verifyComment(commentId);
    const result = await this._userCommentLikesRepository.currentLikeStatus(userId, commentId);
    if (result === true) {
      await this._userCommentLikesRepository.removeLike(userId, commentId);
    }

    if (result === false) {
      await this._userCommentLikesRepository.addLike(userId, commentId);
    }
  }

  _verifyParameter(userId, commentId, threadId) {
    if (!userId || !commentId || !threadId) {
      throw new Error('CHANGE_LIKE_USECASE.MISSING_PARAM');
    }
  }
}

module.exports = ChangeCommentLikeUseCase;
