class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(replyId, commentId, threadId, userId) {
    this._verifyParameter(replyId, commentId, threadId, userId);
    await this._threadRepository.verifyThread(threadId);
    await this._commentRepository.verifyComment(commentId);
    await this._replyRepository.verifyReply(threadId);
    await this._replyRepository.verifyReplyOwner(replyId, userId);
    await this._replyRepository.deleteReply(replyId);
  }

  _verifyParameter(replyId, commentId, threadId, userId) {
    if (!replyId || !threadId || !commentId || !userId) {
      throw new Error('DELETE_REPLY_USECASE.MISSING_PARAM')
    }
  }
}

module.exports = DeleteReplyUseCase;
