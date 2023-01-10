const Reply = require('../../Domains/replies/entities/Reply');

class AddReplyUseCase {
  constructor({replyRepository, commentRepository, threadRepository}) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, ownerId, threadId, commentId) {
    // verify parameter
    this._verifyParameter(ownerId, threadId, commentId);

    // verify thread and comment existence
    await this._threadRepository.verifyThread(threadId);
    await this._commentRepository.verifyComment(commentId);

    // verify needed payload 
    const reply = new Reply({
      content: useCasePayload.content,
      owner: ownerId,
      commentId,
    })

    return this._replyRepository.addReply(reply);
  }

  _verifyParameter(ownerId, threadId, commentId) {
    if (!ownerId || !threadId || !commentId) {
      throw new Error('REPLY_COMMENT_USECASE.MISSING_PARAMETER')
    }
  }
}

module.exports = AddReplyUseCase;
