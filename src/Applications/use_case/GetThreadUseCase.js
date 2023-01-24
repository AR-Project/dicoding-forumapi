class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(parameter) {
    const _commentIds = [];

    if (!parameter) {
      throw new Error('GET_THREAD_USECASE.MISSING_PARAMS');
    }

    // prepare thread
    await this._threadRepository.verifyThread(parameter);
    const thread = await this._threadRepository.getThread(parameter);

    // prepare comments
    const rawComments = await this._commentRepository.getAllCommentsByThreadId(parameter);
    for (let i = 0; i < rawComments.length; i += 1) {
      _commentIds.push(rawComments[i].id);
    }
    thread.comments = this._sanitizeComments(rawComments); // modify thread object

    // prepare replies
    const rawReplies = await this._replyRepository.getAllRepliesByCommentIds(_commentIds);
    for (let i = 0; i < rawReplies.length; i += 1) {
      const currentReply = rawReplies[i];
      const commentIndex = thread.comments
        .findIndex((comment) => comment.id === currentReply.commentId);
      thread.comments[commentIndex].replies.push(this._sanitizeReply(currentReply));
    }

    return thread;
  }

  _sanitizeComments(comments) {
    return comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
      replies: [],
    }));
  }

  _sanitizeReply(reply) {
    return {
      id: reply.id,
      username: reply.username,
      date: reply.date,
      content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
    };
  }
}

module.exports = GetThreadUseCase;
